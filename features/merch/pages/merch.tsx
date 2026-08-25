"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { DEPARTMENT_NOISE_TEXTURE, merchCategories, merchProducts } from "@/constant/data";
import type { MerchCategory } from "@/types/data";

import { useCart } from "../context/cart-context";
import { ProductCard } from "../components/product-card";
import { ProductFilter } from "../components/product-filter";
import { CartPopup } from "../components/cart-popup";
import { cn } from "@/lib/utils";

// --- CUSTOM EASE ---
const customEase: [number, number, number, number] = [0.32, 0.72, 0, 1];

const FadeIn = ({ children, delay = 0, y = 30, className }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y, filter: "blur(8px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 1, delay, ease: customEase }}
    className={className}
  >
    {children}
  </motion.div>
);

function MerchContent() {
  const { totalItems } = useCart();
  const [activeCategory, setActiveCategory] = useState<MerchCategory>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;

  const filteredProducts = merchProducts.filter((p) => {
    const matchCategory = activeCategory === "Semua" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <div className="relative min-h-[100dvh] bg-[#020202] text-white overflow-hidden pb-40">
        {/* --- ETHEREAL GLASS FX --- */}
        <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="fixed top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-[#33A5D3]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="fixed bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-emerald-900/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
        
        {/* NOISE OVERLAY */}
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay"
          style={{ backgroundImage: DEPARTMENT_NOISE_TEXTURE }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 md:pt-32">
          
          {/* TOP NAV/ISLAND (Search + Cart) */}
          <FadeIn delay={0.1} y={-20} className="w-full flex justify-center mb-8 md:mb-12 relative z-50">
            <div className="w-[90%] max-w-[500px]">
              {/* Double-Bezel Outer Shell */}
              <div className="p-1.5 bg-white/[0.02] border border-white/5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                {/* Inner Core */}
                <div className="flex items-center gap-2 bg-[#050505]/80 rounded-[calc(9999px-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] px-4 py-2 relative">
                  <Search size={16} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Cari Produk..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // reset page on search
                    }}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none w-full py-1.5"
                  />
                  <div className="w-[1px] h-4 bg-white/10 mx-2" />
                  <button
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className="relative group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <ShoppingBag size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                    <AnimatePresence>
                      {totalItems > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 bg-[#33A5D3] text-black text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none"
                        >
                          {totalItems}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* EDITORIAL HERO */}
          <div className="flex flex-col gap-4 mb-16 md:mb-24 items-start">
            <FadeIn delay={0.3}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tighter leading-tight text-white drop-shadow-2xl">
                HMPSTI{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-white to-amber-500">
                  STORE
                </span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.4}>
              <p className="text-gray-400 text-sm md:text-xl max-w-3xl leading-relaxed">
                Tampil kece dan bangga jadi anak TI. Jelajahi koleksi eksklusif dari <span className="text-white font-bold uppercase">KABINET INNOVARA</span>, dirancang dengan presisi dan estetika modern.
              </p>
            </FadeIn>
          </div>

          {/* FILTER */}
          <FadeIn delay={0.5} y={40}>
            <ProductFilter
              categories={merchCategories}
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setCurrentPage(1); // reset page on filter change
              }}
            />
          </FadeIn>

          {/* ASYMMETRICAL BENTO GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 mt-8 md:mt-12">
            {currentProducts.map((product, idx) => {
              // Exact 3 signature products per page (indices 0, 3, 7 on the current page)
              const isLarge = idx === 0 || idx === 3 || idx === 7;
              const colSpanClass = isLarge ? "lg:col-span-8" : "lg:col-span-4";
              
              return (
                <div key={product.id} className={`${colSpanClass} col-span-1`}>
                  <ProductCard product={product} index={idx} isLarge={isLarge} />
                </div>
              );
            })}
          </div>
          
          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16 md:mt-24">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-2 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300",
                      currentPage === page
                        ? "bg-[#33A5D3] text-black shadow-[0_0_15px_rgba(51,165,211,0.5)]"
                        : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          
          <AnimatePresence>
            {filteredProducts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="text-center py-40"
              >
                <p className="text-gray-500 text-sm uppercase tracking-widest font-medium">
                  Belum ada produk di kategori ini.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export default function Merch() {
  return <MerchContent />;
}
