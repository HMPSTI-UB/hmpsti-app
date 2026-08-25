"use client";

import { motion } from "framer-motion";
import type { MerchCategory } from "@/types/data";
import { cn } from "@/lib/utils";

const customEase: [number, number, number, number] = [0.32, 0.72, 0, 1];

export function ProductFilter({
  categories,
  activeCategory,
  onSelectCategory,
}: {
  categories: MerchCategory[];
  activeCategory: MerchCategory;
  onSelectCategory: (category: MerchCategory) => void;
}) {
  return (
    <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Double Bezel for filter container */}
      <div className="inline-flex p-1.5 bg-white/[0.02] border border-white/5 rounded-full backdrop-blur-xl">
        <div className="flex items-center gap-1 bg-[#0A0A0A]/80 rounded-[calc(9999px-0.375rem)] p-1">
          {categories.map((category, idx) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className="relative px-4 py-1.5 rounded-full group cursor-pointer transition-transform duration-500 hover:scale-[0.98] active:scale-[0.95]"
              >
                {/* Active Pill Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeFilterPill"
                    className="absolute inset-0 bg-[#33A5D3] rounded-full shadow-[0_0_15px_rgba(51,165,211,0.3)]"
                    transition={{ duration: 0.6, ease: customEase }}
                  />
                )}
                
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-500",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                  )}
                >
                  {category}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
