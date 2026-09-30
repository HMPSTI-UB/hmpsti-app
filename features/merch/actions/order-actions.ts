"use server"

import { db } from "@/db"
import { merch_orders, merch_order_items, merch_products, merch_product_sizes, merch_product_variants, users } from "@/db/schema"
import { eq, desc, or, ilike, count, sql, inArray } from "drizzle-orm"
import { requireAdmin, revalidateAll } from "./_guards"
import { recordAuditLog } from "./audit-log-actions"

export type ActionResult = { success: true } | { error: string };

export async function getAdminOrders(params: {
  page?: number;
  pageSize?: number | "ALL";
  search?: string;
  status?: string;
}) {
  await requireAdmin();
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
  await requireAdmin();

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
      variantId: merch_order_items.variantId,
      variantNameSnapshot: merch_order_items.variantNameSnapshot,
      quantity: merch_order_items.quantity,
      subtotal: merch_order_items.subtotal,
      liveProductStock: merch_products.stock,
      liveSizeStock: merch_product_sizes.stock,
      liveVariantStock: merch_product_variants.stock,
      hasSizes: merch_products.hasSizes,
      hasVariants: merch_products.hasVariants,
    })
    .from(merch_order_items)
    .leftJoin(merch_products, eq(merch_order_items.productId, merch_products.id))
    .leftJoin(merch_product_sizes, eq(merch_order_items.sizeId, merch_product_sizes.id))
    .leftJoin(merch_product_variants, eq(merch_order_items.variantId, merch_product_variants.id))
    .where(eq(merch_order_items.orderId, orderId));

  return { order, items };
}

export async function verifyOrder(orderId: number): Promise<ActionResult> {
  const user = await requireAdmin();
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
        sizeId: merch_order_items.sizeId,
        variantId: merch_order_items.variantId,
        quantity: merch_order_items.quantity,
        productNameSnapshot: merch_order_items.productNameSnapshot,
      })
      .from(merch_order_items)
      .where(eq(merch_order_items.orderId, orderId));

    // Kumpulkan product ID yang mungkin butuh diupdate stoknya
    const productIds = items.map(i => i.productId).filter((id): id is number => id !== null);

    let productsInDb: {
      id: number;
      hasSizes: boolean;
      hasVariants: boolean;
      stock: number | null;
      availabilityType: "ready" | "out_of_stock" | "preorder";
      name: string;
    }[] = [];
    if (productIds.length > 0) {
      productsInDb = await db.select({
        id: merch_products.id,
        hasSizes: merch_products.hasSizes,
        hasVariants: merch_products.hasVariants,
        stock: merch_products.stock,
        availabilityType: merch_products.availabilityType,
        name: merch_products.name,
      }).from(merch_products).where(inArray(merch_products.id, productIds));
    }

    const sizeIds = items.map(i => i.sizeId).filter((id): id is number => id !== null);
    let sizesInDb: { id: number; stock: number }[] = [];
    if (sizeIds.length > 0) {
      sizesInDb = await db.select({ id: merch_product_sizes.id, stock: merch_product_sizes.stock })
        .from(merch_product_sizes)
        .where(inArray(merch_product_sizes.id, sizeIds));
    }

    const variantIds = items.map(i => i.variantId).filter((id): id is number => id !== null);
    let variantsInDb: { id: number; stock: number }[] = [];
    if (variantIds.length > 0) {
      variantsInDb = await db.select({ id: merch_product_variants.id, stock: merch_product_variants.stock })
        .from(merch_product_variants)
        .where(inArray(merch_product_variants.id, variantIds));
    }

    const productStockDelta = new Map<number, number>();
    const sizeStockUpdates: { sizeId: number; newStock: number }[] = [];
    const variantStockUpdates: { variantId: number; newStock: number }[] = [];

    // Validasi overselling ulang (Lock)
    for (const item of items) {
      if (item.productId === null) continue; // Produk mungkin sudah dihapus

      const product = productsInDb.find(p => p.id === item.productId);
      if (!product) continue;

      if (item.sizeId) {
        const size = sizesInDb.find(s => s.id === item.sizeId);
        if (size) {
          sizeStockUpdates.push({ sizeId: item.sizeId, newStock: Math.max(0, size.stock - item.quantity) });
        }
      }

      if (item.variantId) {
        const variant = variantsInDb.find(v => v.id === item.variantId);
        if (variant) {
          if (item.quantity > variant.stock) {
            return { error: `Stok varian produk ${product.name} (sisa ${variant.stock}) tidak mencukupi untuk memenuhi pesanan ini (diminta ${item.quantity}).` };
          }
          variantStockUpdates.push({ variantId: item.variantId, newStock: variant.stock - item.quantity });
          productStockDelta.set(product.id, (productStockDelta.get(product.id) ?? 0) + item.quantity);
        }
      }

      if (!product.hasSizes && !product.hasVariants) {
        const currentStock = product.stock || 0;
        if (item.quantity > currentStock) {
          return { error: `Stok produk ${product.name} (sisa ${currentStock}) tidak mencukupi untuk memenuhi pesanan ini (diminta ${item.quantity}).` };
        }
        productStockDelta.set(product.id, (productStockDelta.get(product.id) ?? 0) + item.quantity);
      }
    }

    const productStockUpdates: { productId: number; newStock: number; newAvailability: "ready" | "out_of_stock" | "preorder" }[] = [];
    for (const [productId, decrement] of productStockDelta) {
      const product = productsInDb.find(p => p.id === productId);
      if (!product) continue;
      const newStock = (product.stock ?? 0) - decrement;
      const newAvailability: "ready" | "out_of_stock" | "preorder" =
        product.availabilityType === "preorder"
          ? "preorder"
          : newStock > 0
            ? "ready"
            : "out_of_stock";
      productStockUpdates.push({ productId, newStock, newAvailability });
    }

    // Update stok produk, ukuran, varian + status pesanan secara atomik
    await db.transaction(async (tx) => {
      for (const update of productStockUpdates) {
        await tx.update(merch_products)
          .set({
            stock: update.newStock,
            availabilityType: update.newAvailability,
            updatedAt: sql`now()`
          })
          .where(eq(merch_products.id, update.productId));
      }

      for (const update of sizeStockUpdates) {
        await tx.update(merch_product_sizes)
          .set({ stock: update.newStock })
          .where(eq(merch_product_sizes.id, update.sizeId));
      }

      for (const update of variantStockUpdates) {
        await tx.update(merch_product_variants)
          .set({ stock: update.newStock })
          .where(eq(merch_product_variants.id, update.variantId));
      }

      await tx.update(merch_orders)
        .set({
          status: "TERVERIFIKASI",
          verifiedBy: user.id!,
          verifiedAt: sql`now()`,
          updatedAt: sql`now()`,
        })
        .where(eq(merch_orders.id, orderId));
    });
    
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
  const user = await requireAdmin();
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
