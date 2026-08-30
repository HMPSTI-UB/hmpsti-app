"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { PublicProduct, PublicProductSize } from "../types";
import { useCart } from "../context/cart-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductDetail({ product }: { product: PublicProduct }) {
  const { addToCart } = useCart();
  const router = useRouter();

  
  const [selectedSize, setSelectedSize] = useState<PublicProductSize | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const currentStock = product.hasSizes ? selectedSize?.stock : product.stock;
  const isOutOfStock = product.availabilityType === "out_of_stock";
  const isPreorder = product.availabilityType === "preorder";

  const handleIncrement = () => {
    setQuantity((prev) => {
      if (!isPreorder && currentStock != null && prev >= currentStock) {
        toast.error("Kuantitas melebihi stok yang tersedia");
        return prev;
      }
      return prev + 1;
    });
  };
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    toast.success(`${product.name} ditambahkan ke keranjang`, {
      description: `Kuantitas: ${quantity}${selectedSize ? ` | Ukuran: ${selectedSize.sizeName}` : ""}`,
    });
  };

  const handleCheckout = () => {
    addToCart(product, quantity, selectedSize);
    router.push("/checkout");
  };


  const displayStock = isPreorder 
    ? "Preorder" 
    : isOutOfStock 
      ? "Habis" 
      : (currentStock != null ? `${currentStock} buah` : "Tersedia");

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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Images Gallery */}
          <div className="w-full md:col-span-4 lg:col-span-4 flex flex-col gap-4">
            {/* Main Image */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full aspect-square bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center relative group"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-[#33A5D3]/20 blur-[80px] opacity-0 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none" />
              
              <img 
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name} 
                className="w-full h-full object-cover relative z-10 transition-opacity duration-300"
              />
            </motion.div>

            {/* Thumbnails */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-3 w-full"
            >
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-1 aspect-square rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                    activeImageIndex === idx 
                      ? 'border-[#33A5D3] scale-[0.98]' 
                      : 'border-transparent hover:border-white/20 hover:scale-[0.98]'
                  }`}
                >
                  <img 
                    src={imgUrl} 
                    alt={`${product.name} view ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                  {/* Subtle dark overlay for inactive thumbnails */}
                  {activeImageIndex !== idx && (
                    <div className="absolute inset-0 bg-black/40 transition-colors duration-200" />
                  )}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Details */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-8 lg:col-span-7 flex flex-col justify-start md:pt-4 h-full"
          >
            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black mb-3 uppercase tracking-tighter leading-none">
              {product.name}
            </h1>
            <p className="text-[#33A5D3] text-lg font-bold tracking-widest uppercase mb-3">
              {product.categoryName || "Uncategorized"}
            </p>
            
            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-black text-white mb-2">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              <p className="text-gray-400 font-mono text-sm">
                Stock: <span className={isOutOfStock ? "text-[#F56C6C]" : isPreorder ? "text-[#33A5D3]" : "text-white"}>{displayStock}</span>
              </p>
            </div>

            {/* Size Options (if any) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <span className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Pilih Ukuran
                </span>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center border font-bold transition-all ${
                        selectedSize?.id === size.id
                          ? "bg-[#33A5D3] text-black border-[#33A5D3]"
                          : "bg-transparent text-white border-white/20 hover:border-white/50"
                      }`}
                    >
                      {size.sizeName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Quantity & Buttons */}
            <div className="mt-auto">
              
              {/* Quantity Selector (Shopee Style) */}
              <div className="flex items-center gap-6 mb-6">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest min-w-[80px]">
                  Kuantitas
                </span>
                
                <div className="flex items-center bg-[#1A1A1A] border border-white/10 rounded h-10">
                  <button 
                    onClick={handleDecrement}
                    className="w-10 h-full flex items-center justify-center hover:bg-white/5 hover:text-[#33A5D3] transition-colors border-r border-white/10 text-gray-400 hover:text-white"
                  >
                    <span className="text-xl font-medium leading-none mb-1">-</span>
                  </button>
                  
                  <div className="w-14 h-full flex items-center justify-center font-bold text-white text-sm">
                    {quantity}
                  </div>
                  
                  <button 
                    onClick={handleIncrement}
                    className="w-10 h-full flex items-center justify-center hover:bg-white/5 hover:text-[#33A5D3] transition-colors border-l border-white/10 text-gray-400 hover:text-white"
                  >
                    <span className="text-xl font-medium leading-none mb-1">+</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 border font-bold uppercase tracking-widest text-sm h-[52px] transition-all ${
                    isOutOfStock 
                      ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed" 
                      : "bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white border-white/10 hover:border-white/30 cursor-pointer"
                  }`}
                >
                  Keranjang
                </button>

                <button 
                  onClick={handleCheckout}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center font-black uppercase tracking-widest text-sm h-[52px] transition-all shadow-[0_0_20px_rgba(51,165,211,0.2)] ${
                    isOutOfStock 
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                      : "bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black cursor-pointer"
                  }`}
                >
                  {isPreorder ? "Preorder" : "Checkout"}
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
