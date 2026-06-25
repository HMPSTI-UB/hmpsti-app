"use client";

import { motion } from "framer-motion";
import type { MerchCategory } from "@/types/data";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-wrap items-center justify-center gap-3 my-12">
      {categories.map((category, idx) => {
        const isActive = activeCategory === category;
        return (
          <motion.button
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => onSelectCategory(category)}
            className={cn(
              "px-6 py-2.5 rounded-full font-mono text-xs uppercase tracking-widest transition-all duration-300 border cursor-pointer",
              isActive
                ? "bg-[#33A5D3] border-[#33A5D3] text-black font-bold shadow-[0_0_20px_rgba(51,165,211,0.3)]"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
            )}
          >
            {category}
          </motion.button>
        );
      })}
    </div>
  );
}
