"use server";

import { db } from "@/db";
import { merchant_info, users } from "@/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin, revalidateAll } from "./_guards";
import { recordAuditLog } from "@/features/merch/actions/audit-log-actions";
import type {
  MerchantApplicationRow,
  MerchantQueryParams,
} from "../types";

export async function getMerchantApplications(
  params: MerchantQueryParams = {},
): Promise<{ applications: MerchantApplicationRow[]; total: number }> {
  await requireAdmin();

  const { status = "ALL", search = "" } = params;

  const conditions = [];
  if (status !== "ALL") conditions.push(eq(merchant_info.status, status));
  if (search) {
    conditions.push(
      or(
        ilike(merchant_info.storeName, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.name, `%${search}%`),
      ),
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: merchant_info.id,
      userId: merchant_info.userId,
      storeName: merchant_info.storeName,
      description: merchant_info.description,
      phone: merchant_info.phone,
      address: merchant_info.address,
      status: merchant_info.status,
      rejectionReason: merchant_info.rejectionReason,
      createdAt: merchant_info.createdAt,
      updatedAt: merchant_info.updatedAt,
      reviewedAt: merchant_info.reviewedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(merchant_info)
    .leftJoin(users, eq(merchant_info.userId, users.id))
    .where(where)
    .orderBy(desc(merchant_info.createdAt));

  return { applications: rows, total: rows.length };
}

export async function getMerchantApplicationById(id: number) {
  await requireAdmin();

  const [row] = await db
    .select()
    .from(merchant_info)
    .where(eq(merchant_info.id, id))
    .limit(1);

  return row ?? null;
}

export async function approveMerchant(id: number) {
  const admin = await requireAdmin();

  const [application] = await db
    .select()
    .from(merchant_info)
    .where(eq(merchant_info.id, id))
    .limit(1);

  if (!application) return { error: "Pengajuan tidak ditemukan." };
  if (application.status === "APPROVED") return { error: "Pengajuan ini sudah disetujui." };

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(merchant_info)
        .set({
          status: "APPROVED",
          rejectionReason: null,
          reviewedBy: admin.id!,
          reviewedAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .where(eq(merchant_info.id, id));

      await tx
        .update(users)
        .set({ role: "merchant", updatedAt: sql`now()` })
        .where(eq(users.id, application.userId));
    });
  } catch {
    return { error: "Gagal menyetujui pengajuan merchant." };
  }

  await recordAuditLog(
    admin.id!,
    "merchant",
    id,
    "VERIFY",
    `${admin.name || "Admin"} menyetujui merchant "${application.storeName}"`,
  );

  revalidatePath("/dashboard/merch/merchants");
  revalidatePath("/account/merchant");
  revalidateAll();
}

export async function rejectMerchant(id: number, reason: string) {
  const admin = await requireAdmin();

  const trimmedReason = reason?.trim();
  if (!trimmedReason) return { error: "Alasan penolakan wajib diisi." };

  const [application] = await db
    .select()
    .from(merchant_info)
    .where(eq(merchant_info.id, id))
    .limit(1);

  if (!application) return { error: "Pengajuan tidak ditemukan." };

  try {
    await db
      .update(merchant_info)
      .set({
        status: "REJECTED",
        rejectionReason: trimmedReason,
        reviewedBy: admin.id!,
        reviewedAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(eq(merchant_info.id, id));
  } catch {
    return { error: "Gagal menolak pengajuan merchant." };
  }

  await recordAuditLog(
    admin.id!,
    "merchant",
    id,
    "REJECT",
    `${admin.name || "Admin"} menolak merchant "${application.storeName}". Alasan: ${trimmedReason}`,
  );

  revalidatePath("/dashboard/merch/merchants");
  revalidatePath("/account/merchant");
  revalidateAll();
}
