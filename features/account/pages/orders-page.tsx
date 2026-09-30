import Link from "next/link";
import { ClipboardList, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { format } from "date-fns";
import { getUserOrders } from "../actions/orders";
import { OrderStatusBadge } from "../components/order-status-badge";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

const statusFilters = [
  { label: "Semua", value: "SEMUA" },
  { label: "Menunggu", value: "MENUNGGU_VERIFIKASI" },
  { label: "Terverifikasi", value: "TERVERIFIKASI" },
  { label: "Ditolak", value: "DITOLAK" },
];

function rupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const status = searchParams.status || "SEMUA";

  const { orders, total } = await getUserOrders({
    page,
    pageSize: PAGE_SIZE,
    status,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (nextPage: number, nextStatus: string) => {
    const params = new URLSearchParams();
    if (nextStatus && nextStatus !== "SEMUA") params.set("status", nextStatus);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return `/account/orders${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Pesanan Saya</h1>
        <p className="mt-1 text-sm text-gray-400">
          Riwayat dan status pesanan merch Anda.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const active = status === filter.value;
          return (
            <Link
              key={filter.value}
              href={buildHref(1, filter.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                active
                  ? "border-[#33A5D3] bg-[#33A5D3]/10 text-[#33A5D3]"
                  : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0D0E11] px-6 py-20 text-center">
          <ClipboardList className="mb-4 h-12 w-12 text-gray-600" strokeWidth={1.5} />
          <p className="font-semibold text-gray-300">Belum ada pesanan</p>
          <p className="mt-1 text-sm text-gray-500">
            Pesanan yang Anda buat akan muncul di sini.
          </p>
          <Link
            href="/merch"
            className="mt-6 rounded-full bg-[#33A5D3] px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#33A5D3]/90"
          >
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0D0E11] p-5 transition-colors hover:border-[#33A5D3]/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-white">
                    {order.orderCode}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")} ·{" "}
                  {order.itemCount} item
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-[#33A5D3]">
                  {rupiah(order.totalAmount)}
                </span>
                <Eye className="h-4 w-4 text-gray-500 transition-colors group-hover:text-[#33A5D3]" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href={buildHref(Math.max(1, page - 1), status)}
            aria-disabled={page <= 1}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10",
              page <= 1 && "pointer-events-none opacity-30",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="font-mono text-xs text-gray-400">
            {page} / {totalPages}
          </span>
          <Link
            href={buildHref(Math.min(totalPages, page + 1), status)}
            aria-disabled={page >= totalPages}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10",
              page >= totalPages && "pointer-events-none opacity-30",
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}