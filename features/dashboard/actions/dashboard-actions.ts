"use server"

import { db } from "@/db"
import {
  users,
  merch_products,
  merch_categories,
  merch_orders,
  merch_audit_logs,
} from "@/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth-guards"

export async function getDashboardStats() {
  await requireAdmin();

  const [usersCount, productsCount, categoriesCount, ordersCount, pendingCount, revenueRes, recentOrders, recentActivity] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` }).from(merch_products),
      db.select({ count: sql<number>`count(*)::int` }).from(merch_categories),
      db.select({ count: sql<number>`count(*)::int` }).from(merch_orders),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(merch_orders)
        .where(eq(merch_orders.status, "MENUNGGU_VERIFIKASI")),
      db
        .select({
          total: sql<number | null>`coalesce(sum(${merch_orders.totalAmount}), 0)::int`,
        })
        .from(merch_orders)
        .where(eq(merch_orders.status, "TERVERIFIKASI")),
      db
        .select({
          id: merch_orders.id,
          orderCode: merch_orders.orderCode,
          buyerName: merch_orders.buyerName,
          totalAmount: merch_orders.totalAmount,
          status: merch_orders.status,
          createdAt: merch_orders.createdAt,
        })
        .from(merch_orders)
        .orderBy(desc(merch_orders.createdAt))
        .limit(6),
      db
        .select({
          id: merch_audit_logs.id,
          message: merch_audit_logs.message,
          action: merch_audit_logs.action,
          entity: merch_audit_logs.entity,
          createdAt: merch_audit_logs.createdAt,
          adminName: users.name,
        })
        .from(merch_audit_logs)
        .leftJoin(users, eq(merch_audit_logs.adminId, users.id))
        .orderBy(desc(merch_audit_logs.createdAt))
        .limit(8),
    ]);

  return {
    totalUsers: usersCount[0].count,
    totalProducts: productsCount[0].count,
    totalCategories: categoriesCount[0].count,
    totalOrders: ordersCount[0].count,
    pendingOrders: pendingCount[0].count,
    verifiedRevenue: revenueRes[0].total ?? 0,
    recentOrders,
    recentActivity,
  };
}