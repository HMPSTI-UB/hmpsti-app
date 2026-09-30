import Link from "next/link";
import { auth } from "@/auth";
import {
  ClipboardList,
  ShoppingBag,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  PackageSearch,
} from "lucide-react";
import { getUserOrderStats } from "../actions/orders";

export async function AccountOverviewPage() {
  const session = await auth();
  const user = session!.user;
  const stats = await getUserOrderStats();

  const initial = (user.name ?? user.email ?? "?").trim().charAt(0).toUpperCase();

  const cards = [
    { label: "Total Pesanan", value: stats.total, icon: ClipboardList, tone: "text-[#33A5D3]" },
    { label: "Menunggu", value: stats.pending, icon: Clock, tone: "text-amber-400" },
    { label: "Terverifikasi", value: stats.verified, icon: CheckCircle2, tone: "text-emerald-400" },
    { label: "Ditolak", value: stats.rejected, icon: XCircle, tone: "text-red-400" },
  ];

  const quickLinks = [
    { label: "Lihat Pesanan", desc: "Riwayat & status pesanan", href: "/account/orders", icon: ClipboardList },
    { label: "Lacak Pesanan", desc: "Cek status via kode", href: "/account/track", icon: PackageSearch },
    { label: "Keranjang", desc: "Lanjutkan checkout", href: "/account/cart", icon: ShoppingBag },
    { label: "Pengaturan", desc: "Profil & keamanan akun", href: "/account/settings", icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-2xl border border-white/10 bg-[#0D0E11] p-6 sm:p-7">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? "Avatar"}
              className="h-14 w-14 rounded-full border border-white/10 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#33A5D3]/25 bg-[#33A5D3]/15 text-lg font-bold text-[#33A5D3]">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight">
              {user.name ?? "Pengguna"}
            </h1>
            <p className="truncate text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-white/10 bg-[#0D0E11] p-5"
            >
              <Icon className={`h-5 w-5 ${card.tone}`} strokeWidth={1.75} />
              <p className="mt-3 text-2xl font-black text-white">{card.value}</p>
              <p className="text-xs font-medium text-gray-400">{card.label}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-white/10 bg-[#0D0E11] p-5 transition-colors hover:border-[#33A5D3]/40 hover:bg-[#33A5D3]/[0.04]"
            >
              <Icon className="h-5 w-5 text-[#33A5D3]" strokeWidth={1.75} />
              <p className="mt-3 font-semibold text-white group-hover:text-[#33A5D3]">
                {link.label}
              </p>
              <p className="text-xs text-gray-500">{link.desc}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}