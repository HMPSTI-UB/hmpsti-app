import {
  LayoutDashboard,
  Cpu,
  MonitorSmartphone,
  Calendar,
  History,
  ShoppingBag,
  Package,
  ClipboardList,
  ScrollText,
  Store,
  Wallet,
  UserCog,
  ShieldCheck,
  Globe,
  type LucideIcon,
} from "lucide-react";

export type DashboardLinkItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type DashboardModule = {
  type: "module";
  label: string;
  icon: LucideIcon;
  items: DashboardLinkItem[];
};

export type DashboardNavItem =
  | { type: "link"; label: string; href: string; icon: LucideIcon; exact?: boolean }
  | DashboardModule;

export const dashboardNav: DashboardNavItem[] = [
  {
    type: "link",
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    type: "module",
    label: "Pameran",
    icon: Cpu,
    items: [
      { label: "Tim", href: "/dashboard/teams", icon: MonitorSmartphone },
      { label: "Sesi Voting", href: "/dashboard/vote-sessions", icon: Calendar },
      { label: "Monitoring Vote", href: "/dashboard/vote-monitor", icon: History },
    ],
  },
  {
    type: "module",
    label: "Jelajah Teknologi",
    icon: ShoppingBag,
    items: [
      { label: "Produk & Kategori", href: "/dashboard/merch/products", icon: Package },
      { label: "Merchant", href: "/dashboard/merch/merchants", icon: Store },
      { label: "Rekening", href: "/dashboard/merch/accounts", icon: Wallet },
      { label: "Pesanan", href: "/dashboard/merch/orders", icon: ClipboardList },
      { label: "Audit Log", href: "/dashboard/merch/audit-logs", icon: ScrollText },
    ],
  },
  {
    type: "module",
    label: "Pengaturan",
    icon: UserCog,
    items: [
      { label: "Pengaturan Website", href: "/dashboard/site-settings", icon: Globe },
      { label: "Profil & Keamanan", href: "/dashboard/settings", icon: ShieldCheck },
    ],
  },
];

type DashboardPath = {
  title: string;
  crumbs: string[];
  href: string;
};

export function findDashboardPath(pathname: string): DashboardPath {
  for (const item of dashboardNav) {
    if (item.type === "link") {
      if (item.exact ? pathname === item.href : pathname.startsWith(item.href)) {
        return { title: item.label, crumbs: [item.label], href: item.href };
      }
      continue;
    }

    const child = item.items.find((sub) => pathname.startsWith(sub.href));
    if (child) {
      return { title: child.label, crumbs: [item.label, child.label], href: child.href };
    }
  }

  return { title: "Dashboard", crumbs: ["Dashboard"], href: "/dashboard" };
}

export function findActiveModule(pathname: string): string | undefined {
  const entry = dashboardNav.find(
    (item) =>
      item.type === "module" && item.items.some((sub) => pathname.startsWith(sub.href)),
  );
  return entry?.type === "module" ? entry.label : undefined;
}

export function isDashboardActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname.startsWith(href);
}