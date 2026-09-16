import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

/**
 * Guard untuk server action yang butuh login admin.
 * Server action = endpoint POST publik, jadi WAJIB dipanggil di awal setiap
 * action yang mengubah data. Melempar "Unauthorized" jika tidak ada sesi.
 *
 * Catatan: file ini sengaja TIDAK memakai directive "use server" — ini helper
 * server-side biasa yang di-import oleh file action, bukan endpoint RPC sendiri.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

/**
 * Revalidasi seluruh layout supaya cache Next.js ikut ter-clear setelah mutasi.
 */
export function revalidateAll() {
  revalidatePath("/", "layout");
}
