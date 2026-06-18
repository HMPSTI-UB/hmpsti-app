"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  LayoutDashboard, 
  MonitorSmartphone, 
  History, 
  Calendar, 
  UserCog 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  onLinkClick?: () => void;
  className?: string;
}

export function SidebarNav({ onLinkClick, className }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      section: "Pameran IoT",
      items: [
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
      section: "Pengaturan",
      items: [
        {
          href: "/dashboard/settings",
          label: "Profil & Keamanan",
          icon: UserCog,
        },
      ],
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className={cn("flex-1 px-4 space-y-2 mt-4 overflow-y-auto", className)}>
      {navItems.map((item, idx) => {
        if ("section" in item) {
          return (
            <div key={idx} className="space-y-2">
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                  {item.section}
                </p>
              </div>
              {item.items?.map((subItem) => (
                <NavLink 
                  key={subItem.href} 
                  href={subItem.href} 
                  label={subItem.label} 
                  icon={subItem.icon} 
                  active={isActive(subItem.href)}
                  onClick={onLinkClick}
                />
              ))}
            </div>
          );
        }

        return (
          <NavLink 
            key={item.href} 
            href={item.href} 
            label={item.label} 
            icon={item.icon} 
            active={isActive(item.href, item.exact)}
            onClick={onLinkClick}
          />
        );
      })}
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
      className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors aria-[current=page]:bg-blue-600/10 aria-[current=page]:text-blue-500"
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
