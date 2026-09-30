"use server";

import { db } from "@/db";
import { merchant_info } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser, revalidateAll } from "./_guards";
import type { MerchantApplicationInput, MerchantInfoData } from "../types";

function clean(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Ambil data merchant milik user yang sedang login (null bila belum pernah daftar).
 */
export async function getMyMerchantInfo(): Promise<MerchantInfoData | null> {
  const user = await requireUser();

  const [row] = await db
    .select()
    .from(merchant_info)
    .where(eq(merchant_info.userId, user.id!))
    .limit(1);

  return row ?? null;
}

/**
 * Ajukan diri sebagai merchant. Bila sebelumnya ditolak, pengajuan direset ke PENDING.
 */
export async function applyAsMerchant(data: MerchantApplicationInput) {
  const user = await requireUser();

  const storeName = clean(data.storeName);
  if (!storeName) return { error: "Nama toko wajib diisi." };

  const [existing] = await db
    .select()
    .from(merchant_info)
    .where(eq(merchant_info.userId, user.id!))
    .limit(1);

  if (existing?.status === "APPROVED") {
    return { error: "Akun ini sudah terdaftar sebagai merchant." };
  }
  if (existing?.status === "PENDING") {
    return { error: "Pengajuan kamu sedang menunggu verifikasi admin." };
  }

  const payload = {
    storeName,
    description: clean(data.description),
    phone: clean(data.phone),
    address: clean(data.address),
    status: "PENDING" as const,
    rejectionReason: null,
    reviewedBy: null,
    reviewedAt: null,
    updatedAt: sql`now()`,
  };

  if (existing) {
    await db.update(merchant_info).set(payload).where(eq(merchant_info.id, existing.id));
  } else {
    await db.insert(merchant_info).values({ ...payload, userId: user.id! });
  }

  revalidatePath("/account/merchant");
  revalidateAll();
}
