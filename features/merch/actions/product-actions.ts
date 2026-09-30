"use server"

import { db } from "@/db"
import { merch_categories, merch_products, merch_product_sizes, merch_product_variants, merch_product_images } from "@/db/schema"
import { eq, count, ilike, and, desc, inArray } from "drizzle-orm"
import { requireAdmin, revalidateAll } from "./_guards"
import { ProductFormData, ProductQueryParams } from "../types"
import { deleteImageFromCloudinary } from "./upload-actions"
import { recordAuditLog } from "./audit-log-actions"

import { formatPriceRange } from "../utils"
import {
  getRemovedImageUrls,
  insertProduct,
  updateProductData,
  validateProductPayload,
} from "./product-core"

export async function getAdminProducts({
  page = 1,
  pageSize = 10,
  search = "",
  categoryId,
  availability,
}: ProductQueryParams = {}) {
  await requireAdmin();

  const conditions = [];

  if (search) {
    conditions.push(ilike(merch_products.name, `%${search}%`));
  }
  if (categoryId) {
    conditions.push(eq(merch_products.categoryId, categoryId));
  }
  if (availability) {
    conditions.push(eq(merch_products.availabilityType, availability));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const baseQuery = db
    .select({
      id: merch_products.id,
      categoryId: merch_products.categoryId,
      categoryName: merch_categories.name,
      name: merch_products.name,
      description: merch_products.description,
      price: merch_products.price,
      hasSizes: merch_products.hasSizes,
      hasVariants: merch_products.hasVariants,
      stock: merch_products.stock,
      availabilityType: merch_products.availabilityType,
      createdAt: merch_products.createdAt,
    })
    .from(merch_products)
    .leftJoin(merch_categories, eq(merch_products.categoryId, merch_categories.id))
    .where(where)
    .orderBy(desc(merch_products.createdAt));

  const countQuery = db
    .select({ total: count(merch_products.id) })
    .from(merch_products)
    .where(where);

  let rawProducts;
  let total;

  if (pageSize === "ALL") {
    const [productsRes, [{ total: totalRes }]] = await Promise.all([
      baseQuery,
      countQuery,
    ]);
    rawProducts = productsRes;
    total = totalRes;
  } else {
    const offset = (page - 1) * pageSize;
    const [productsRes, [{ total: totalRes }]] = await Promise.all([
      baseQuery.limit(pageSize).offset(offset),
      countQuery,
    ]);
    rawProducts = productsRes;
    total = totalRes;
  }

  const productIds = rawProducts.map((p) => p.id);
  let allImages: { productId: number; imageUrl: string }[] = [];

  if (productIds.length > 0) {
    allImages = await db
      .select({ productId: merch_product_images.productId, imageUrl: merch_product_images.imageUrl })
      .from(merch_product_images)
      .where(inArray(merch_product_images.productId, productIds))
      .orderBy(merch_product_images.displayOrder);
  }

  let allVariants: { productId: number; price: number | null }[] = [];
  if (productIds.length > 0) {
    allVariants = await db
      .select({ productId: merch_product_variants.productId, price: merch_product_variants.price })
      .from(merch_product_variants)
      .where(inArray(merch_product_variants.productId, productIds));
  }

  const products = rawProducts.map((p) => {
    const variants = allVariants.filter((v) => v.productId === p.id);
    const range = p.hasVariants ? formatPriceRange(p.price, variants) : null;
    return {
      ...p,
      images: allImages.filter((img) => img.productId === p.id).map((img) => img.imageUrl),
      priceFrom: range?.from ?? null,
      priceTo: range?.to ?? null,
    };
  });

  return { products, total };
}

export async function getAdminProductById(id: number) {
  await requireAdmin();

  const [product] = await db
    .select({
      id: merch_products.id,
      categoryId: merch_products.categoryId,
      categoryName: merch_categories.name,
      name: merch_products.name,
      description: merch_products.description,
      price: merch_products.price,
      hasSizes: merch_products.hasSizes,
      hasVariants: merch_products.hasVariants,
      stock: merch_products.stock,
      availabilityType: merch_products.availabilityType,
      createdAt: merch_products.createdAt,
    })
    .from(merch_products)
    .leftJoin(merch_categories, eq(merch_products.categoryId, merch_categories.id))
    .where(eq(merch_products.id, id))
    .limit(1);

  if (!product) return null;

  const images = await db
    .select({ imageUrl: merch_product_images.imageUrl })
    .from(merch_product_images)
    .where(eq(merch_product_images.productId, id))
    .orderBy(merch_product_images.displayOrder);

  const sizes = await db
    .select({ id: merch_product_sizes.id, sizeName: merch_product_sizes.sizeName, stock: merch_product_sizes.stock })
    .from(merch_product_sizes)
    .where(eq(merch_product_sizes.productId, id));

  const variants = await db
    .select({
      id: merch_product_variants.id,
      name: merch_product_variants.name,
      price: merch_product_variants.price,
      stock: merch_product_variants.stock,
      imageUrl: merch_product_variants.imageUrl,
    })
    .from(merch_product_variants)
    .where(eq(merch_product_variants.productId, id));

  return {
    ...product,
    images: images.map((i) => i.imageUrl),
    sizes,
    variants,
  };
}

export async function getProductSizes(productId: number) {
  await requireAdmin();
  const sizes = await db
    .select({
      sizeName: merch_product_sizes.sizeName,
      stock: merch_product_sizes.stock,
    })
    .from(merch_product_sizes)
    .where(eq(merch_product_sizes.productId, productId));
  
  return sizes;
}

export async function createProduct(data: ProductFormData) {
  const user = await requireAdmin();
  const adminName = user.name || "Admin";

  const validationError = validateProductPayload(data);
  if (validationError) return { error: validationError };

  let insertedProductId: number | null = null;

  try {
    insertedProductId = await insertProduct(data, null);

    await recordAuditLog(
      user.id!,
      "product",
      insertedProductId,
      "CREATE",
      `${adminName} menambahkan produk "${data.name}"`
    );
  } catch {
    if (insertedProductId) {
      // Rollback: Cloudinary -> Database
      for (const url of data.images) {
        try {
          await deleteImageFromCloudinary(url);
        } catch (cloudinaryErr) {
          console.error("Gagal menghapus gambar saat rollback:", cloudinaryErr);
        }
      }
      try {
        await db.delete(merch_products).where(eq(merch_products.id, insertedProductId));
      } catch {
        return { error: "Gagal menyimpan data DAN gagal membatalkan produk. Terdapat produk sisa (orphan), mohon cek manual." };
      }
      return { error: "Gagal menyimpan ukuran atau gambar. Produk berhasil dibatalkan." };
    }
    return { error: "Terjadi kesalahan saat menambahkan produk." };
  }

  revalidateAll();
}

export async function updateProduct(id: number, data: ProductFormData) {
  const user = await requireAdmin();
  const adminName = user.name || "Admin";

  const validationError = validateProductPayload(data);
  if (validationError) return { error: validationError };

  try {
    const [oldProduct] = await db.select().from(merch_products).where(eq(merch_products.id, id)).limit(1);
    if (!oldProduct) return { error: "Produk tidak ditemukan." };

    // Hapus gambar (produk & varian) yang sudah tidak dipakai dari Cloudinary
    const removed = await getRemovedImageUrls(id, data);
    for (const url of [...removed.productImages, ...removed.variantImages]) {
      await deleteImageFromCloudinary(url).catch(console.error);
    }

    await updateProductData(id, data);

    const changes = [];
    if (oldProduct.name !== data.name) changes.push(`Nama (${oldProduct.name} -> ${data.name})`);
    if (oldProduct.price !== data.price) changes.push(`Harga (Rp${oldProduct.price} -> Rp${data.price})`);
    if (oldProduct.hasSizes !== data.hasSizes) changes.push(`Ukuran (${oldProduct.hasSizes} -> ${data.hasSizes})`);
    if (oldProduct.hasVariants !== data.hasVariants) changes.push(`Varian (${oldProduct.hasVariants} -> ${data.hasVariants})`);
    if (!data.hasSizes && !data.hasVariants && oldProduct.stock !== data.stock) changes.push(`Stok (${oldProduct.stock} -> ${data.stock})`);

    const changesText = changes.length > 0 ? changes.join(", ") : "Tidak ada perubahan";

    await recordAuditLog(
      user.id!,
      "product",
      id,
      "UPDATE",
      `${adminName} memperbarui produk "${oldProduct.name}". Perubahan: ${changesText}`
    );
  } catch {
    return { error: "Terjadi kesalahan saat memperbarui produk." };
  }

  revalidateAll();
}

export async function deleteProduct(id: number) {
  return deleteManyProducts([id]);
}

export async function deleteManyProducts(ids: number[]) {
  const user = await requireAdmin();
  const adminName = user.name || "Admin";

  if (ids.length === 0) return { error: "Tidak ada produk yang dipilih." };

  try {
    const products = await db
      .select({ id: merch_products.id, name: merch_products.name })
      .from(merch_products)
      .where(inArray(merch_products.id, ids));

    if (products.length === 0) return { error: "Produk tidak ditemukan." };

    const foundIds = products.map((p) => p.id);

    const images = await db
      .select({ imageUrl: merch_product_images.imageUrl })
      .from(merch_product_images)
      .where(inArray(merch_product_images.productId, foundIds));

    const variantImages = await db
      .select({ imageUrl: merch_product_variants.imageUrl })
      .from(merch_product_variants)
      .where(inArray(merch_product_variants.productId, foundIds));

    for (const img of [...images, ...variantImages]) {
      if (img.imageUrl) await deleteImageFromCloudinary(img.imageUrl).catch(console.error);
    }

    await db.delete(merch_products).where(inArray(merch_products.id, foundIds));

    for (const product of products) {
      await recordAuditLog(
        user.id!,
        "product",
        product.id,
        "DELETE",
        `${adminName} menghapus produk "${product.name}"`
      );
    }
  } catch {
    return { error: "Gagal menghapus produk atau gambar terkait dari Cloudinary." };
  }

  revalidateAll();
}
