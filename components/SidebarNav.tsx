"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  LayoutDashboard, 
  MonitorSmartphone, 
  History, 
  Calendar, 
  UserCog,
  ShoppingBag,
  Tags,
  ClipboardList,
  ScrollText,
  ChevronDown,
  ChevronRight,
  Radio,
  Store,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  onLinkClick?: () => void;
  className?: string;
}

export function SidebarNav({ onLinkClick, className }: SidebarNavProps) {
  const pathname = usePathname();
  
  // State for toggling sections (Accordion)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Pameran IoT": pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/merch") && !pathname.startsWith("/dashboard/settings"),
    "Merchandise": pathname.startsWith("/dashboard/merch"),
    "Pengaturan": pathname.startsWith("/dashboard/settings")
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navItems = [
    {
      header: "MENU UTAMA",
      groups: [
        {
          section: "Pameran IoT",
          icon: Radio,
          items: [
            {
              href: "/dashboard",
              label: "Overview",
              icon: LayoutDashboard,
              exact: true,
            },
            {
              href: "/dashboard/iot-teams",
              label: "Tim IoT",
              icon: MonitorSmartphone,
            },
            {
              href: "/dashboard/vote-sessions",
              label: "Sesi Voting",
              icon: Calendar,
            },
            {
              href: "/dashboard/vote-monitor",
              label: "Monitoring Vote",
              icon: History,
            },
          ],
        },
        {
          section: "Merchandise",
          icon: Store,
          items: [
            {
              href: "/dashboard/merch",
              label: "Dashboard",
              icon: LayoutDashboard,
              exact: true,
            },
            {
              href: "/dashboard/merch/products",
              label: "Produk",
              icon: ShoppingBag,
            },
            {
              href: "/dashboard/merch/categories",
              label: "Kategori",
              icon: Tags,
            },
            {
              href: "/dashboard/merch/orders",
              label: "Pesanan",
              icon: ClipboardList,
            },
            {
              href: "/dashboard/merch/audit-logs",
              label: "Log Aktivitas",
              icon: ScrollText,
            },
          ],
        },
      ]
    },
    {
      header: "PENGATURAN SISTEM",
      groups: [
        {
          section: "Pengaturan",
          icon: Settings,
          items: [
            {
              href: "/dashboard/settings",
              label: "Profil & Keamanan",
              icon: UserCog,
            },
          ],
        }
      ]
    }
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className={cn("flex-1 px-4 space-y-4 mt-4 overflow-y-auto pb-8", className)}>
      {navItems.map((block, bIdx) => (
        <div key={bIdx} className="space-y-2">
          {/* Static Uppercase Header */}
          <div className="pt-2 pb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
              {block.header}
            </p>
          </div>
          
          {/* Groups (Collapsible) */}
          {block.groups.map((group, gIdx) => {
            const isOpen = openSections[group.section] !== false; // default true if undefined
            const Icon = group.icon;
            
            return (
              <div key={gIdx} className="space-y-1">
                {/* Dropdown Toggle Button */}
                <button
                  onClick={() => toggleSection(group.section)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors",
                    isOpen && "text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium text-base">{group.section}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  ) : (
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  )}
                </button>

                {/* Sub Menu Items */}
                {isOpen && (
                  <div className="pl-4 space-y-1 mt-1">
                    {group.items.map((subItem) => (
                      <NavLink 
                        key={subItem.href} 
                        href={subItem.href} 
                        label={subItem.label} 
                        icon={subItem.icon} 
                        active={isActive(subItem.href, subItem.exact)}
                        onClick={onLinkClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function NavLink({ 
  href, 
  label, 
  icon: Icon, 
  active,
  onClick
}: { 
  href: string; 
  label: string; 
  icon: any; 
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors",
        active && "bg-blue-600/10 text-blue-500 font-semibold"
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span>{label}</span>
    </Link>
  );
}
