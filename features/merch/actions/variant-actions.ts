"use server"

import { db } from "@/db"
import { merch_product_variants } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin, revalidateAll } from "./_guards"
import { VariantFormData } from "../types"

export async function getProductVariants(productId: number) {
  await requireAdmin();

  return db
    .select({
      id: merch_product_variants.id,
      name: merch_product_variants.name,
      price: merch_product_variants.price,
      stock: merch_product_variants.stock,
      imageUrl: merch_product_variants.imageUrl,
    })
    .from(merch_product_variants)
    .where(eq(merch_product_variants.productId, productId))
    .orderBy(merch_product_variants.id);
}

export async function syncProductVariants(productId: number, variants: VariantFormData[]) {
  await requireAdmin();

  const normalized = variants.map((v) => ({
    productId,
    name: v.name.trim(),
    price: v.price === "" || v.price == null ? null : Number(v.price),
    stock: v.stock === "" ? 0 : Number(v.stock),
    imageUrl: v.imageUrl && v.imageUrl.trim() !== "" ? v.imageUrl.trim() : null,
  }));

  if (normalized.length === 0) {
    await db.delete(merch_product_variants).where(eq(merch_product_variants.productId, productId));
  } else {
    await db.transaction(async (tx) => {
      await tx.delete(merch_product_variants).where(eq(merch_product_variants.productId, productId));
      await tx.insert(merch_product_variants).values(normalized);
    });
  }

  revalidateAll();
}