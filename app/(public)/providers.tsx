"use client";

import { AspirasiFab } from "@/components/AspirasiFab";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Navbar />
      {children}
      <Footer />
      <AspirasiFab />
    </TooltipProvider>
  );
}
