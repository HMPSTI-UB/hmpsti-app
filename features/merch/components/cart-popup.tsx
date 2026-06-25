"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowRight, Plus, Minus } from "lucide-react";
import { useCart } from "../context/cart-context";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function CartPopup({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, removeFromCart, totalPrice, updateQuantity } = useCart();
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCheckout = () => {
    onClose();
    router.push("/checkout"); // Arahkan ke halaman baru
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popupRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 w-87 bg-[#1A1A1A] rounded-lg shadow-2xl border border-white/10 overflow-hidden z-50 text-white"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 text-center">
            <h3 className="font-bold text-lg">Keranjang Anda</h3>
          </div>

          {/* Cart Items */}
          <div className="max-h-[300px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Keranjang Kosong
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border-b border-white/5"
                >
                  <div className="w-16 h-16 bg-black rounded flex-shrink-0 overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm line-clamp-1">
                      {item.product.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded border border-white/10">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-mono font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#F56C6C]">
                        Rp. {(item.product.price * item.quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 bg-[#1A1A1A]">
              <div className="flex justify-between items-center mb-4 font-bold">
                <span>Total</span>
                <span className="text-[#F56C6C]">
                  Rp. {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-[#33A5D3] text-black py-3 px-4 rounded flex justify-center items-center gap-2 font-bold hover:bg-[#33A5D3]/90 transition-colors cursor-pointer"
              >
                Checkout
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
