import { db } from "@/db";
import {
  merch_product_images,
  merch_product_sizes,
  merch_product_variants,
  merch_products,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { calculateAvailability } from "../utils";
import type { ProductFormData } from "../types";

/**
 * Validasi payload produk. Mengembalikan pesan error atau null bila valid.
 */
export function validateProductPayload(data: ProductFormData): string | null {
  if (!data.name?.trim()) return "Nama produk wajib diisi.";
  if (data.price == null || data.price <= 0) return "Harga produk harus lebih besar dari 0.";
  if (!data.images || data.images.length === 0) return "Minimal upload 1 foto produk.";

  if (data.hasSizes) {
    if (!data.sizes || data.sizes.length === 0) {
      return "Produk dengan ukuran harus memiliki minimal 1 varian ukuran.";
    }
    const sizeNames = data.sizes.map((s) => s.sizeName.toLowerCase());
    if (new Set(sizeNames).size !== sizeNames.length) {
      return "Terdapat nama ukuran yang duplikat. Nama ukuran harus unik.";
    }
  }

  if (data.hasVariants) {
    if (!data.variants || data.variants.length === 0) {
      return "Produk dengan varian harus memiliki minimal 1 varian.";
    }
    const variantNames = data.variants.map((v) => v.name.toLowerCase());
    if (variantNames.some((n) => n === "")) {
      return "Terdapat nama varian yang masih kosong.";
    }
    if (new Set(variantNames).size !== variantNames.length) {
      return "Terdapat nama varian yang duplikat. Nama varian harus unik.";
    }
  }

  return null;
}

export function computeStockAndAvailability(data: ProductFormData) {
  const totalVariantStock = (data.variants || []).reduce(
    (sum, v) => sum + (v.stock === "" ? 0 : Number(v.stock)),
    0,
  );
  const finalStock = data.hasVariants
    ? totalVariantStock
    : data.hasSizes
      ? null
      : (data.stock ?? 0);
  const availabilityType = data.hasVariants
    ? data.forcePreorder
      ? "preorder"
      : totalVariantStock > 0
        ? "ready"
        : "out_of_stock"
    : calculateAvailability(data.hasSizes, data.stock, data.forcePreorder);

  return { finalStock, availabilityType } as const;
}

function sizeValuesFor(productId: number, data: ProductFormData) {
  return (data.sizes || []).map((s) => ({
    productId,
    sizeName: s.sizeName,
    stock: s.stock === "" ? 0 : s.stock,
  }));
}

function variantValuesFor(productId: number, data: ProductFormData) {
  return (data.variants || []).map((v) => ({
    productId,
    name: v.name,
    price: v.price === "" || v.price == null ? null : Number(v.price),
    stock: v.stock === "" ? 0 : Number(v.stock),
    imageUrl: v.imageUrl && v.imageUrl.trim() !== "" ? v.imageUrl.trim() : null,
  }));
}

/**
 * Insert produk baru beserta gambar/ukuran/varian. Melempar error bila gagal
 * (caller bertanggung jawab rollback gambar Cloudinary + record produk).
 * Kembalikan id produk yang dibuat.
 */
export async function insertProduct(
  data: ProductFormData,
  ownerId: string | null,
): Promise<number> {
  const { finalStock, availabilityType } = computeStockAndAvailability(data);

  const [product] = await db
    .insert(merch_products)
    .values({
      userId: ownerId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      hasSizes: data.hasSizes,
      hasVariants: data.hasVariants,
      stock: finalStock,
      availabilityType,
    })
    .returning({ id: merch_products.id });

  const imageValues = data.images.map((url, index) => ({
    productId: product.id,
    imageUrl: url,
    displayOrder: index + 1,
  }));
  await db.insert(merch_product_images).values(imageValues);

  if (data.hasSizes && data.sizes && data.sizes.length > 0) {
    await db.insert(merch_product_sizes).values(sizeValuesFor(product.id, data));
  }

  if (data.hasVariants && data.variants && data.variants.length > 0) {
    await db.insert(merch_product_variants).values(variantValuesFor(product.id, data));
  }

  return product.id;
}

/**
 * Update produk + ganti child rows secara atomik (transaction).
 */
export async function updateProductData(id: number, data: ProductFormData) {
  const { finalStock, availabilityType } = computeStockAndAvailability(data);
  const imageValues = data.images.map((url, index) => ({
    productId: id,
    imageUrl: url,
    displayOrder: index + 1,
  }));

  await db.transaction(async (tx) => {
    await tx
      .update(merch_products)
      .set({
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        hasSizes: data.hasSizes,
        hasVariants: data.hasVariants,
        stock: finalStock,
        availabilityType,
        updatedAt: sql`now()`,
      })
      .where(eq(merch_products.id, id));

    await tx.delete(merch_product_images).where(eq(merch_product_images.productId, id));
    await tx.insert(merch_product_images).values(imageValues);

    await tx.delete(merch_product_sizes).where(eq(merch_product_sizes.productId, id));
    if (data.hasSizes && data.sizes && data.sizes.length > 0) {
      await tx.insert(merch_product_sizes).values(sizeValuesFor(id, data));
    }

    await tx.delete(merch_product_variants).where(eq(merch_product_variants.productId, id));
    if (data.hasVariants && data.variants && data.variants.length > 0) {
      await tx.insert(merch_product_variants).values(variantValuesFor(id, data));
    }
  });
}

/**
 * URL gambar (produk & varian) yang dihapus dari form, untuk dibersihkan dari Cloudinary.
 */
export async function getRemovedImageUrls(id: number, data: ProductFormData) {
  const [oldImages, oldVariantImages] = await Promise.all([
    db
      .select({ imageUrl: merch_product_images.imageUrl })
      .from(merch_product_images)
      .where(eq(merch_product_images.productId, id)),
    db
      .select({ imageUrl: merch_product_variants.imageUrl })
      .from(merch_product_variants)
      .where(eq(merch_product_variants.productId, id)),
  ]);

  const newImageSet = new Set(data.images);
  const newVariantImageSet = new Set(
    (data.variants || [])
      .map((v) => v.imageUrl)
      .filter((url): url is string => !!url && url.trim() !== ""),
  );

  return {
    productImages: oldImages.map((i) => i.imageUrl).filter((url) => !newImageSet.has(url)),
    variantImages: oldVariantImages
      .map((v) => v.imageUrl)
      .filter((url): url is string => !!url && !newVariantImageSet.has(url)),
  };
}
