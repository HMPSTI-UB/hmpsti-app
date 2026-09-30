"use server"

import { db } from "@/db"
import { merch_categories, merch_products } from "@/db/schema"
import { eq, count, inArray } from "drizzle-orm"
import { requireAdmin, requireUser, revalidateAll } from "./_guards"
import { CategoryFormData } from "../types"
import { recordAuditLog } from "./audit-log-actions"

export async function getAdminCategories() {
  await requireAdmin();
  
  const rows = await db
    .select()
    .from(merch_categories)
    .orderBy(merch_categories.name);
    
  return rows;
}

/**
 * Daftar kategori untuk dipilih merchant saat membuat produk (read-only).
 * Kategori tetap dikelola admin.
 */
export async function getSelectableCategories() {
  await requireUser();

  const rows = await db
    .select()
    .from(merch_categories)
    .orderBy(merch_categories.name);

  return rows;
}

export async function getCategoryImpact(id: number): Promise<number> {
  await requireAdmin();
  
  const [{ total }] = await db
    .select({ total: count(merch_products.id) })
    .from(merch_products)
    .where(eq(merch_products.categoryId, id));
    
  return total;
}

export async function createCategory(data: CategoryFormData) {
  const user = await requireAdmin();
  const adminName = user.name || "Admin";
  
  try {
    const [inserted] = await db.insert(merch_categories).values(data).returning({ id: merch_categories.id });
    
    await recordAuditLog(
      user.id!,
      "category",
      inserted.id,
      "CREATE",
      `${adminName} menambahkan kategori "${data.name}"`
    );
  } catch (error: any) {
    if (error.cause?.code === "23505") {
      return { error: "Kategori dengan nama tersebut sudah ada." };
    }
    return { error: "Terjadi kesalahan saat menambahkan kategori." };
  }
  
  revalidateAll();
}

export async function updateCategory(id: number, data: CategoryFormData) {
  const user = await requireAdmin();
  const adminName = user.name || "Admin";
  
  try {
    const [oldCategory] = await db.select().from(merch_categories).where(eq(merch_categories.id, id)).limit(1);
    if (!oldCategory) return { error: "Kategori tidak ditemukan." };

    await db.update(merch_categories)
      .set(data)
      .where(eq(merch_categories.id, id));

    const changes = [];
    if (oldCategory.name !== data.name) changes.push(`Nama (${oldCategory.name} -> ${data.name})`);
    if (oldCategory.slug !== data.slug) changes.push(`Slug (${oldCategory.slug} -> ${data.slug})`);

    const changesText = changes.length > 0 ? changes.join(", ") : "Tidak ada perubahan";

    await recordAuditLog(
      user.id!,
      "category",
      id,
      "UPDATE",
      `${adminName} memperbarui kategori "${oldCategory.name}". Perubahan: ${changesText}`
    );
  } catch (error: any) {
    if (error.cause?.code === "23505") {
      return { error: "Kategori dengan nama tersebut sudah ada." };
    }
    return { error: "Terjadi kesalahan saat memperbarui kategori." };
  }
    
  revalidateAll();
}

export async function deleteCategory(id: number) {
  const user = await requireAdmin();
  const adminName = user.name || "Admin";
  
  try {
    const [oldCategory] = await db.select().from(merch_categories).where(eq(merch_categories.id, id)).limit(1);
    if (!oldCategory) return { error: "Kategori tidak ditemukan." };

    // Hard delete kategori. Sesuai skema database (onDelete: "set null"),
    // relasi category_id di merch_products akan otomatis di-set menjadi NULL oleh PostgreSQL.
    await db.delete(merch_categories).where(eq(merch_categories.id, id));

    await recordAuditLog(
      user.id!,
      "category",
      id,
      "DELETE",
      `${adminName} menghapus kategori "${oldCategory.name}"`
    );
  } catch {
    return { error: "Terjadi kesalahan saat menghapus kategori." };
  }
  
  revalidateAll();
}

export async function deleteManyCategories(ids: number[]) {
  const user = await requireAdmin();
  const adminName = user.name || "Admin";

  if (ids.length === 0) return { error: "Tidak ada kategori yang dipilih." };

  try {
    const categories = await db
      .select({ id: merch_categories.id, name: merch_categories.name })
      .from(merch_categories)
      .where(inArray(merch_categories.id, ids));

    if (categories.length === 0) return { error: "Kategori tidak ditemukan." };

    await db
      .delete(merch_categories)
      .where(inArray(merch_categories.id, categories.map((c) => c.id)));

    for (const category of categories) {
      await recordAuditLog(
        user.id!,
        "category",
        category.id,
        "DELETE",
        `${adminName} menghapus kategori "${category.name}"`
      );
    }
  } catch {
    return { error: "Terjadi kesalahan saat menghapus kategori." };
  }

  revalidateAll();
}
