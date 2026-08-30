import { getAuditLogs } from "@/features/merch/actions/audit-log-actions";
import { AuditLogTable } from "@/features/merch/components/audit-log-table";

export const metadata = {
  title: "Audit Log Merchandise - Admin HMPSTI",
  description: "Riwayat aktivitas admin untuk modul merchandise HMPSTI.",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; entity?: string; pageSize?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;
  const entity = resolvedSearchParams.entity || "all";
  const pageSizeParam = resolvedSearchParams.pageSize || "10";
  const pageSize = pageSizeParam === "ALL" ? "ALL" : parseInt(pageSizeParam, 10);

  const { logs, total } = await getAuditLogs({
    page,
    pageSize,
    entity,
  });

  const totalPages = pageSize === "ALL" ? 1 : Math.ceil(total / (pageSize as number));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Log</h2>
          <p className="text-muted-foreground">
            Rekap riwayat aktivitas manajemen produk, kategori, dan verifikasi pesanan.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <AuditLogTable 
          logs={logs as Extract<typeof logs, any[]>} 
          totalItemCount={total} 
          currentPage={page} 
          totalPages={totalPages} 
          currentFilter={entity}
          pageSize={pageSizeParam}
        />
      </div>
    </div>
  );
}
