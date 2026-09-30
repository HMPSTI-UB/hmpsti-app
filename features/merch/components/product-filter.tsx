"use client";

import { cn } from "@/lib/utils";

export function ProductFilter({
  categories,
  activeCategory,
  onSelectCategory,
}: {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}) {
  return (
    <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.02] p-1">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={cn(
                "cursor-pointer rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors",
                isActive
                  ? "bg-[#33A5D3] text-black"
                  : "text-gray-400 hover:bg-white/5 hover:text-white",
              )}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
