"use server"

import { db } from "@/db"
import { merch_product_sizes } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireUser, revalidateAll } from "./_guards"
import { SizeFormData } from "../types"

export async function getProductSizes(productId: number) {
  await requireUser();

  const sizes = await db
    .select()
    .from(merch_product_sizes)
    .where(eq(merch_product_sizes.productId, productId))
    .orderBy(merch_product_sizes.id);

  return sizes;
}

export async function syncProductSizes(productId: number, sizes: SizeFormData[]) {
  await requireUser();

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
      stock: s.stock,
    };
  });

  // 2. Operasi Database
  // Menyiapkan op penghapusan baris ukuran lama
  const deleteOp = db.delete(merch_product_sizes).where(eq(merch_product_sizes.productId, productId));
  
  if (normalizedSizes.length === 0) {
      await deleteOp;
  } else {
      // Menyiapkan op penambahan baris ukuran baru
      const insertOp = db.insert(merch_product_sizes).values(normalizedSizes);
      
      // db.batch() untuk memastikan sifat atomik.
      // Jika insertOp gagal, maka deleteOp ikut di-rollback.
      await db.batch([deleteOp, insertOp]);
  }

  revalidateAll();
}
