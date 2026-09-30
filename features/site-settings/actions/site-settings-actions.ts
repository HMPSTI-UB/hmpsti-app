"use server"

import { db } from "@/db"
import { site_settings } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { requireAdmin, revalidateAll } from "@/lib/auth-guards"
import { revalidatePath } from "next/cache"

/**
 * Server action publik — hanya mengembalikan status visibility Pameran (boolean).
 * Tanpa auth() secara sengaja: ini data publik (tidak sensitif) dan dipakai dari
 * komponen client (Navbar) agar halaman landing tetap force-static.
 */
export async function getPublicSiteSettings(): Promise<boolean> {
  const rows = await db
    .select({ showPameran: site_settings.showPameran })
    .from(site_settings)
    .limit(1);

  return rows[0]?.showPameran ?? true;
}

/**
 * Update toggle visibility Pameran (hanya admin). Upsert baris tunggal.
 */
export async function updateSiteSetting(showPameran: boolean) {
  await requireAdmin();

  const rows = await db.select({ id: site_settings.id }).from(site_settings).limit(1);

  if (rows.length === 0) {
    await db.insert(site_settings).values({ showPameran });
  } else {
    await db
      .update(site_settings)
      .set({ showPameran, updatedAt: sql`now()` })
      .where(eq(site_settings.id, rows[0].id));
  }

  revalidateAll();
  revalidatePath("/pameran");
  revalidatePath("/pameran/[id]");
  revalidatePath("/pameran/vote");
  revalidatePath("/pameran/live");
}