"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import {
  Search,
  Loader2,
  Check,
  Clock,
  CircleCheckBig,
  XCircle,
  Package,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trackOrderByCode, type TrackedOrder } from "../actions/orders";

function rupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function fmtDate(value: Date | null) {
  if (!value) return null;
  return format(new Date(value), "dd MMM yyyy, HH:mm", { locale: localeID });
}

export function TrackOrder({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? "");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const runSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Masukkan kode pesanan terlebih dahulu.");
      return;
    }
    setError("");
    setOrder(null);
    startTransition(async () => {
      const res = await trackOrderByCode(trimmed);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setOrder(res.order);
    });
  };

  // Auto-lacak bila kode dikirim lewat URL (?code=...).
  useEffect(() => {
    if (initialCode?.trim()) runSearch(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(code);
        }}
        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0D0E11] p-5 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Masukkan kode pesanan, mis. ORD-20260930-0003"
            className="border-white/10 bg-white/5 pl-9 font-mono text-white placeholder:text-gray-600 focus-visible:ring-[#33A5D3]"
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="gap-2 bg-[#33A5D3] font-bold text-black hover:bg-[#33A5D3]/90"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Lacak
        </Button>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Result */}
      {order && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0D0E11] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  Kode Pesanan
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-white">
                    {order.orderCode}
                  </span>
                  <CopyButton value={order.orderCode} />
                </div>
              </div>
              <OrderBadge status={order.status} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/5 pt-5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  Tanggal Pesan
                </p>
                <p className="mt-0.5 text-sm text-gray-200">
                  {fmtDate(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  Jumlah Item
                </p>
                <p className="mt-0.5 text-sm text-gray-200">{order.itemCount} item</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  Total
                </p>
                <p className="mt-0.5 text-sm font-bold text-[#33A5D3]">
                  {rupiah(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-white/10 bg-[#0D0E11] p-6">
            <h3 className="mb-5 font-bold text-white">Status Pesanan</h3>
            <Timeline order={order} />
          </div>

          {order.status === "DITOLAK" && order.rejectionReason && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-red-400">
                Alasan Penolakan
              </p>
              <p className="mt-1 text-sm text-red-200">{order.rejectionReason}</p>
            </div>
          )}

          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#33A5D3] hover:underline"
          >
            Lihat detail pesanan <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Empty hint */}
      {!order && !error && !isPending && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0D0E11] px-6 py-16 text-center">
          <Package className="mb-4 h-12 w-12 text-gray-600" strokeWidth={1.5} />
          <p className="font-semibold text-gray-300">Lacak pesananmu</p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Masukkan kode pesanan (contoh: ORD-20260930-0003) untuk melihat status
            terkini.
          </p>
        </div>
      )}
    </div>
  );
}

function OrderBadge({ status }: { status: TrackedOrder["status"] }) {
  const styles: Record<string, string> = {
    MENUNGGU_VERIFIKASI: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    TERVERIFIKASI: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    DITOLAK: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  const labels: Record<string, string> = {
    MENUNGGU_VERIFIKASI: "Menunggu Verifikasi",
    TERVERIFIKASI: "Terverifikasi",
    DITOLAK: "Ditolak",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-3 py-1 text-[11px] font-semibold",
        styles[status] ?? "border-white/10 bg-white/5 text-gray-300",
      )}
    >
      {labels[status] ?? status}
    </Badge>
  );
}

function Timeline({ order }: { order: TrackedOrder }) {
  type State = "done" | "current" | "upcoming" | "failed";
  const isRejected = order.status === "DITOLAK";
  const isVerified = order.status === "TERVERIFIKASI";

  const steps: {
    title: string;
    desc: string;
    time: string | null;
    state: State;
    icon: typeof Check;
  }[] = [
    {
      title: "Pesanan Dibuat",
      desc: "Pesanan berhasil masuk ke sistem.",
      time: fmtDate(order.createdAt),
      state: "done",
      icon: CircleCheckBig,
    },
    {
      title: "Menunggu Verifikasi Pembayaran",
      desc: "Admin sedang memeriksa bukti pembayaranmu.",
      time: null,
      state: isVerified || isRejected ? "done" : "current",
      icon: Clock,
    },
    isRejected
      ? {
          title: "Pesanan Ditolak",
          desc: order.rejectionReason
            ? `Alasan: ${order.rejectionReason}`
            : "Pesanan ditolak oleh admin.",
          time: fmtDate(order.verifiedAt),
          state: "failed",
          icon: XCircle,
        }
      : {
          title: "Terverifikasi",
          desc: "Pembayaran valid, pesanan sedang disiapkan/dikirim.",
          time: isVerified ? fmtDate(order.verifiedAt) : null,
          state: isVerified ? "done" : "upcoming",
          icon: Check,
        },
  ];

  const dotClass: Record<State, string> = {
    done: "border-[#33A5D3] bg-[#33A5D3] text-black",
    current: "border-[#33A5D3] bg-[#33A5D3]/10 text-[#33A5D3]",
    upcoming: "border-white/10 bg-white/5 text-gray-500",
    failed: "border-red-500 bg-red-500/15 text-red-400",
  };

  const lineDone = (i: number) =>
    i === 0
      ? true
      : i === 1
        ? isVerified || isRejected
        : false;

  return (
    <ol className="relative space-y-6">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <li key={i} className="relative flex gap-4">
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "absolute left-[15px] top-9 h-[calc(100%+0.5rem)] w-px",
                  lineDone(i + 1) ? "bg-[#33A5D3]/50" : "bg-white/10",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                dotClass[s.state],
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="pt-0.5">
              <p
                className={cn(
                  "font-semibold",
                  s.state === "upcoming" ? "text-gray-500" : "text-white",
                  s.state === "failed" && "text-red-400",
                )}
              >
                {s.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">{s.desc}</p>
              {s.time && (
                <p className="mt-1 text-[11px] text-gray-600">{s.time}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
