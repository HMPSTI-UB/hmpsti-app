"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Search } from "lucide-react";
import { DEPARTMENT_NOISE_TEXTURE, merchCategories, merchProducts } from "@/constant/data";
import type { MerchCategory } from "@/types/data";

import { useCart } from "../context/cart-context";
import { ProductCard } from "../components/product-card";
import { ProductFilter } from "../components/product-filter";
import { CartPopup } from "../components/cart-popup";

// --- ANIMATION HELPER ---
const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function MerchContent() {
  const { totalItems } = useCart();
  const [activeCategory, setActiveCategory] = useState<MerchCategory>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredProducts = merchProducts.filter((p) => {
    const matchCategory = activeCategory === "Semua" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden pb-32">
        {/* --- BACKGROUND FX --- */}
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#33A5D3]/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-60"></div>
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#F59E0B]/15 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-60"></div>
        <div
          className="fixed inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: DEPARTMENT_NOISE_TEXTURE }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
          {/* HEADER SECTION */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
                <ShoppingBag size={16} className="text-[#33A5D3]" />
                <span className="text-xs font-mono uppercase tracking-widest text-gray-300">
                  HMPSTI Store
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6 uppercase">
                Koleksi
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33A5D3] via-white to-[#F59E0B]">
                  Merchandise
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.5}>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Tampil kece dan bangga jadi anak TI. Jelajahi koleksi eksklusif dari Kabinet Innovara.
              </p>
            </FadeIn>
          </div>

          {/* SEARCH & CART */}
          <FadeIn delay={0.6}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari merchandise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#33A5D3]/50 transition-colors"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="relative text-gray-400 hover:text-white transition-colors"
                >
                  <ShoppingBag size={24} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#33A5D3] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
                <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
              </div>
            </div>
          </FadeIn>

          {/* FILTER */}
          <FadeIn delay={0.7}>
            <ProductFilter
              categories={merchCategories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </FadeIn>

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                Belum ada produk di kategori ini.
              </p>
            </div>
          )}
        </div>
      </div>

    </>
  );
}

export default function Merch() {
  return <MerchContent />;
}
