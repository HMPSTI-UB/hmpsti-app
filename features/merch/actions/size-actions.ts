"use server"

import { db } from "@/db"
import { merch_product_sizes } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin, revalidateAll } from "./_guards"
import { SizeFormData } from "../types"

export async function getProductSizes(productId: number) {
  await requireAdmin();

  const sizes = await db
    .select()
    .from(merch_product_sizes)
    .where(eq(merch_product_sizes.productId, productId))
    .orderBy(merch_product_sizes.id);

  return sizes;
}

export async function syncProductSizes(productId: number, sizes: SizeFormData[]) {
  await requireAdmin();

  // 1. Normalisasi ukuran dan pengecekan duplikasi
  const seenSizes = new Set<string>();
  const normalizedSizes = sizes.map((s) => {
    const normalizedName = s.sizeName.trim().toUpperCase();
    if (seenSizes.has(normalizedName)) {
      throw new Error(`Terdapat duplikasi ukuran: ${normalizedName}`);
    }
    seenSizes.add(normalizedName);
    return {
      productId,
      sizeName: normalizedName,
      stock: s.stock === "" ? 0 : s.stock,
    };
  });

  // 2. Operasi Database
  if (normalizedSizes.length === 0) {
    await db.delete(merch_product_sizes).where(eq(merch_product_sizes.productId, productId));
  } else {
    // db.transaction() untuk memastikan sifat atomik.
    // Jika insert gagal, maka delete ikut di-rollback.
    await db.transaction(async (tx) => {
      await tx.delete(merch_product_sizes).where(eq(merch_product_sizes.productId, productId));
      await tx.insert(merch_product_sizes).values(normalizedSizes);
    });
  }

  revalidateAll();
}
