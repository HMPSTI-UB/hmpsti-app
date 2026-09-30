"use server"

import { db } from "@/db"
import { merch_orders, merch_order_items, users } from "@/db/schema"
import { and, count, desc, eq, inArray, sql } from "drizzle-orm"
import { requireUser } from "@/lib/auth-guards"

export type UserOrderStatus = "MENUNGGU_VERIFIKASI" | "TERVERIFIKASI" | "DITOLAK"

export type UserOrderSummary = {
  id: number
  orderCode: string
  status: UserOrderStatus
  totalAmount: number
  createdAt: Date
  itemCount: number
}

export type UserOrderDetail = {
  id: number
  orderCode: string
  status: UserOrderStatus
  buyerName: string
  buyerContact: string
  buyerAddress: string
  buyerNote: string | null
  totalAmount: number
  paymentProofUrl: string
  rejectionReason: string | null
  createdAt: Date
  verifiedAt: Date | null
  verifiedBy: string | null
}

export type UserOrderItem = {
  id: number
  productId: number | null
  productNameSnapshot: string
  productPriceSnapshot: number
  sizeNameSnapshot: string | null
  variantNameSnapshot: string | null
  quantity: number
  subtotal: number
}

export async function getUserOrders(params: {
  page?: number
  pageSize?: number
  status?: string
}): Promise<{ orders: UserOrderSummary[]; total: number }> {
  const user = await requireUser()
  const { page = 1, pageSize = 10, status } = params

  const conditions = [eq(merch_orders.userId, user.id)]
  if (status && status !== "SEMUA") {
    conditions.push(eq(merch_orders.status, status as UserOrderStatus))
  }
  const where = and(...conditions)

  const offset = (page - 1) * pageSize

  const [orderRows, [{ total }]] = await Promise.all([
    db
      .select({
        id: merch_orders.id,
        orderCode: merch_orders.orderCode,
        status: merch_orders.status,
        totalAmount: merch_orders.totalAmount,
        createdAt: merch_orders.createdAt,
      })
      .from(merch_orders)
      .where(where)
      .orderBy(desc(merch_orders.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: count(merch_orders.id) })
      .from(merch_orders)
      .where(where),
  ])

  const orderIds = orderRows.map((o) => o.id)

  let countRows: { orderId: number; items: number }[] = []
  if (orderIds.length > 0) {
    countRows = await db
      .select({
        orderId: merch_order_items.orderId,
        items: count(merch_order_items.id),
      })
      .from(merch_order_items)
      .where(inArray(merch_order_items.orderId, orderIds))
      .groupBy(merch_order_items.orderId)
  }

  const itemCountById = new Map(countRows.map((r) => [r.orderId, r.items]))

  const orders: UserOrderSummary[] = orderRows.map((o) => ({
    ...o,
    itemCount: itemCountById.get(o.id) ?? 0,
  }))

  return { orders, total }
}

export async function getUserOrder(
  orderId: number,
): Promise<
  | { order: UserOrderDetail; items: UserOrderItem[] }
  | { error: string }
> {
  const user = await requireUser()

  const [order] = await db
    .select({
      id: merch_orders.id,
      orderCode: merch_orders.orderCode,
      status: merch_orders.status,
      buyerName: merch_orders.buyerName,
      buyerContact: merch_orders.buyerContact,
      buyerAddress: merch_orders.buyerAddress,
      buyerNote: merch_orders.buyerNote,
      totalAmount: merch_orders.totalAmount,
      paymentProofUrl: merch_orders.paymentProofUrl,
      rejectionReason: merch_orders.rejectionReason,
      createdAt: merch_orders.createdAt,
      verifiedAt: merch_orders.verifiedAt,
      verifiedBy: users.name,
    })
    .from(merch_orders)
    .leftJoin(users, eq(merch_orders.verifiedBy, users.id))
    .where(and(eq(merch_orders.id, orderId), eq(merch_orders.userId, user.id)))
    .limit(1)

  if (!order) return { error: "Pesanan tidak ditemukan." }

  const items = await db
    .select({
      id: merch_order_items.id,
      productId: merch_order_items.productId,
      productNameSnapshot: merch_order_items.productNameSnapshot,
      productPriceSnapshot: merch_order_items.productPriceSnapshot,
      sizeNameSnapshot: merch_order_items.sizeNameSnapshot,
      variantNameSnapshot: merch_order_items.variantNameSnapshot,
      quantity: merch_order_items.quantity,
      subtotal: merch_order_items.subtotal,
    })
    .from(merch_order_items)
    .where(eq(merch_order_items.orderId, orderId))

  return { order, items }
}

export type TrackedOrder = {
  id: number
  orderCode: string
  status: UserOrderStatus
  totalAmount: number
  createdAt: Date
  verifiedAt: Date | null
  rejectionReason: string | null
  itemCount: number
}

/**
 * Cari pesanan milik user berdasarkan kode pesanan (case-insensitive).
 */
export async function trackOrderByCode(
  orderCode: string,
): Promise<{ order: TrackedOrder } | { error: string }> {
  const user = await requireUser()
  const code = orderCode.trim().toUpperCase()
  if (!code) return { error: "Masukkan kode pesanan terlebih dahulu." }

  const [order] = await db
    .select({
      id: merch_orders.id,
      orderCode: merch_orders.orderCode,
      status: merch_orders.status,
      totalAmount: merch_orders.totalAmount,
      createdAt: merch_orders.createdAt,
      verifiedAt: merch_orders.verifiedAt,
      rejectionReason: merch_orders.rejectionReason,
    })
    .from(merch_orders)
    .where(
      and(
        sql`upper(${merch_orders.orderCode}) = ${code}`,
        eq(merch_orders.userId, user.id),
      ),
    )
    .limit(1)

  if (!order) return { error: "Pesanan tidak ditemukan untuk akun ini." }

  const [{ items }] = await db
    .select({ items: count(merch_order_items.id) })
    .from(merch_order_items)
    .where(eq(merch_order_items.orderId, order.id))

  return { order: { ...order, itemCount: items } }
}

export async function getUserOrderStats(): Promise<{
  total: number
  pending: number
  verified: number
  rejected: number
}> {
  const user = await requireUser()

  const rows = await db
    .select({
      status: merch_orders.status,
      count: sql<number>`count(*)::int`,
    })
    .from(merch_orders)
    .where(eq(merch_orders.userId, user.id))
    .groupBy(merch_orders.status)

  const stats = { total: 0, pending: 0, verified: 0, rejected: 0 }
  for (const row of rows) {
    stats.total += row.count
    if (row.status === "MENUNGGU_VERIFIKASI") stats.pending = row.count
    else if (row.status === "TERVERIFIKASI") stats.verified = row.count
    else if (row.status === "DITOLAK") stats.rejected = row.count
  }
  return stats
}