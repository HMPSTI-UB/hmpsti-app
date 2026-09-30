"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  Store,
  Package,
  Wallet,
  PackageSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/features/auth/actions/logout";

type MerchantStatus = "PENDING" | "APPROVED" | "REJECTED" | null;

export function AccountNav({
  merchantStatus,
  onLinkClick,
}: {
  merchantStatus?: MerchantStatus;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Ringkasan", href: "/account", icon: LayoutDashboard, exact: true },
    { label: "Pesanan Saya", href: "/account/orders", icon: ClipboardList, exact: false },
    { label: "Lacak Pesanan", href: "/account/track", icon: PackageSearch, exact: false },
    { label: "Keranjang", href: "/account/cart", icon: ShoppingBag, exact: false },
    ...(merchantStatus === "APPROVED"
      ? [
          { label: "Produk Saya", href: "/account/my/products", icon: Package, exact: false },
          { label: "Rekening Toko", href: "/account/my/accounts", icon: Wallet, exact: false },
        ]
      : [
          { label: "Toko Saya", href: "/account/merchant", icon: Store, exact: false },
        ]),
    { label: "Pengaturan", href: "/account/settings", icon: ShieldCheck, exact: false },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/5 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#33A5D3]">
          Akun Saya
        </p>
        <h1 className="mt-1 text-lg font-bold tracking-tight text-white">
          HMPSTI<span className="text-[#33A5D3]">.</span> Store
        </h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#33A5D3]/10 text-[#33A5D3]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-white/10 p-3">
        <Link
          href="/merch"
          onClick={onLinkClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          <span>Lanjut Belanja</span>
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <span>Keluar</span>
          </button>
        </form>
      </div>
    </div>
  );
}