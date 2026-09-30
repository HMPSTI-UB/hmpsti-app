"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { DEPARTMENT_NOISE_TEXTURE } from "@/constant/data";
import type { PublicProduct } from "../types";

import { useCart } from "../context/cart-context";
import { ProductCard } from "../components/product-card";
import { ProductFilter } from "../components/product-filter";
import { CartPopup } from "../components/cart-popup";
import { cn } from "@/lib/utils";

// --- CUSTOM EASE ---
const customEase: [number, number, number, number] = [0.32, 0.72, 0, 1];

const FadeIn = ({
  children,
  delay = 0,
  y = 30,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) => (
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

function MerchContent({
  categories,
  products,
}: {
  categories: any[];
  products: PublicProduct[];
}) {
  const { totalItems } = useCart();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 12;

  const categoryNames = ["Semua", ...categories.map((c) => c.name)];

  // Search only drives the suggestion panel — it does not filter the grid.
  const query = searchQuery.trim().toLowerCase();
  const matchedCategories = query
    ? categories.filter((c) => c.name.toLowerCase().includes(query)).slice(0, 5)
    : [];
  const matchedProducts = query
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            (p.categoryName ?? "").toLowerCase().includes(query),
        )
        .slice(0, 6)
    : [];
  const hasSuggestions =
    query.length > 0 &&
    (matchedCategories.length > 0 || matchedProducts.length > 0);
  const showSuggestions = isSearchFocused && query.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCategory = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const handleSelectProduct = (id: number) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    router.push(`/merch/${id}`);
  };

  const filteredProducts = products.filter(
    (p) => activeCategory === "Semua" || p.categoryName === activeCategory,
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
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
          {/* EDITORIAL HERO */}
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs uppercase tracking-[0.3em] text-[#33A5D3] font-medium mb-4 block">
                HMPSTI MERCH
              </span>
              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white leading-[0.95] mb-6">
                Jelajah
                <span className="text-[#33A5D3]">
                  <br />
                  Teknologi
                </span>
              </h1>
              <p className="text-gray-400 max-w-lg text-base md:text-lg leading-relaxed">
                Koleksi merch eksklusif Mahasiswa Teknologi Informasi UB yang
                membawa{" "}
                <strong className="text-white font-semibold">
                  {" "}
                  identitas, semangat, dan kebersamaan di setiap langkah.
                </strong>
              </p>
            </motion.div>
          </div>
          {/* TOP NAV/ISLAND (Search + Cart) */}
          <FadeIn
            delay={0.1}
            y={-20}
            className="w-full flex justify-center mb-8 md:mb-12 relative z-50"
          >
            <div ref={searchBoxRef} className="w-[90%] max-w-3xl relative">
              {/* Double-Bezel Outer Shell */}
              <div className="p-1.5 bg-white/[0.02] border border-white/5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                {/* Inner Core */}
                <div className="flex items-center gap-2 bg-[#050505]/80 rounded-[calc(9999px-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] px-4 py-2 relative">
                  <Search size={16} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Cari Produk..."
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-300 focus:outline-none w-full py-1.5"
                  />
                  <div className="w-[1px] h-4 bg-white/10 mx-2" />
                  <button
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className="relative group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <ShoppingBag
                      size={16}
                      className="text-gray-400 group-hover:text-white transition-colors"
                    />
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
                  <CartPopup
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                  />
                </div>
              </div>

              {/* SEARCH RECOMMENDATIONS */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/95 shadow-2xl backdrop-blur-2xl">
                  {hasSuggestions ? (
                    <>
                      {matchedCategories.length > 0 && (
                        <div className="p-2">
                          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Kategori
                          </p>
                          {matchedCategories.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => handleSelectCategory(c.name)}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-colors hover:bg-white/5"
                            >
                              <Tag
                                size={14}
                                className="shrink-0 text-[#33A5D3]"
                              />
                              <span className="truncate">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {matchedProducts.length > 0 && (
                        <div className="border-t border-white/5 p-2">
                          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Produk
                          </p>
                          {matchedProducts.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleSelectProduct(p.id)}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
                            >
                              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-white/5">
                                {p.images?.[0] && (
                                  <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className="h-full w-full object-contain p-1"
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm text-gray-200">
                                  {p.name}
                                </p>
                                <p className="truncate text-[11px] text-gray-500">
                                  {p.categoryName || "Uncategorized"}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-gray-500">
                      Tidak ada produk atau kategori yang cocok.
                    </div>
                  )}
                </div>
              )}
            </div>
          </FadeIn>

          {/* FILTER */}
          <ProductFilter
            categories={categoryNames}
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              setCurrentPage(1);
            }}
          />

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6 mt-8 md:mt-12">
            {currentProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300",
                        currentPage === page
                          ? "bg-[#33A5D3] text-black shadow-[0_0_15px_rgba(51,165,211,0.5)]"
                          : "bg-white/5 border border-white/10 text-white hover:bg-white/10",
                      )}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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

export default function Merch({
  categories,
  products,
}: {
  categories: any[];
  products: PublicProduct[];
}) {
  return <MerchContent categories={categories} products={products} />;
}
