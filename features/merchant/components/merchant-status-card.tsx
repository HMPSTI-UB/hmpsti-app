import Link from "next/link";
import { Clock, CheckCircle2, XCircle, Store, ArrowRight } from "lucide-react";
import type { MerchantInfoData } from "../types";

const STATUS_META = {
  PENDING: {
    label: "Menunggu Verifikasi",
    desc: "Pengajuanmu sedang ditinjau admin. Kamu akan bisa menambah produk setelah disetujui.",
    icon: Clock,
    tone: "text-amber-400",
    chip: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  APPROVED: {
    label: "Merchant Aktif",
    desc: "Selamat! Toko kamu sudah aktif. Kamu bisa menambah produk dan rekening.",
    icon: CheckCircle2,
    tone: "text-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  REJECTED: {
    label: "Pengajuan Ditolak",
    desc: "Pengajuanmu ditolak. Silakan perbaiki data dan ajukan ulang.",
    icon: XCircle,
    tone: "text-red-400",
    chip: "bg-red-500/10 text-red-400 border-red-500/20",
  },
} as const;

export function MerchantStatusCard({ info }: { info: MerchantInfoData }) {
  const meta = STATUS_META[info.status];
  const Icon = meta.icon;

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0D0E11] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#33A5D3]/10 text-[#33A5D3]">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{info.storeName}</h2>
            <p className="text-xs text-gray-400">Status pengajuan merchant</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.chip}`}>
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
      </div>

      <p className="text-sm text-gray-400">{meta.desc}</p>

      {info.description && (
        <p className="border-t border-white/5 pt-3 text-sm text-gray-300">
          {info.description}
        </p>
      )}

      {info.status === "REJECTED" && info.rejectionReason && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          <span className="font-semibold">Alasan:</span> {info.rejectionReason}
        </div>
      )}

      {info.status === "APPROVED" && (
        <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4">
          <Link
            href="/account/my/products"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#33A5D3] px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-[#33A5D3]/90"
          >
            Produk Saya <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/account/my/accounts"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Rekening Toko
          </Link>
        </div>
      )}
    </div>
  );
}
