"use server"

import { db } from "@/db"
import { merch_orders, merch_order_items, merch_products, merch_product_sizes, users } from "@/db/schema"
import { eq, desc, or, ilike, count, sql, inArray } from "drizzle-orm"
import { requireUser, revalidateAll } from "./_guards"
import { calculateAvailability } from "../utils"
import { recordAuditLog } from "./audit-log-actions"

export type ActionResult = { success: true } | { error: string };

export async function getAdminOrders(params: {
  page?: number;
  pageSize?: number | "ALL";
  search?: string;
  status?: string;
}) {
  await requireUser();
  const { page = 1, pageSize = 10, search = "", status } = params;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(merch_orders.buyerName, `%${search}%`),
        ilike(merch_orders.orderCode, `%${search}%`)
      )
    );
  }
  if (status) {
    conditions.push(eq(merch_orders.status, status as "MENUNGGU_VERIFIKASI" | "TERVERIFIKASI" | "DITOLAK"));
  }

  const where = conditions.length > 0 ? or(...conditions) : undefined;
  // Note: if status and search are both provided, we should probably AND them. 
  // Let's fix that to AND for better filtering.
  const whereAnd = conditions.length > 0 ? sql`${conditions.reduce((acc, condition, idx) => {
      if (idx === 0) return condition;
      return sql`${acc} AND ${condition}`;
  }, sql``)}` : undefined;


  const baseQuery = db
    .select({
      id: merch_orders.id,
      orderCode: merch_orders.orderCode,
      buyerName: merch_orders.buyerName,
      buyerContact: merch_orders.buyerContact,
      totalAmount: merch_orders.totalAmount,
      status: merch_orders.status,
      createdAt: merch_orders.createdAt,
    })
    .from(merch_orders)
    .where(whereAnd)
    .orderBy(desc(merch_orders.createdAt));

  const countQuery = db
    .select({ total: count(merch_orders.id) })
    .from(merch_orders)
    .where(whereAnd);

  let orders;
  let total;

  if (pageSize === "ALL") {
    const [ordersRes, [{ total: totalRes }]] = await Promise.all([
      baseQuery,
      countQuery,
    ]);
    orders = ordersRes;
    total = totalRes;
  } else {
    const offset = (page - 1) * pageSize;
    const [ordersRes, [{ total: totalRes }]] = await Promise.all([
      baseQuery.limit(pageSize as number).offset(offset),
      countQuery,
    ]);
    orders = ordersRes;
    total = totalRes;
  }

  return { orders, total };
}

export async function getOrderDetail(orderId: number) {
  await requireUser();

  const [order] = await db
    .select({
      id: merch_orders.id,
      orderCode: merch_orders.orderCode,
      buyerName: merch_orders.buyerName,
      buyerContact: merch_orders.buyerContact,
      buyerAddress: merch_orders.buyerAddress,
      buyerNote: merch_orders.buyerNote,
      totalAmount: merch_orders.totalAmount,
      paymentProofUrl: merch_orders.paymentProofUrl,
      status: merch_orders.status,
      rejectionReason: merch_orders.rejectionReason,
      createdAt: merch_orders.createdAt,
      verifiedAt: merch_orders.verifiedAt,
      verifiedBy: users.name, // join directly for UI convenience
    })
    .from(merch_orders)
    .leftJoin(users, eq(merch_orders.verifiedBy, users.id))
    .where(eq(merch_orders.id, orderId))
    .limit(1);

  if (!order) return { error: "Pesanan tidak ditemukan." };

  const items = await db
    .select({
      id: merch_order_items.id,
      productId: merch_order_items.productId,
      productNameSnapshot: merch_order_items.productNameSnapshot,
      productPriceSnapshot: merch_order_items.productPriceSnapshot,
      sizeId: merch_order_items.sizeId,
      sizeNameSnapshot: merch_order_items.sizeNameSnapshot,
      quantity: merch_order_items.quantity,
      subtotal: merch_order_items.subtotal,
      liveProductStock: merch_products.stock,
      liveSizeStock: merch_product_sizes.stock,
      hasSizes: merch_products.hasSizes,
    })
    .from(merch_order_items)
    .leftJoin(merch_products, eq(merch_order_items.productId, merch_products.id))
    .leftJoin(merch_product_sizes, eq(merch_order_items.sizeId, merch_product_sizes.id))
    .where(eq(merch_order_items.orderId, orderId));

  return { order, items };
}

