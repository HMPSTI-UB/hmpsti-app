import { db } from "@/db"
import { site_settings } from "@/db/schema"

/**
 * Plain read helper (no auth) — returns whether the Pameran section is visible
 * to the public. Defaults to true when no settings row exists yet.
 */
export async function getSiteSettings(): Promise<boolean> {
  const rows = await db
    .select({ showPameran: site_settings.showPameran })
    .from(site_settings)
    .limit(1);

  return rows[0]?.showPameran ?? true;
}