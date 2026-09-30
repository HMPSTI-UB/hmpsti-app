"use server";

import { db } from "@/db";
import {
  merch_categories,
  merch_product_images,
  merch_product_variants,
  merch_products,
} from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireMerchant, revalidateAll } from "./_guards";
import { deleteImageFromCloudinary } from "@/features/merch/actions/upload-actions";
import { recordAuditLog } from "@/features/merch/actions/audit-log-actions";
import {
  getRemovedImageUrls,
  insertProduct,
  updateProductData,
  validateProductPayload,
} from "@/features/merch/actions/product-core";
import { formatPriceRange } from "@/features/merch/utils";
import type { ProductFormData } from "@/features/merch/types";

export async function getMyProducts() {
  const user = await requireMerchant();

  const rawProducts = await db
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
    .where(eq(merch_products.userId, user.id!))
    .orderBy(desc(merch_products.createdAt));

  const productIds = rawProducts.map((p) => p.id);

  let allImages: { productId: number; imageUrl: string }[] = [];
  let allVariants: { productId: number; price: number | null }[] = [];

  if (productIds.length > 0) {
    [allImages, allVariants] = await Promise.all([
      db
        .select({ productId: merch_product_images.productId, imageUrl: merch_product_images.imageUrl })
        .from(merch_product_images)
        .where(inArray(merch_product_images.productId, productIds))
        .orderBy(merch_product_images.displayOrder),
      db
        .select({ productId: merch_product_variants.productId, price: merch_product_variants.price })
        .from(merch_product_variants)
        .where(inArray(merch_product_variants.productId, productIds)),
    ]);
  }

  return rawProducts.map((p) => {
    const variants = allVariants.filter((v) => v.productId === p.id);
    const range = p.hasVariants ? formatPriceRange(p.price, variants) : null;
    return {
      ...p,
      images: allImages.filter((img) => img.productId === p.id).map((img) => img.imageUrl),
      priceFrom: range?.from ?? null,
      priceTo: range?.to ?? null,
    };
  });
}

async function assertOwnership(id: number, userId: string) {
  const [row] = await db
    .select({ userId: merch_products.userId })
    .from(merch_products)
    .where(eq(merch_products.id, id))
    .limit(1);
  if (!row || row.userId !== userId) throw new Error("Forbidden");
}

export async function getMyProductById(id: number) {
  const user = await requireMerchant();

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
    .where(and(eq(merch_products.id, id), eq(merch_products.userId, user.id!)))
    .limit(1);

  if (!product) return null;

  const [images, sizes, variants] = await Promise.all([
    db
      .select({ imageUrl: merch_product_images.imageUrl })
      .from(merch_product_images)
      .where(eq(merch_product_images.productId, id))
      .orderBy(merch_product_images.displayOrder),
    db.query.merch_product_sizes.findMany({
      where: (t, { eq }) => eq(t.productId, id),
    }),
    db.query.merch_product_variants.findMany({
      where: (t, { eq }) => eq(t.productId, id),
    }),
  ]);

  return {
    ...product,
    images: images.map((i) => i.imageUrl),
    sizes: sizes.map((s) => ({ id: s.id, sizeName: s.sizeName, stock: s.stock })),
    variants: variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      stock: v.stock,
      imageUrl: v.imageUrl,
    })),
  };
}

export async function createMyProduct(data: ProductFormData) {
  const user = await requireMerchant();

  const validationError = validateProductPayload(data);
  if (validationError) return { error: validationError };

  let insertedProductId: number | null = null;
  try {
    insertedProductId = await insertProduct(data, user.id!);
    await recordAuditLog(
      user.id!,
      "product",
      insertedProductId,
      "CREATE",
      `${user.name || "Merchant"} menambahkan produk "${data.name}"`,
    );
  } catch {
    if (insertedProductId) {
      for (const url of data.images) {
        await deleteImageFromCloudinary(url).catch(console.error);
      }
      await db.delete(merch_products).where(eq(merch_products.id, insertedProductId)).catch(() => {});
    }
    return { error: "Gagal menyimpan produk." };
  }

  revalidatePath("/account/my/products");
  revalidateAll();
}

export async function updateMyProduct(id: number, data: ProductFormData) {
  const user = await requireMerchant();
  await assertOwnership(id, user.id!);

  const validationError = validateProductPayload(data);
  if (validationError) return { error: validationError };

  try {
    const removed = await getRemovedImageUrls(id, data);
    for (const url of [...removed.productImages, ...removed.variantImages]) {
      await deleteImageFromCloudinary(url).catch(console.error);
    }

    await updateProductData(id, data);

    await recordAuditLog(
      user.id!,
      "product",
      id,
      "UPDATE",
      `${user.name || "Merchant"} memperbarui produk "${data.name}"`,
    );
  } catch {
    return { error: "Gagal memperbarui produk." };
  }

  revalidatePath("/account/my/products");
  revalidateAll();
}

export async function deleteMyProducts(ids: number[]) {
  const user = await requireMerchant();

  if (!ids || ids.length === 0) return { error: "Tidak ada produk yang dipilih." };

  try {
    const owned = await db
      .select({ id: merch_products.id, name: merch_products.name })
      .from(merch_products)
      .where(and(inArray(merch_products.id, ids), eq(merch_products.userId, user.id!)));

    if (owned.length === 0) return { error: "Produk tidak ditemukan." };

    const foundIds = owned.map((p) => p.id);

    const [images, variantImages] = await Promise.all([
      db
        .select({ imageUrl: merch_product_images.imageUrl })
        .from(merch_product_images)
        .where(inArray(merch_product_images.productId, foundIds)),
      db
        .select({ imageUrl: merch_product_variants.imageUrl })
        .from(merch_product_variants)
        .where(inArray(merch_product_variants.productId, foundIds)),
    ]);

    for (const img of [...images, ...variantImages]) {
      if (img.imageUrl) await deleteImageFromCloudinary(img.imageUrl).catch(console.error);
    }

    await db.delete(merch_products).where(inArray(merch_products.id, foundIds));

    for (const product of owned) {
      await recordAuditLog(
        user.id!,
        "product",
        product.id,
        "DELETE",
        `${user.name || "Merchant"} menghapus produk "${product.name}"`,
      );
    }
  } catch {
    return { error: "Gagal menghapus produk." };
  }

  revalidatePath("/account/my/products");
  revalidateAll();
}
