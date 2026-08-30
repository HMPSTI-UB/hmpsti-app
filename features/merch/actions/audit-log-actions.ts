"use server"

import { db } from "@/db"
import { merch_audit_logs } from "@/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import { requireUser } from "./_guards"

export async function recordAuditLog(
  adminId: string,
  entity: "category" | "product" | "order",
  entityId: number | null,
  action: "CREATE" | "UPDATE" | "DELETE" | "VERIFY" | "REJECT",
  message: string
) {
  try {
    await db.insert(merch_audit_logs).values({
      adminId,
      entity,
      entityId,
      action,
      message,
    });
  } catch (error) {
    // Best-effort logging: hanya console.error, tidak dilempar (throw) agar
    // tidak menggagalkan proses bisnis utama (seperti persetujuan pesanan).
    console.error(`Gagal mencatat audit log [${action} ${entity}]:`, error);
  }
}

export async function getAuditLogs(params: {
  page?: number;
  pageSize?: number | "ALL";
  entity?: string;
}) {
  await requireUser();

  const { page = 1, pageSize = 10, entity } = params;

  let whereClause = undefined;
  if (entity && entity !== "all") {
    whereClause = eq(merch_audit_logs.entity, entity as any);
  }

  const countQuery = db
    .select({ total: sql<number>`count(*)` })
    .from(merch_audit_logs)
    .where(whereClause);

  const baseQuery = db
    .select({
      id: merch_audit_logs.id,
      adminId: merch_audit_logs.adminId,
      entity: merch_audit_logs.entity,
      entityId: merch_audit_logs.entityId,
      action: merch_audit_logs.action,
      message: merch_audit_logs.message,
      createdAt: merch_audit_logs.createdAt,
    })
    .from(merch_audit_logs)
    .where(whereClause)
    .orderBy(desc(merch_audit_logs.createdAt));

  let logs;
  let total = 0;
  
  if (pageSize === "ALL") {
    const [logsRes, [{ total: totalRes }]] = await Promise.all([baseQuery, countQuery]);
    logs = logsRes;
    total = Number(totalRes);
  } else {
    const offset = (page - 1) * pageSize;
    const [logsRes, [{ total: totalRes }]] = await Promise.all([baseQuery.limit(pageSize as number).offset(offset), countQuery]);
    logs = logsRes;
    total = Number(totalRes);
  }

  return { logs, total };
}
