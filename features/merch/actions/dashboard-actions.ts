"use server"

import { db } from "@/db"
import { merch_products, merch_categories, merch_orders } from "@/db/schema"
import { sql } from "drizzle-orm"
import { requireUser } from "./_guards"

export async function getMerchDashboardStats() {
  await requireUser();

  const [totalProductsCount, totalCategoriesCount, orderStats] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(merch_products),
    db.select({ count: sql<number>`count(*)::int` }).from(merch_categories),
    db.select({
      status: merch_orders.status,
      count: sql<number>`count(*)::int`,
      totalAmount: sql<number>`COALESCE(SUM(${merch_orders.totalAmount}), 0)::int`
    })
    .from(merch_orders)
    .groupBy(merch_orders.status)
  ]);

  let verifiedOrders = 0;
  let pendingOrders = 0;
  let totalRevenue = 0;

  orderStats.forEach((stat) => {
    if (stat.status === 'TERVERIFIKASI') {
      verifiedOrders = stat.count;
      totalRevenue = stat.totalAmount;
    } else if (stat.status === 'MENUNGGU_VERIFIKASI') {
      pendingOrders = stat.count;
    }
  });

  const totalValidOrders = verifiedOrders + pendingOrders;

  return {
    totalProducts: totalProductsCount[0].count,
    totalCategories: totalCategoriesCount[0].count,
    totalOrders: totalValidOrders,
    verifiedOrders,
    pendingOrders,
    totalRevenue
  };
}
