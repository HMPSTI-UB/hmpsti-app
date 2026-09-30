"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  dashboardNav,
  findActiveModule,
  isDashboardActive,
  type DashboardLinkItem,
  type DashboardModule,
} from "@/constant/dashboard";

const STORAGE_KEY = "hmpsti:dashboard:nav";

export function SidebarNav({
  onLinkClick,
  className,
}: {
  onLinkClick?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const activeModule = useMemo(() => findActiveModule(pathname), [pathname]);

  const [open, setOpen] = useState<Record<string, boolean>>(() => ({
    [activeModule ?? ""]: true,
  }));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let saved: Record<string, boolean> | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    } catch {
      saved = null;
    }
    if (saved && typeof saved === "object") setOpen(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
    } catch {
      /* ignore quota/private-mode errors */
    }
  }, [open, hydrated]);

  useEffect(() => {
    if (!activeModule) return;
    setOpen((prev) => (prev[activeModule] ? prev : { ...prev, [activeModule]: true }));
  }, [pathname, activeModule]);

  const toggle = (label: string) =>
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <nav className={cn("flex-1 px-3 py-4 space-y-1 overflow-y-auto", className)}>
      {dashboardNav.map((item) =>
        item.type === "link" ? (
          <NavLink
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            active={isDashboardActive(pathname, item.href, item.exact)}
            onClick={onLinkClick}
          />
        ) : (
          <ModuleGroup
            key={item.label}
            module={item}
            open={!!open[item.label]}
            reduceMotion={!!reduceMotion}
            pathname={pathname}
            onToggle={() => toggle(item.label)}
            onLinkClick={onLinkClick}
          />
        ),
      )}
    </nav>
  );
}

function ModuleGroup({
  module,
  open,
  reduceMotion,
  pathname,
  onToggle,
  onLinkClick,
}: {
  module: DashboardModule;
  open: boolean;
  reduceMotion: boolean;
  pathname: string;
  onToggle: () => void;
  onLinkClick?: () => void;
}) {
  const Icon = module.icon;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
          open
            ? "text-white"
            : "text-gray-400 hover:text-white hover:bg-white/5",
        )}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
        <span className="flex-1 text-left font-medium">{module.label}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-gray-500 transition-transform duration-300", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-3 space-y-1">
              {module.items.map((sub) => (
                <SubLink
                  key={sub.href}
                  item={sub}
                  active={isDashboardActive(pathname, sub.href)}
                  onClick={onLinkClick}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavLink({
  label,
  href,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-[#33A5D3]/10 text-[#33A5D3]"
          : "text-gray-400 hover:text-white hover:bg-white/5",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
      <span>{label}</span>
    </Link>
  );
}

function SubLink({
  item,
  active,
  onClick,
}: {
  item: DashboardLinkItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 pl-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-[#33A5D3]/10 text-[#33A5D3]"
          : "text-gray-400 hover:text-white hover:bg-white/5",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-[#33A5D3]" />
      )}
      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
      <span>{item.label}</span>
    </Link>
  );
}