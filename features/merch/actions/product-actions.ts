"use server"

import { db } from "@/db"
import { merch_categories, merch_products, merch_product_sizes } from "@/db/schema"
import { eq, count, ilike, and, desc, sql } from "drizzle-orm"
import { requireUser, revalidateAll } from "./_guards"
import { ProductFormData, ProductQueryParams } from "../types"
import { deleteImageFromCloudinary } from "./upload-actions"

function calculateAvailability(
  hasSizes: boolean,
  stock: number | null,
  forcePreorder?: boolean
) {
  if (hasSizes) {
    return "preorder";
  }
  if (forcePreorder) {
    return "preorder";
  }
  if (stock !== null && stock > 0) {
    return "ready";
  }
  return "out_of_stock";
}

export async function getAdminProducts({
  page = 1,
  pageSize = 10,
  search = "",
  categoryId,
  availability,
}: ProductQueryParams = {}) {
  await requireUser();

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
      price: merch_products.price,
      image: merch_products.image,
      hasSizes: merch_products.hasSizes,
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

  if (pageSize === "ALL") {
    const [products, [{ total }]] = await Promise.all([
      baseQuery,
      countQuery,
    ]);
    return { products, total };
  }

  const offset = (page - 1) * pageSize;
  const [products, [{ total }]] = await Promise.all([
    baseQuery.limit(pageSize).offset(offset),
    countQuery,
  ]);

  return { products, total };
}

export async function createProduct(data: ProductFormData) {
  await requireUser();

  const availabilityType = calculateAvailability(data.hasSizes, data.stock, data.forcePreorder);
  const finalStock = data.hasSizes ? null : (data.stock ?? 0);

  await db.insert(merch_products).values({
    categoryId: data.categoryId,
    name: data.name,
    description: data.description,
    price: data.price,
    image: data.image,
    hasSizes: data.hasSizes,
    stock: finalStock,
    availabilityType,
  });

  revalidateAll();
}

export async function updateProduct(id: number, data: ProductFormData) {
  await requireUser();

  const availabilityType = calculateAvailability(data.hasSizes, data.stock, data.forcePreorder);
  const finalStock = data.hasSizes ? null : (data.stock ?? 0);

  const updateOp = db.update(merch_products)
    .set({
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      hasSizes: data.hasSizes,
      stock: finalStock,
      availabilityType,
      updatedAt: sql`now()`,
    })
    .where(eq(merch_products.id, id));

  if (!data.hasSizes) {
    // Skenario B: db.batch untuk update produk dan hapus baris sizes yatim
    const deleteOp = db.delete(merch_product_sizes).where(eq(merch_product_sizes.productId, id));
    await db.batch([updateOp, deleteOp]);
  } else {
    // Jika hasSizes = true (Skenario A atau tetap true), tidak perlu menghapus sizes
    await updateOp;
  }

  revalidateAll();
}

export async function deleteProduct(id: number) {
  await requireUser();

  // 1. Ambil data produk untuk mendapatkan URL gambar
  const productRows = await db.select({ image: merch_products.image }).from(merch_products).where(eq(merch_products.id, id)).limit(1);
  const product = productRows[0];

  if (!product) {
    throw new Error("Product not found");
  }

  // 2. Hapus dari Cloudinary terlebih dahulu. Jika gagal, exception akan otomatis dilempar dan baris di bawah batal tereksekusi.
  await deleteImageFromCloudinary(product.image);

  // 3. Hapus dari database (onDelete: cascade otomatis menghapus merch_product_sizes)
  await db.delete(merch_products).where(eq(merch_products.id, id));

  revalidateAll();
}
