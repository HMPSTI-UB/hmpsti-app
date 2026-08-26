"use server"

import { db } from "@/db"
import { merch_categories, merch_products } from "@/db/schema"
import { eq, count } from "drizzle-orm"
import { requireUser, revalidateAll } from "./_guards"
import { CategoryFormData } from "../types"

export async function getAdminCategories() {
  await requireUser();
  
  const rows = await db
    .select()
    .from(merch_categories)
    .orderBy(merch_categories.name);
    
  return rows;
}

export async function getCategoryImpact(id: number): Promise<number> {
  await requireUser();
  
  const [{ total }] = await db
    .select({ total: count(merch_products.id) })
    .from(merch_products)
    .where(eq(merch_products.categoryId, id));
    
  return total;
}

export async function createCategory(data: CategoryFormData) {
  await requireUser();
  
  await db.insert(merch_categories).values(data);
  
  revalidateAll();
}

export async function updateCategory(id: number, data: CategoryFormData) {
  await requireUser();
  
  await db.update(merch_categories)
    .set(data)
    .where(eq(merch_categories.id, id));
    
  revalidateAll();
}

export async function deleteCategory(id: number) {
  await requireUser();
  
  // Hard delete kategori. Sesuai skema database (onDelete: "set null"),
  // relasi category_id di merch_products akan otomatis di-set menjadi NULL oleh PostgreSQL.
  await db.delete(merch_categories).where(eq(merch_categories.id, id));
  
  revalidateAll();
}
