"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { findDashboardPath } from "@/constant/dashboard";
import { cn } from "@/lib/utils";

export function DashboardTopbar({
  user,
  onMenuClick,
}: {
  user: { name?: string | null; email?: string | null };
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const { crumbs } = findDashboardPath(pathname);
  const initial = (user.name ?? user.email ?? "A").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/10 bg-[#0a0a0b]/80 backdrop-blur px-4 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Buka menu"
        className="lg:hidden text-gray-400 hover:text-white transition-colors"
      >
        <Menu className="h-6 w-6" strokeWidth={1.75} />
      </button>

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-gray-500">Dashboard</span>
        {crumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-1.5 min-w-0">
            <span className="text-gray-600">/</span>
            <span
              className={cn(
                "truncate",
                idx === crumbs.length - 1 ? "text-white font-medium" : "text-gray-500",
              )}
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {user.name && (
          <span className="hidden sm:block text-sm text-gray-400 truncate max-w-[160px]">
            {user.name}
          </span>
        )}
        <div className="h-9 w-9 rounded-full bg-[#33A5D3]/15 border border-[#33A5D3]/30 flex items-center justify-center text-sm font-bold text-[#33A5D3] shrink-0">
          {initial}
        </div>
      </div>
    </header>
  );
}