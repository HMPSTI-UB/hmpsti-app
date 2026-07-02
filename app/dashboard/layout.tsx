"use client";

import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { logoutAction } from "@/features/auth/actions/logout";
import { SidebarNav } from "@/components/SidebarNav";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CldImage as Image } from "next-cloudinary";
import { brandLogo } from "@/constant/data";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark text-white">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-white/5 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Image
            src={brandLogo}
            alt="Logo Kabinet Innovara"
            width={32}
            height={32}
            className="h-8 w-auto object-contain drop-shadow-[0_0_10px_rgba(51,165,211,0.5)]"
          />
          <h1 className="text-xl font-bold tracking-tight text-white">HMPSTI<span className="text-blue-500">.</span></h1>
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-dark border-r border-white/10 w-72">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-white/10">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white">
                    <Image
                      src={brandLogo}
                      alt="Logo Kabinet Innovara"
                      width={40}
                      height={40}
                      className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(51,165,211,0.5)]"
                    />
                    <span>HMPSTI<span className="text-blue-500">.</span></span>
                  </SheetTitle>
                  <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
                </SheetHeader>
              </div>
              
              <SidebarNav onLinkClick={() => setOpen(false)} />

              <div className="p-4 border-t border-white/10 mt-auto">
                <form action={logoutAction}>
                  <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Keluar</span>
                  </button>
                </form>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex w-64 bg-white/5 border-r border-white/10 flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Image
              src={brandLogo}
              alt="Logo Kabinet Innovara"
              width={40}
              height={40}
              className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(51,165,211,0.5)]"
            />
            <h1 className="text-2xl font-bold tracking-tight text-white">HMPSTI<span className="text-blue-500">.</span></h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
        </div>
        
        <SidebarNav />

        <div className="p-4 border-t border-white/10 mt-auto">
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  );
}
