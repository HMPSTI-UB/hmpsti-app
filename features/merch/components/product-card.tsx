"use client";

import { motion } from "framer-motion";
import type { MerchProduct } from "@/types/data";
import Link from "next/link";
import { cn } from "@/lib/utils";

const customEase: [number, number, number, number] = [0.32, 0.72, 0, 1];

export function ProductCard({
  product,
  index,
  isLarge = false,
}: {
  product: MerchProduct;
  index: number;
  isLarge?: boolean;
}) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: customEase }}
      className="group relative w-full h-[360px] md:h-[420px] cursor-pointer"
    >
      {/* DOUBLE BEZEL OUTER SHELL */}
      <div className="absolute inset-0 p-1 rounded-xl bg-white/[0.02] border border-white/[0.05] shadow-2xl transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[0.98]">
        {/* INNER CORE */}
        <div className="relative w-full h-full rounded-[calc(0.75rem-0.25rem)] bg-[#0A0A0A] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col">
          
          {/* IMAGE AREA */}
          <Link href={`/merch/${product.id}`} className="block relative w-full h-[65%] overflow-hidden bg-[#0F0F0F]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] opacity-80 group-hover:opacity-100 mix-blend-lighten"
            />
            {/* Minimal Category Tag */}
            <div className="absolute top-4 left-4">
              <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
                <span className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-medium">
                  {product.category}
                </span>
              </div>
            </div>
            
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80 pointer-events-none" />
          </Link>

          {/* CONTENT AREA */}
          <div className="flex-1 flex flex-col justify-start p-5 md:p-6 relative z-10 bg-[#0A0A0A]">
            <div className="flex flex-col h-full">
              <Link href={`/merch/${product.id}`} className="block w-fit">
                <h3 className={cn(
                  "font-medium tracking-tight text-white transition-colors duration-500 group-hover:text-[#33A5D3]",
                  isLarge ? "text-2xl md:text-3xl" : "text-xl"
                )}>
                  {product.name}
                </h3>
              </Link>
              
              <div className="flex items-end justify-between mt-auto">
              <span className={cn(
                "font-bold text-white tracking-wide",
                isLarge ? "text-xl md:text-2xl" : "text-base md:text-lg"
              )}>
                Rp {product.price.toLocaleString("id-ID")}
              </span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
