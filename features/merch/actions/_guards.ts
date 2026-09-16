import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

/**
 * Guard untuk server action yang butuh login admin.
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
