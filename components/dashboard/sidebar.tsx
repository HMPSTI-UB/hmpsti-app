"use client";

import { LogOut } from "lucide-react";
import { CldImage as Image } from "next-cloudinary";
import { brandLogo } from "@/constant/data";
import { logoutAction } from "@/features/auth/actions/logout";
import { SidebarNav } from "./sidebar-nav";

export function DashboardSidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image
            src={brandLogo}
            alt="Logo Kabinet Innovara"
            width={40}
            height={40}
            className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(51,165,211,0.5)]"
          />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            HMPSTI<span className="text-[#33A5D3]">.</span>
          </h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      <SidebarNav onLinkClick={onLinkClick} />

      <div className="p-4 border-t border-white/10 mt-auto">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
            <span className="font-medium text-sm">Keluar</span>
          </button>
        </form>
      </div>
    </div>
  );
}