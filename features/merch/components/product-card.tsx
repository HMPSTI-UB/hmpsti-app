"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { PublicProduct } from "../types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/cart-context";
import { requireClientAuth } from "../utils/require-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const customEase: [number, number, number, number] = [0.32, 0.72, 0, 1];

const AVAILABILITY: Record<
  PublicProduct["availabilityType"],
  { label: string; className: string }
> = {
  ready: {
    label: "Ready",
    className: "text-[#33A5D3] border-[#33A5D3]/40 bg-[#33A5D3]/15",
  },
  preorder: {
    label: "Preorder",
    className: "text-amber-300 border-amber-300/40 bg-amber-400/15",
  },
  out_of_stock: {
    label: "Habis",
    className: "text-[#F56C6C] border-[#F56C6C]/40 bg-[#F56C6C]/15",
  },
};

function getStockHint(product: PublicProduct): string | null {
  if (product.availabilityType === "out_of_stock") return null;

  if (product.hasSizes && product.sizes.length > 0) {
    const names = product.sizes.slice(0, 4).map((s) => s.sizeName);
    return `Ukuran ${names.join(" · ")}`;
  }

  if (product.hasVariants && product.variants.length > 0) {
    return `${product.variants.length} varian`;
  }

  if (product.availabilityType === "preorder") return "Preorder tersedia";

  if (product.stock != null) {
    if (product.stock <= 5) return `Sisa ${product.stock}`;
    return "Stok tersedia";
  }

  return null;
}

export function ProductCard({
  product,
  index,
}: {
  product: PublicProduct;
  index: number;
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const gallery = (product.images ?? []).filter(Boolean);
  const primaryImage = gallery[0];
  const variantImage = product.variants?.find((v) => v.imageUrl)?.imageUrl;
  const hoverImage = gallery[1] ?? variantImage;

  const hasOptions = product.hasVariants || product.hasSizes;
  const isOutOfStock = product.availabilityType === "out_of_stock";
  const availability = AVAILABILITY[product.availabilityType];
  const stockHint = getStockHint(product);

  const showPriceRange =
    product.hasVariants &&
    product.priceFrom != null &&
    product.priceTo != null &&
    product.priceFrom !== product.priceTo;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    if (hasOptions) {
      router.push(`/merch/${product.id}`);
      return;
    }

    setIsAdding(true);
    try {
      const ok = await requireClientAuth(`/merch/${product.id}`);
      if (!ok) return;
      addToCart(product, 1);
      setAdded(true);
      toast.success(`${product.name} ditambahkan ke keranjang`);
      window.setTimeout(() => setAdded(false), 1500);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.5,
        delay: (index % 4) * 0.05,
        ease: customEase,
      }}
      className="group relative w-full h-full"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0F0F0F] transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_12px_40px_-18px_rgba(0,0,0,0.9)]">
        {/* IMAGE */}
        <Link
          href={`/merch/${product.id}`}
          className="relative block aspect-square w-full overflow-hidden bg-white/[0.03]"
        >
          {primaryImage && (
            <img
              src={primaryImage}
              alt={product.name}
              className={cn(
                "absolute inset-0 h-full w-full object-contain p-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105",
                hoverImage && "opacity-100 group-hover:opacity-0",
              )}
            />
          )}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${product.name} — tampilan lain`}
              className="absolute inset-0 h-full w-full object-contain p-4 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 group-hover:opacity-100"
            />
          )}

          {/* Badges */}
          <div className="absolute left-2.5 top-2.5 max-w-[65%] truncate rounded-md border border-white/10 bg-black/50 px-2 py-0.5 backdrop-blur-md">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-gray-300">
              {product.categoryName || "Uncategorized"}
            </span>
          </div>
          <div
            className={cn(
              "absolute right-2.5 top-2.5 rounded-md border px-2 py-0.5 backdrop-blur-md",
              availability.className,
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
              {availability.label}
            </span>
          </div>
        </Link>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col gap-1 p-3 md:p-4">
          <Link href={`/merch/${product.id}`} className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-gray-200 transition-colors group-hover:text-white">
              {product.name}
            </h3>
          </Link>

          <div className="mt-1 text-base font-bold tracking-tight text-white md:text-lg">
            {showPriceRange ? (
              <>
                Rp {product.priceFrom!.toLocaleString("id-ID")}
                <span className="text-gray-500"> – </span>
                Rp {product.priceTo!.toLocaleString("id-ID")}
              </>
            ) : (
              <>Rp {product.price.toLocaleString("id-ID")}</>
            )}
          </div>

          {stockHint && (
            <div className="text-[11px] text-gray-400">{stockHint}</div>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleQuickAdd}
            disabled={isOutOfStock || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="animate-spin" />
                <span>Proses...</span>
              </>
            ) : added ? (
              <>
                <Check />
                <span>Ditambahkan</span>
              </>
            ) : isOutOfStock ? (
              <span>Stok Habis</span>
            ) : (
              <>
                <ShoppingCart />
                <span>Tambah ke Keranjang</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
