"use server";

import { db } from "@/db";
import {
  merchant_info,
  merch_products,
  payment_accounts,
  users,
} from "@/db/schema";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser, requireAdmin, revalidateAll } from "@/lib/auth-guards";
import { recordAuditLog } from "@/features/merch/actions/audit-log-actions";
import type {
  AdminPaymentAccountRow,
  PaymentAccount,
  PaymentAccountInput,
  PaymentOption,
} from "../types";

function clean(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function validate(data: PaymentAccountInput): string | null {
  if (!data.bankName?.trim()) {
    return data.type === "qris"
      ? "Nama QRIS wajib diisi."
      : "Nama bank / e-wallet wajib diisi.";
  }
  if (!data.accountOwner?.trim()) return "Nama pemilik rekening wajib diisi.";
  if (data.type === "qris") {
    if (!data.qrisImgUrl?.trim()) return "Gambar QRIS wajib diunggah.";
  } else {
    if (!data.accountNumber?.trim()) return "Nomor rekening wajib diisi.";
  }
  return null;
}

/* ----------------------------- Merchant / owner ---------------------------- */

export async function getMyAccounts(): Promise<PaymentAccount[]> {
  const user = await requireUser();
  return db
    .select()
    .from(payment_accounts)
    .where(eq(payment_accounts.userId, user.id!))
    .orderBy(payment_accounts.createdAt);
}

export async function createMyAccount(data: PaymentAccountInput) {
  const user = await requireUser();

  const error = validate(data);
  if (error) return { error };

  try {
    await db.insert(payment_accounts).values({
      userId: user.id!,
      type: data.type,
      bankName: data.bankName.trim(),
      accountNumber: data.type === "qris" ? clean(data.accountNumber) : data.accountNumber!.trim(),
      accountOwner: data.accountOwner.trim(),
      qrisImgUrl: data.type === "qris" ? clean(data.qrisImgUrl) : null,
      isActive: data.isActive ?? true,
    });
  } catch {
    return { error: "Gagal menambahkan rekening." };
  }

  revalidatePath("/account/my/accounts");
  revalidateAll();
}

async function assertOwnership(id: number, userId: string) {
  const [row] = await db
    .select({ userId: payment_accounts.userId })
    .from(payment_accounts)
    .where(eq(payment_accounts.id, id))
    .limit(1);
  if (!row || row.userId !== userId) throw new Error("Forbidden");
}

export async function updateMyAccount(id: number, data: PaymentAccountInput) {
  const user = await requireUser();
  await assertOwnership(id, user.id!);

  const error = validate(data);
  if (error) return { error };

  try {
    await db
      .update(payment_accounts)
      .set({
        type: data.type,
        bankName: data.bankName.trim(),
        accountNumber: data.type === "qris" ? clean(data.accountNumber) : data.accountNumber!.trim(),
        accountOwner: data.accountOwner.trim(),
        qrisImgUrl: data.type === "qris" ? clean(data.qrisImgUrl) : null,
        isActive: data.isActive ?? true,
        updatedAt: sql`now()`,
      })
      .where(eq(payment_accounts.id, id));
  } catch {
    return { error: "Gagal memperbarui rekening." };
  }

  revalidatePath("/account/my/accounts");
  revalidateAll();
}

export async function deleteMyAccount(id: number) {
  const user = await requireUser();
  await assertOwnership(id, user.id!);

  try {
    await db.delete(payment_accounts).where(eq(payment_accounts.id, id));
  } catch {
    return { error: "Gagal menghapus rekening." };
  }

  revalidatePath("/account/my/accounts");
  revalidateAll();
}

/* --------------------------------- Admin ---------------------------------- */

export async function getAllAccounts(): Promise<AdminPaymentAccountRow[]> {
  await requireAdmin();

  return db
    .select({
      id: payment_accounts.id,
      userId: payment_accounts.userId,
      type: payment_accounts.type,
      bankName: payment_accounts.bankName,
      accountNumber: payment_accounts.accountNumber,
      accountOwner: payment_accounts.accountOwner,
      qrisImgUrl: payment_accounts.qrisImgUrl,
      isActive: payment_accounts.isActive,
      createdAt: payment_accounts.createdAt,
      updatedAt: payment_accounts.updatedAt,
      ownerName: users.name,
      ownerEmail: users.email,
      storeName: merchant_info.storeName,
    })
    .from(payment_accounts)
    .leftJoin(users, eq(payment_accounts.userId, users.id))
    .leftJoin(merchant_info, eq(payment_accounts.userId, merchant_info.userId))
    .orderBy(payment_accounts.createdAt);
}

export async function adminUpdateAccount(id: number, data: PaymentAccountInput) {
  const admin = await requireAdmin();

  const error = validate(data);
  if (error) return { error };

  try {
    await db
      .update(payment_accounts)
      .set({
        type: data.type,
        bankName: data.bankName.trim(),
        accountNumber: data.type === "qris" ? clean(data.accountNumber) : data.accountNumber!.trim(),
        accountOwner: data.accountOwner.trim(),
        qrisImgUrl: data.type === "qris" ? clean(data.qrisImgUrl) : null,
        isActive: data.isActive ?? true,
        updatedAt: sql`now()`,
      })
      .where(eq(payment_accounts.id, id));

    await recordAuditLog(
      admin.id!,
      "payment_account",
      id,
      "UPDATE",
      `${admin.name || "Admin"} memperbarui rekening "${data.bankName}"`,
    );
  } catch {
    return { error: "Gagal memperbarui rekening." };
  }

  revalidatePath("/dashboard/merch/accounts");
  revalidateAll();
}

export async function adminDeleteAccount(id: number) {
  const admin = await requireAdmin();

  try {
    await db.delete(payment_accounts).where(eq(payment_accounts.id, id));
    await recordAuditLog(
      admin.id!,
      "payment_account",
      id,
      "DELETE",
      `${admin.name || "Admin"} menghapus rekening #${id}`,
    );
  } catch {
    return { error: "Gagal menghapus rekening." };
  }

  revalidatePath("/dashboard/merch/accounts");
  revalidateAll();
}

/* -------------------------------- Checkout -------------------------------- */

/**
 * Rekening tujuan pembayaran untuk produk-produk di keranjang.
 * - Produk milik merchant -> rekening merchant tsb.
 * - Produk tanpa owner (dibuat admin) -> rekening milik user ber-role admin.
 */
export async function getCheckoutPaymentOptions(
  productIds: number[],
): Promise<PaymentOption[]> {
  if (!productIds || productIds.length === 0) return [];

  const rows = await db
    .selectDistinct({ userId: merch_products.userId })
    .from(merch_products)
    .where(inArray(merch_products.id, productIds));

  const sellerIds = rows.map((r) => r.userId).filter((id): id is string => !!id);
  const hasAdminProducts = rows.some((r) => r.userId === null);

  const accountConditions = [];
  if (sellerIds.length > 0) {
    accountConditions.push(inArray(payment_accounts.userId, sellerIds));
  }
  if (hasAdminProducts) {
    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"));
    const adminIds = admins.map((a) => a.id);
    if (adminIds.length > 0) {
      accountConditions.push(inArray(payment_accounts.userId, adminIds));
    }
  }

  if (accountConditions.length === 0) return [];

  const ownerCondition =
    accountConditions.length === 1 ? accountConditions[0] : or(...accountConditions)!;

  const where = and(eq(payment_accounts.isActive, true), ownerCondition);

  const accounts = await db
    .select({
      id: payment_accounts.id,
      type: payment_accounts.type,
      bankName: payment_accounts.bankName,
      accountNumber: payment_accounts.accountNumber,
      accountOwner: payment_accounts.accountOwner,
      qrisImgUrl: payment_accounts.qrisImgUrl,
      userId: payment_accounts.userId,
      storeName: merchant_info.storeName,
      role: users.role,
    })
    .from(payment_accounts)
    .leftJoin(merchant_info, eq(payment_accounts.userId, merchant_info.userId))
    .leftJoin(users, eq(payment_accounts.userId, users.id))
    .where(and(eq(payment_accounts.isActive, true), where));

  return accounts.map((a) => ({
    id: a.id,
    type: a.type,
    bankName: a.bankName,
    accountNumber: a.accountNumber,
    accountOwner: a.accountOwner,
    qrisImgUrl: a.qrisImgUrl,
    sellerLabel: a.storeName ?? (a.role === "admin" ? "HMPSTI Store" : "Toko"),
  }));
}
