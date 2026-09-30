"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AccountNav } from "./account-nav";

export function AccountShell({
  userName,
  merchantStatus,
  children,
}: {
  userName?: string | null;
  merchantStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white lg:flex">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-72 border-r border-white/10 bg-[#0D0E11] p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu Akun</SheetTitle>
          </SheetHeader>
          <AccountNav merchantStatus={merchantStatus} onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-[#0D0E11] lg:flex">
        <AccountNav merchantStatus={merchantStatus} />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-[#0a0a0b]/80 px-5 py-4 backdrop-blur-md lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Buka menu akun"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-white">
              {userName ?? "Pengguna"}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Dashboard Pengguna
            </p>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}