export async function verifyOrder(orderId: number): Promise<ActionResult> {
  const user = await requireUser();
  const adminName = user.name || "Admin";
  
  try {
    const [order] = await db
      .select({ id: merch_orders.id, status: merch_orders.status, buyerName: merch_orders.buyerName, orderCode: merch_orders.orderCode })
      .from(merch_orders)
      .where(eq(merch_orders.id, orderId))
      .limit(1);

    if (!order) return { error: "Pesanan tidak ditemukan." };
    if (order.status !== "MENUNGGU_VERIFIKASI") {
      return { error: `Pesanan sudah diproses dengan status: ${order.status}.` };
    }

    const items = await db
      .select({
        productId: merch_order_items.productId,
        quantity: merch_order_items.quantity,
        productNameSnapshot: merch_order_items.productNameSnapshot,
      })
      .from(merch_order_items)
      .where(eq(merch_order_items.orderId, orderId));

    // Kumpulkan product ID yang mungkin butuh diupdate stoknya
    const productIds = items.map(i => i.productId).filter(id => id !== null) as number[];
    
    let productsInDb: { id: number, hasSizes: boolean, stock: number | null, name: string }[] = [];
    if (productIds.length > 0) {
      productsInDb = await db.select({
        id: merch_products.id,
        hasSizes: merch_products.hasSizes,
        stock: merch_products.stock,
        name: merch_products.name,
      }).from(merch_products).where(inArray(merch_products.id, productIds));
    }

    const batchOps = [];

    // Validasi overselling ulang (Lock)
    for (const item of items) {
      if (item.productId === null) continue; // Produk mungkin sudah dihapus
      
      const product = productsInDb.find(p => p.id === item.productId);
      if (!product) continue;

      if (!product.hasSizes) {
        const currentStock = product.stock || 0;
        if (item.quantity > currentStock) {
          return { error: `Stok produk ${product.name} (sisa ${currentStock}) tidak mencukupi untuk memenuhi pesanan ini (diminta ${item.quantity}).` };
        }
        
        // Siapkan operasi update stok produk
        const newStock = currentStock - item.quantity;
        const newAvailability = calculateAvailability(product.hasSizes, newStock);
        
        batchOps.push(
          db.update(merch_products)
            .set({ 
              stock: newStock,
              availabilityType: newAvailability,
              updatedAt: sql`now()`
            })
            .where(eq(merch_products.id, product.id))
        );
      }
    }

    // Update status pesanan
    batchOps.push(
      db.update(merch_orders)
        .set({
          status: "TERVERIFIKASI",
          verifiedBy: user.id!,
          verifiedAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .where(eq(merch_orders.id, orderId))
    );

    await db.batch(batchOps as [any, ...any[]]);
    
    await recordAuditLog(
      user.id!,
      "order",
      orderId,
      "VERIFY",
      `${adminName} menerima pesanan dari "${order.buyerName}" (${order.orderCode})`
    );

    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("Gagal memverifikasi pesanan:", error);
    return { error: "Terjadi kesalahan sistem saat memverifikasi pesanan." };
  }
}

export async function rejectOrder(orderId: number, rejectionReason: string): Promise<ActionResult> {
  const user = await requireUser();
  const adminName = user.name || "Admin";

  if (!rejectionReason || rejectionReason.trim() === "") {
    return { error: "Alasan penolakan wajib diisi." };
  }

  try {
    const [order] = await db
      .select({ id: merch_orders.id, status: merch_orders.status, buyerName: merch_orders.buyerName, orderCode: merch_orders.orderCode })
      .from(merch_orders)
      .where(eq(merch_orders.id, orderId))
      .limit(1);

    if (!order) return { error: "Pesanan tidak ditemukan." };
    if (order.status !== "MENUNGGU_VERIFIKASI") {
      return { error: `Pesanan sudah diproses dengan status: ${order.status}.` };
    }

    await db.update(merch_orders)
      .set({
        status: "DITOLAK",
        rejectionReason: rejectionReason.trim(),
        verifiedBy: user.id!,
        verifiedAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(eq(merch_orders.id, orderId));

    await recordAuditLog(
      user.id!,
      "order",
      orderId,
      "REJECT",
      `${adminName} menolak pesanan dari "${order.buyerName}" (${order.orderCode}) — alasan: ${rejectionReason.trim()}`
    );

    revalidateAll();
    return { success: true };
  } catch (error) {
    console.error("Gagal menolak pesanan:", error);
    return { error: "Terjadi kesalahan sistem saat menolak pesanan." };
  }
}
