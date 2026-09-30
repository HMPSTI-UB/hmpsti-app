import {
  Users,
  Package,
  ClipboardList,
  Wallet,
  Activity,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { getDashboardStats } from "@/features/dashboard/actions/dashboard-actions";
import { cn } from "@/lib/utils";

const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const statusMeta: Record<string, string> = {
  MENUNGGU_VERIFIKASI: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  TERVERIFIKASI: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DITOLAK: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusLabel: Record<string, string> = {
  MENUNGGU_VERIFIKASI: "Menunggu",
  TERVERIFIKASI: "Terverifikasi",
  DITOLAK: "Ditolak",
};

const actionMeta: Record<string, { icon: LucideIcon; className: string }> = {
  CREATE: { icon: Plus, className: "bg-emerald-500/10 text-emerald-400" },
  UPDATE: { icon: Pencil, className: "bg-[#33A5D3]/10 text-[#33A5D3]" },
  DELETE: { icon: Trash2, className: "bg-red-500/10 text-red-400" },
  VERIFY: { icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-400" },
  REJECT: { icon: XCircle, className: "bg-red-500/10 text-red-400" },
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h2>
          <p className="text-gray-400 text-sm mt-1">Ringkasan aktivitas sistem HMPSTI UB</p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">
          {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
        </p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          href="/dashboard/settings"
          label="Pengguna"
          value={stats.totalUsers.toLocaleString("id-ID")}
          caption="Akun terdaftar"
          icon={Users}
        />
        <StatCard
          href="/dashboard/merch/products"
          label="Produk"
          value={stats.totalProducts.toLocaleString("id-ID")}
          caption={`${stats.totalCategories.toLocaleString("id-ID")} kategori`}
          icon={Package}
        />
        <StatCard
          href="/dashboard/merch/orders"
          label="Pesanan"
          value={stats.totalOrders.toLocaleString("id-ID")}
          caption={
            stats.pendingOrders > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {stats.pendingOrders.toLocaleString("id-ID")} menunggu verifikasi
              </span>
            ) : (
              "Tidak ada antrean"
            )
          }
          icon={ClipboardList}
        />
        <StatCard
          href="/dashboard/merch/orders"
          label="Pendapatan"
          value={rupiah(stats.verifiedRevenue)}
          caption="Pesanan terverifikasi"
          icon={Wallet}
        />
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        <section className="lg:col-span-3 bg-[#0D0E11] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Activity className="h-4 w-4 text-[#33A5D3]" strokeWidth={1.75} />
              Aktivitas Terbaru
            </h3>
            <Link
              href="/dashboard/merch/audit-logs"
              className="text-xs text-gray-500 hover:text-[#33A5D3] transition-colors"
            >
              Lihat Semua
            </Link>
          </div>

          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm">Belum ada aktivitas tercatat.</p>
              <p className="text-xs text-gray-600 mt-1">Aktivitas admin (tambah/ubah produk, verifikasi pesanan, dll.) akan muncul di sini.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {stats.recentActivity.map((log) => {
                const meta = actionMeta[log.action] ?? actionMeta.UPDATE;
                const Icon = meta.icon;
                return (
                  <li key={log.id} className="flex items-start gap-3 py-3">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", meta.className)}>
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 leading-snug line-clamp-2">{log.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {log.adminName ?? "Admin"} ·{" "}
                        {formatDistanceToNow(log.createdAt, { addSuffix: true, locale: id })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2 bg-[#0D0E11] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <ClipboardList className="h-4 w-4 text-[#33A5D3]" strokeWidth={1.75} />
              Pesanan Terbaru
            </h3>
            <Link
              href="/dashboard/merch/orders"
              className="text-xs text-gray-500 hover:text-[#33A5D3] transition-colors"
            >
              Lihat Semua
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm">Belum ada pesanan masuk.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {order.orderCode} · {order.buyerName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDistanceToNow(order.createdAt, { addSuffix: true, locale: id })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-white shrink-0">{rupiah(order.totalAmount)}</span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border shrink-0",
                      statusMeta[order.status],
                    )}
                  >
                    {statusLabel[order.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  href,
}: {
  label: string;
  value: React.ReactNode;
  caption: React.ReactNode;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0D0E11] p-5 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#33A5D3]/60 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-white truncate">{value}</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-[#33A5D3]/10 flex items-center justify-center shrink-0 group-hover:bg-[#33A5D3]/20 transition-colors">
          <Icon className="h-5 w-5 text-[#33A5D3]" strokeWidth={1.75} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">{caption}</span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 group-hover:text-[#33A5D3] transition-colors shrink-0">
          Kelola
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}