"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DashboardSidebar } from "./sidebar";
import { DashboardTopbar } from "./topbar";

export function DashboardShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white lg:flex">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 bg-[#0D0E11] border-r border-white/10 w-72">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu Admin</SheetTitle>
          </SheetHeader>
          <DashboardSidebar onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:flex w-64 shrink-0 bg-[#0D0E11] border-r border-white/10 sticky top-0 h-screen">
        <DashboardSidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <DashboardTopbar user={user} onMenuClick={() => setOpen(true)} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}