"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type {
  PublicProduct,
  PublicProductSize,
  PublicProductVariant,
} from "../types";
import { useCart } from "../context/cart-context";
import { variantPrice } from "../utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Check,
  ShieldCheck,
  Info,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { requireClientAuth } from "../utils/require-auth";
import { Button } from "@/components/ui/button";

export default function ProductDetail({ product }: { product: PublicProduct }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [selectedSize, setSelectedSize] = useState<
    PublicProductSize | undefined
  >(product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
  const [selectedVariant, setSelectedVariant] = useState<
    PublicProductVariant | undefined
  >(
    product.hasVariants && product.variants.length > 0
      ? product.variants[0]
      : undefined,
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [buyerNote, setBuyerNote] = useState<string>("");
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"detail" | "specs" | "info">(
    "detail",
  );
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);

  const gallery = [
    ...product.images,
    ...(product.variants ?? [])
      .map((v) => v.imageUrl)
      .filter((u): u is string => !!u),
  ];
  const mainImage =
    gallery[activeImageIndex] || gallery[0] || "/placeholder.png";

  const currentStock = product.hasSizes
    ? selectedSize?.stock
    : product.hasVariants
      ? selectedVariant?.stock
      : product.stock;

  const isOutOfStock =
    product.availabilityType === "out_of_stock" ||
    (currentStock != null && currentStock <= 0);
  const isPreorder = product.availabilityType === "preorder";

  const availabilityBadge =
    product.availabilityType === "out_of_stock"
      ? {
          label: "Habis",
          className: "bg-red-500/10 text-red-400 border-red-500/30",
        }
      : product.availabilityType === "preorder"
        ? {
            label: "Pre-Order",
            className: "bg-amber-400/10 text-amber-300 border-amber-400/30",
          }
        : {
            label: "Ready Stock",
            className: "bg-[#33A5D3]/10 text-[#33A5D3] border-[#33A5D3]/30",
          };

  const unitPrice = product.hasVariants
    ? selectedVariant
      ? variantPrice(selectedVariant, product.price)
      : (product.priceFrom ?? product.price)
    : product.price;

  const showPriceRange =
    product.hasVariants &&
    !selectedVariant &&
    product.priceFrom != null &&
    product.priceTo != null &&
    product.priceFrom !== product.priceTo;

  const subtotal = unitPrice * quantity;

  const handleIncrement = () => {
    setQuantity((prev) => {
      if (!isPreorder && currentStock != null && prev >= currentStock) {
        toast.error("Kuantitas melebihi stok yang tersedia");
        return prev;
      }
      return prev + 1;
    });
  };

  const handleDecrement = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const ok = await requireClientAuth(`/merch/${product.id}`);
      if (!ok) return;
      addToCart(product, quantity, selectedSize, selectedVariant);
      setAdded(true);
      const parts = [
        `Kuantitas: ${quantity}`,
        selectedSize ? `Ukuran: ${selectedSize.sizeName}` : "",
        selectedVariant ? `Varian: ${selectedVariant.name}` : "",
      ].filter(Boolean);
      toast.success(`${product.name} ditambahkan ke keranjang`, {
        description: parts.join(" | "),
      });
      window.setTimeout(() => setAdded(false), 1500);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCheckout = async () => {
    const ok = await requireClientAuth("/checkout");
    if (!ok) return;
    addToCart(product, quantity, selectedSize, selectedVariant);
    router.push("/checkout");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Cek merchandise resmi HMPSTI: ${product.name}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link produk tersalin ke clipboard!");
    }
  };

  const displayStock = isPreorder
    ? "Preorder"
    : isOutOfStock
      ? "Habis"
      : currentStock != null
        ? `${currentStock}`
        : "Tersedia";

  // Selected variant/size summary text for purchase card
  const selectedSummary =
    [
      selectedVariant ? selectedVariant.name : null,
      selectedSize ? `Ukuran ${selectedSize.sizeName}` : null,
    ]
      .filter(Boolean)
      .join(", ") || "Standard";

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Original Cyan Glow Effects */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#33A5D3]/10 blur-[160px] rounded-full pointer-events-none mix-blend-screen opacity-60" />
      <div className="fixed top-1/3 right-10 w-[400px] h-[400px] bg-[#33A5D3]/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Tokopedia-Style Breadcrumb with Original Theme Colors */}
        <nav className="mb-6 flex items-center flex-wrap gap-1.5 text-xs text-gray-400">
          <Link
            href="/merch"
            className="hover:text-[#33A5D3] transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            Home
          </Link>
          <ChevronRight size={12} className="text-gray-600" />
          <Link
            href="/merch"
            className="hover:text-[#33A5D3] transition-colors"
          >
            Merch
          </Link>
          <ChevronRight size={12} className="text-gray-600" />
          <span className="text-gray-300 font-medium">
            {product.categoryName || "Official Merch"}
          </span>
          <ChevronRight size={12} className="text-gray-600" />
          <span className="truncate max-w-[220px] text-gray-500">
            {product.name}
          </span>
        </nav>

        {/* 3-Column Tokopedia Layout: Gallery (4) | Details (5) | Buy Box (3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Image Gallery & Thumbnails (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-28">
            {/* Main Display Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full aspect-square bg-[#0e131f]/60 rounded-2xl border border-white/10 overflow-hidden relative group flex items-center justify-center p-4 shadow-xl backdrop-blur-sm"
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className={`absolute top-3 left-3 px-3 py-1 rounded-full border text-[11px] uppercase tracking-wider font-semibold backdrop-blur-md ${availabilityBadge.className}`}
              >
                {availabilityBadge.label}
              </span>
            </motion.div>

            {/* Thumbnail Carousel */}
            {gallery.length > 1 && (
              <div className="relative flex items-center gap-2">
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 px-0.5 w-full scrollbar-none scroll-smooth">
                  {gallery.map((imgUrl, idx) => {
                    const isActive = activeImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-16 shrink-0 rounded-xl border-2 overflow-hidden bg-[#0e131f]/60 transition-all duration-200 ${
                          isActive
                            ? "border-[#33A5D3] ring-2 ring-[#33A5D3]/30 scale-95"
                            : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${product.name} thumb ${idx + 1}`}
                          className="w-full h-full object-contain p-1"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE COLUMN: Product Info & Variants (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2 uppercase">
              {product.name}
            </h1>

            {/* Sub-header / Ratings & Stats */}
            <div className="flex items-center flex-wrap gap-3 text-xs text-gray-400 mb-4 pb-4 border-b border-white/10">
              {/* <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                <Star size={12} className="fill-amber-400" />
                4.9
              </span> */}
              {/* <span>•</span>
              <span className="text-gray-300">
                Terjual <strong className="text-white">50+</strong>
              </span>
              <span>•</span> */}
              <span className="text-[#33A5D3] font-medium">
                {product.categoryName || "Official Apparel"}
              </span>
            </div>

            {/* Price Box */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {showPriceRange ? (
                    <>
                      Rp {product.priceFrom!.toLocaleString("id-ID")} – Rp{" "}
                      {product.priceTo!.toLocaleString("id-ID")}
                    </>
                  ) : (
                    <>Rp {unitPrice.toLocaleString("id-ID")}</>
                  )}
                </span>
              </div>
              {isPreorder && (
                <p className="text-xs text-amber-400 mt-1 flex items-center gap-1 font-medium">
                  <Info size={13} /> Produk ini sistem Pre-Order (dikirim
                  setelah sesi batch selesai)
                </p>
              )}
            </div>

            {/* VARIANT SELECTOR SECTION */}
            {product.hasVariants && product.variants.length > 0 && (
              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-300">
                    Pilih varian:{" "}
                    <span className="text-[#33A5D3] font-bold">
                      {selectedVariant?.name || "Pilih"}
                    </span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((variant) => {
                    const isSoldOut = variant.stock <= 0;
                    const isSelected = selectedVariant?.id === variant.id;

                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariant(variant);
                          if (variant.imageUrl) {
                            const gi = gallery.indexOf(variant.imageUrl);
                            if (gi >= 0) setActiveImageIndex(gi);
                          }
                        }}
                        disabled={isSoldOut}
                        className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                          isSelected
                            ? "bg-[#33A5D3]/15 text-white border-[#33A5D3] ring-1 ring-[#33A5D3]"
                            : "bg-[#141414] text-gray-300 border-white/10 hover:border-white/30"
                        } ${isSoldOut ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {/* Tiny Thumbnail if available */}
                        {variant.imageUrl && (
                          <img
                            src={variant.imageUrl}
                            alt={variant.name}
                            className="w-6 h-6 object-contain rounded bg-black/40 p-0.5"
                          />
                        )}
                        <span>{variant.name}</span>

                        {/* Corner Checkmark Badge */}
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 bg-[#33A5D3] text-black rounded-full p-0.5">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR SECTION */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-300">
                    Pilih ukuran:{" "}
                    <span className="text-[#33A5D3] font-bold">
                      {selectedSize?.sizeName || "Pilih"}
                    </span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize?.id === size.id;
                    const isSizeOutOfStock =
                      size.stock != null && size.stock <= 0;

                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        disabled={isSizeOutOfStock}
                        className={`relative min-w-[50px] h-10 px-3 flex items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-[#33A5D3]/15 text-white border-[#33A5D3] ring-1 ring-[#33A5D3]"
                            : "bg-[#141414] text-gray-300 border-white/10 hover:border-white/30"
                        } ${isSizeOutOfStock ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {size.sizeName}
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 bg-[#33A5D3] text-black rounded-full p-0.5">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DETAIL PRODUK TABS & DESCRIPTION */}
            <div className="mt-2">
              <div className="flex border-b border-white/10 mb-4 gap-6">
                <button
                  onClick={() => setActiveTab("detail")}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === "detail"
                      ? "border-[#33A5D3] text-[#33A5D3]"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  Detail Produk
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === "specs"
                      ? "border-[#33A5D3] text-[#33A5D3]"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  Informasi Toko
                </button>
              </div>

              {activeTab === "detail" && (
                <div className="text-sm text-gray-300 leading-relaxed space-y-3 prose prose-invert max-w-none">
                  {product.description ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">
                      Tidak ada deskripsi tambahan untuk produk ini.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "specs" && (
                <div className="bg-[#141414] p-4 rounded-xl border border-white/10 text-xs text-gray-300 space-y-2">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Kategori</span>
                    <span className="font-semibold text-white">
                      {product.categoryName || "Merchandise"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Kondisi</span>
                    <span className="font-semibold text-white">Baru</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Status Produk</span>
                    <span className="font-semibold text-[#33A5D3]">
                      {availabilityBadge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-gray-400">
                    <ShieldCheck size={16} className="text-[#33A5D3]" />
                    <span>Dioperasikan Resmi oleh HMPSTI Store</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Tokopedia Sticky Buy Card ("Atur jumlah dan catatan") (col-span-3) */}
          <div className="lg:col-span-3 lg:sticky lg:top-28">
            {/* Purchase Card Container */}
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-5">
              {/* Card Header Title */}
              <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">
                Atur jumlah dan catatan
              </h3>

              {/* Selected Variant Thumbnail & Info Preview */}
              <div className="flex items-center gap-3 bg-[#0A0A0A] p-2.5 rounded-xl border border-white/5">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-12 h-12 object-contain rounded-lg bg-black/40 p-1 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {selectedSummary}
                  </p>
                </div>
              </div>

              {/* Quantity Stepper & Stock */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center bg-[#0A0A0A] border border-white/15 rounded-xl h-9 overflow-hidden">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="w-9 h-full flex items-center justify-center hover:bg-white/10 transition-colors text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-xs text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={isOutOfStock}
                    className="w-9 h-full flex items-center justify-center hover:bg-white/10 transition-colors text-gray-300 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-gray-400 block">
                    Stok total
                  </span>
                  <span className="text-xs font-bold text-gray-200">
                    {displayStock}
                  </span>
                </div>
              </div>

              {/* Add Note Input Toggle */}
              <div>
                {!showNoteInput ? (
                  <button
                    onClick={() => setShowNoteInput(true)}
                    className="text-xs text-[#33A5D3] hover:underline font-semibold flex items-center gap-1"
                  >
                    + Tambah Catatan
                  </button>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Contoh: Titip di sekretariat"
                      value={buyerNote}
                      onChange={(e) => setBuyerNote(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#33A5D3]"
                    />
                  </div>
                )}
              </div>

              {/* Subtotal Calculation */}
              <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
                <span className="text-xs text-gray-400 font-medium">
                  Subtotal
                </span>
                <span className="text-xl font-black text-[#33A5D3]">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Action CTA Buttons */}
              <div className="flex flex-col gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className="w-full rounded-xl font-bold text-xs uppercase tracking-wider"
                >
                  {isAdding ? "Proses..." : added ? "Ditambahkan" : "+ Keranjang"}
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isOutOfStock}
                  className="w-full rounded-xl font-bold text-xs uppercase tracking-wider"
                >
                  {isPreorder ? "Pre-Order Sekarang" : "Beli Langsung"}
                </Button>
              </div>

              {/* Quick Action Buttons Row (Chat, Wishlist, Share) - Text only */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Chat
                </a>

                <button
                  onClick={() => {
                    setIsWishlisted(!isWishlisted);
                    toast.success(
                      isWishlisted
                        ? "Dihapus dari wishlist"
                        : "Ditambahkan ke wishlist",
                    );
                  }}
                  className={`flex items-center justify-center py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isWishlisted
                      ? "text-red-400 bg-red-400/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Wishlist
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
