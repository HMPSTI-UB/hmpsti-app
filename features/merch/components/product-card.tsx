"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import type { MerchProduct } from "@/types/data";
import { useCart } from "../context/cart-context";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

export function ProductCard({
  product,
  index,
}: {
  product: MerchProduct;
  index: number;
}) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes ? product.sizes[0] : ""
  );

  const handleAddToCart = () => {
    addToCart(product, 1, selectedSize || undefined);
    toast.success(`${product.name} ditambahkan ke keranjang`, {
      description: selectedSize ? `Ukuran: ${selectedSize}` : "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative h-[480px] w-full rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 p-6 flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-[#33A5D3]/50 hover:shadow-[0_0_30px_-5px_rgba(51,165,211,0.3)]"
    >
      {/* Glow Effect */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#33A5D3]/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Image Container */}
      <Link href={`/merch/${product.id}`} className="block cursor-pointer">
        <div className="relative w-full h-48 mb-6 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-500">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-[10px] font-mono text-white uppercase tracking-wider font-bold">
              {product.category}
            </span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col relative z-10">
        <Link href={`/merch/${product.id}`} className="block w-fit cursor-pointer">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 line-clamp-1 group-hover:text-[#33A5D3] transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4 group-hover:text-gray-300 transition-colors">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest block mb-1">
              Harga
            </span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Rp {product.price.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* Size Selector & Add to Cart */}
      <div className="mt-4 pt-4 border-t border-white/10 relative z-10 flex items-center justify-between gap-3">
        {product.sizes && product.sizes.length > 0 ? (
          <select
            className="bg-white/5 border border-white/10 text-white text-xs font-mono uppercase rounded-lg px-2 py-2 w-20 outline-none focus:border-[#33A5D3]/50 transition-colors"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            {product.sizes.map((size) => (
              <option key={size} value={size} className="bg-[#0A0A0A]">
                {size}
              </option>
            ))}
          </select>
        ) : (
          <div className="w-20" /> // Spacer
        )}

        <button
          onClick={handleAddToCart}
          className="flex-1 group/btn relative flex items-center justify-center gap-2 py-2.5 bg-[#33A5D3]/10 text-[#33A5D3] hover:bg-[#33A5D3] hover:text-white rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300 border border-[#33A5D3]/30 hover:border-transparent overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          <ShoppingBag size={14} className="relative z-10" />
          <span className="relative z-10">Beli</span>
        </button>
      </div>
    </motion.div>
  );
}
