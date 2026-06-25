"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MerchProduct } from "@/types/data";
import { useCart } from "../context/cart-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ShoppingBag, ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductDetail({ product }: { product: MerchProduct }) {
  const { addToCart } = useCart();
  const router = useRouter();
  
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes ? product.sizes[0] : ""
  );
  const [quantity, setQuantity] = useState<number>(1);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || undefined);
    toast.success(`${product.name} ditambahkan ke keranjang`, {
      description: `Kuantitas: ${quantity}${selectedSize ? ` | Ukuran: ${selectedSize}` : ""}`,
    });
  };

  const handleCheckout = () => {
    addToCart(product, quantity, selectedSize || undefined);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Effect */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#33A5D3]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Back Button */}
        <Link 
          href="/merch"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#33A5D3] transition-colors mb-8 text-sm font-bold tracking-widest uppercase"
        >
          <ArrowLeft size={16} />
          Kembali ke Katalog
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column: Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full aspect-square bg-[#1A1A1A] rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center relative group"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-[#33A5D3]/20 blur-[80px] opacity-0 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none" />
            
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover relative z-10"
            />
          </motion.div>

          {/* Right Column: Details */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-tighter">
              {product.name}
            </h1>
            <p className="text-[#33A5D3] text-lg font-bold tracking-widest uppercase mb-8">
              {product.category}
            </p>
            
            <div className="mb-10">
              <p className="text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mb-8">
              <p className="text-4xl font-black text-white mb-2">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              <p className="text-gray-400 font-mono text-sm">
                Stock: <span className="text-white">Tersedia</span>
              </p>
            </div>

            {/* Size Options (if any) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <span className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Pilih Ukuran
                </span>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center border font-bold transition-all ${
                        selectedSize === size
                          ? "bg-[#33A5D3] text-black border-[#33A5D3]"
                          : "bg-transparent text-white border-white/20 hover:border-white/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Quantity & Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-4 mt-auto pt-8 border-t border-white/10">
              
              {/* Quantity Selector */}
              <div className="flex bg-[#1A1A1A] border border-white/10 rounded w-[100px] sm:w-[120px] h-[52px]">
                <div className="flex-1 flex items-center justify-center font-bold text-xl border-r border-white/10">
                  {quantity}
                </div>
                <div className="flex flex-col w-10">
                  <button 
                    onClick={handleIncrement}
                    className="flex-1 flex items-center justify-center hover:bg-white/5 hover:text-[#33A5D3] border-b border-white/10 transition-colors"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button 
                    onClick={handleDecrement}
                    className="flex-1 flex items-center justify-center hover:bg-white/5 hover:text-[#33A5D3] transition-colors"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white border border-white/10 hover:border-white/30 font-bold uppercase tracking-widest text-sm h-[52px] transition-all"
              >
                Keranjang
              </button>

              <button 
                onClick={handleCheckout}
                className="flex-1 flex items-center justify-center bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-black uppercase tracking-widest text-sm h-[52px] transition-all shadow-[0_0_20px_rgba(51,165,211,0.2)]"
              >
                Checkout
              </button>

            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
