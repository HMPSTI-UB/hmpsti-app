"use server";

import { db } from "@/db";
import {
  merchant_info,
  users,
  merch_products,
  merch_product_images,
  merch_product_variants,
  payment_accounts,
} from "@/db/schema";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin, revalidateAll } from "./_guards";
import { recordAuditLog } from "@/features/merch/actions/audit-log-actions";
import { deleteImageFromCloudinary } from "@/features/merch/actions/upload-actions";
import type {
  MerchantApplicationInput,
  MerchantApplicationRow,
  MerchantQueryParams,
} from "../types";

function clean(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

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

export async function updateMerchant(id: number, data: MerchantApplicationInput) {
  const admin = await requireAdmin();

  const [application] = await db
    .select()
    .from(merchant_info)
    .where(eq(merchant_info.id, id))
    .limit(1);

  if (!application) return { error: "Pengajuan tidak ditemukan." };

  const storeName = clean(data.storeName);
  if (!storeName) return { error: "Nama toko wajib diisi." };

  try {
    await db
      .update(merchant_info)
      .set({
        storeName,
        description: clean(data.description),
        phone: clean(data.phone),
        address: clean(data.address),
        updatedAt: sql`now()`,
      })
      .where(eq(merchant_info.id, id));
  } catch {
    return { error: "Gagal memperbarui data merchant." };
  }

  await recordAuditLog(
    admin.id!,
    "merchant",
    id,
    "UPDATE",
    `${admin.name || "Admin"} memperbarui data merchant "${storeName}"`,
  );

  revalidatePath("/dashboard/merch/merchants");
  revalidatePath("/account/merchant");
  revalidateAll();
}

export async function deleteMerchant(id: number) {
  const admin = await requireAdmin();

  const [application] = await db
    .select()
    .from(merchant_info)
    .where(eq(merchant_info.id, id))
    .limit(1);

  if (!application) return { error: "Pengajuan tidak ditemukan." };

  const userId = application.userId;

  try {
    // Kumpulkan seluruh data terkait toko untuk dibersihkan.
    const products = await db
      .select({ id: merch_products.id })
      .from(merch_products)
      .where(eq(merch_products.userId, userId));
    const productIds = products.map((p) => p.id);

    let productImages: { imageUrl: string }[] = [];
    let variantImages: { imageUrl: string | null }[] = [];
    if (productIds.length > 0) {
      productImages = await db
        .select({ imageUrl: merch_product_images.imageUrl })
        .from(merch_product_images)
        .where(inArray(merch_product_images.productId, productIds));
      variantImages = await db
        .select({ imageUrl: merch_product_variants.imageUrl })
        .from(merch_product_variants)
        .where(inArray(merch_product_variants.productId, productIds));
    }

    const accounts = await db
      .select({ qrisImgUrl: payment_accounts.qrisImgUrl })
      .from(payment_accounts)
      .where(eq(payment_accounts.userId, userId));

    // Bersihkan aset Cloudinary terlebih dulu (best-effort, tidak menggagalkan hapus data).
    const cloudinaryUrls = [
      ...productImages.map((i) => i.imageUrl),
      ...variantImages.map((i) => i.imageUrl).filter((u): u is string => !!u),
      ...accounts.map((a) => a.qrisImgUrl).filter((u): u is string => !!u),
    ];
    for (const url of cloudinaryUrls) {
      await deleteImageFromCloudinary(url).catch(console.error);
    }

    // Hapus semua data toko secara atomik: produk -> rekening -> merchant_info -> reset role.
    await db.transaction(async (tx) => {
      if (productIds.length > 0) {
        await tx.delete(merch_products).where(inArray(merch_products.id, productIds));
      }
      await tx.delete(payment_accounts).where(eq(payment_accounts.userId, userId));
      await tx.delete(merchant_info).where(eq(merchant_info.id, id));
      await tx
        .update(users)
        .set({ role: "user", updatedAt: sql`now()` })
        .where(and(eq(users.id, userId), eq(users.role, "merchant")));
    });
  } catch {
    return { error: "Gagal menghapus data merchant." };
  }

  await recordAuditLog(
    admin.id!,
    "merchant",
    id,
    "DELETE",
    `${admin.name || "Admin"} menghapus merchant "${application.storeName}" beserta produk, rekening, dan data tokonya`,
  );

  revalidatePath("/dashboard/merch/merchants");
  revalidatePath("/account/merchant");
  revalidateAll();
}
