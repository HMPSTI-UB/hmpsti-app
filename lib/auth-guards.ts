import { auth } from "@/auth";
import { db } from "@/db";
import { merchant_info } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Guard untuk server action yang butuh login (role apa pun).
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

/**
 * Guard untuk server action yang hanya boleh dijalankan admin.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role !== "admin") throw new Error("Forbidden");
  return session.user;
}

/**
 * True bila user punya merchant_info dengan status APPROVED.
 * Sumber kebenaran = database (bukan JWT) agar perubahan status langsung berlaku.
 */
export async function isApprovedMerchant(userId: string) {
  const [row] = await db
    .select({ status: merchant_info.status })
    .from(merchant_info)
    .where(and(eq(merchant_info.userId, userId), eq(merchant_info.status, "APPROVED")))
    .limit(1);
  return !!row;
}

/**
 * Guard untuk server action merchant (user login + merchant_info APPROVED).
 */
export async function requireMerchant() {
  const user = await requireUser();
  if (!(await isApprovedMerchant(user.id!))) throw new Error("Forbidden");
  return user;
}

/**
 * Guard untuk aksi yang boleh dilakukan admin ATAU merchant yang sudah disetujui
 * (mis. upload/hapus gambar produk).
 */
export async function requireAdminOrMerchant() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role === "admin") return session.user;
  if (await isApprovedMerchant(session.user.id!)) return session.user;
  throw new Error("Forbidden");
}

/**
 * Revalidasi seluruh layout supaya cache Next.js ikut ter-clear setelah mutasi.
 */
export function revalidateAll() {
  revalidatePath("/", "layout");
}
