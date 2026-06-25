"use client";

import { AspirasiFab } from "@/components/AspirasiFab";
import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/features/merch/context/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Navbar />
      <CartProvider>
        {children}
      </CartProvider>
      <Footer />
      <AspirasiFab />
    </TooltipProvider>
  );
}
