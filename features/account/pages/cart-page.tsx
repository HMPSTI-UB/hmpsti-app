"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/features/merch/context/cart-context";
import { variantPrice } from "@/features/merch/utils";

export function AccountCartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } =
    useCart();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Keranjang</h1>
        <p className="mt-1 text-sm text-gray-400">
          {totalItems > 0
            ? `${totalItems} item siap di-checkout.`
            : "Belum ada produk di keranjang Anda."}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0D0E11] px-6 py-20 text-center">
          <ShoppingBag className="mb-4 h-12 w-12 text-gray-600" strokeWidth={1.5} />
          <p className="font-semibold text-gray-300">Keranjang Kosong</p>
          <p className="mt-1 text-sm text-gray-500">
            Yuk, tambah produk merch favoritmu!
          </p>
          <Link
            href="/merch"
            className="mt-6 rounded-full bg-[#33A5D3] px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#33A5D3]/90"
          >
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-white/10 bg-[#0D0E11] p-4"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black">
                  <img
                    src={item.product.images?.[0]}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-white">
                        {item.product.name}
                      </h3>
                      {(item.selectedSize || item.selectedVariant) && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {item.selectedSize
                            ? `Ukuran: ${item.selectedSize.sizeName}`
                            : ""}
                          {item.selectedSize && item.selectedVariant ? " · " : ""}
                          {item.selectedVariant
                            ? `Varian: ${item.selectedVariant.name}`
                            : ""}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-400/60 transition-colors hover:text-red-400"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-sm font-black text-[#33A5D3]">
                      Rp{" "}
                      {(
                        variantPrice(item.selectedVariant, item.product.price) *
                        item.quantity
                      ).toLocaleString("id-ID")}
                    </span>
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-2 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 text-gray-400 transition-colors hover:text-white"
                        aria-label="Kurangi"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center text-xs font-mono font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 text-gray-400 transition-colors hover:text-white"
                        aria-label="Tambah"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0D0E11] p-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Belanja</span>
              <span className="text-2xl font-black text-white">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="mt-6 w-full rounded-full bg-[#33A5D3] py-4 font-mono text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-[#33A5D3]/90"
            >
              Lanjut ke Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}