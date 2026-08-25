"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, MessageCircle } from "lucide-react";
import { useCart } from "../context/cart-context";
import { cn } from "@/lib/utils";

export function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } =
    useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Build WhatsApp message
    let message = `Halo Admin, saya ingin memesan merch:\n\n`;
    items.forEach((item, index) => {
      const sizeStr = item.selectedSize ? ` (Ukuran: ${item.selectedSize})` : "";
      message += `${index + 1}. ${item.product.name}${sizeStr} x${item.quantity} = Rp ${(item.product.price * item.quantity).toLocaleString("id-ID")}\n`;
    });
    message += `\n*Total Item:* ${totalItems}\n*Total Harga:* Rp ${totalPrice.toLocaleString("id-ID")}\n\nMohon informasi pembayarannya. Terima kasih!`;

    // Encode and redirect
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6282218361690?text=${encodedMessage}`, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[101] w-full md:w-[400px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#33A5D3]/10 rounded-lg text-[#33A5D3]">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tighter uppercase">
                    Keranjang
                  </h2>
                  <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                    {totalItems} Item
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                  <ShoppingBag size={48} className="opacity-20 mb-4" />
                  <p className="font-bold text-gray-400">Keranjang Kosong</p>
                  <p className="text-sm">Yuk, tambah produk merch favoritmu!</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-white font-bold text-sm line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400/50 hover:text-red-400 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-gray-400 text-xs mb-2">
                        {item.selectedSize ? `Ukuran: ${item.selectedSize}` : "Aksesoris"}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-[#33A5D3] font-black text-sm">
                          Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}
                        </span>
                        
                        <div className="flex items-center gap-3 bg-black/50 px-2 py-1 rounded-lg border border-white/10">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-gray-400 hover:text-white p-1 cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-mono font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-400 hover:text-white p-1 cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-[#050505]">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-400 text-sm">Total Belanja</span>
                  <span className="text-2xl font-black text-white">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full group relative flex items-center justify-center gap-2 py-4 bg-[#33A5D3] text-black hover:bg-[#33A5D3]/90 rounded-full font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300 overflow-hidden cursor-pointer shadow-[0_0_20px_rgba(51,165,211,0.2)]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <MessageCircle size={16} className="relative z-10" />
                  <span className="relative z-10">Checkout via WhatsApp</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
