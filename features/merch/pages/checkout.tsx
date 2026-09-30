"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/cart-context";
import { variantPrice } from "../utils";
import {
  Check,
  UploadCloud,
  Trash2,
  FileText,
  Wallet,
  ShoppingBag,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Store,
  User,
  MapPin,
  ClipboardCheck,
  Receipt,
  CircleCheckBig,
  Truck,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useTransition } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { uploadPublicImage } from "@/features/merch/actions/public-actions";
import { getCheckoutProfile } from "@/features/account/actions/profile";
import { getCheckoutPaymentOptions } from "@/features/payment-accounts/actions/payment-account-actions";
import type { PaymentOption } from "@/features/payment-accounts/types";
import { createOrder } from "../actions/checkout-actions";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "Data & Pembayaran" },
  { id: 2, label: "Konfirmasi" },
  { id: 3, label: "Selesai" },
];

export default function Checkout() {
  const { items, totalPrice, totalItems, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    address: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    whatsapp: "",
    address: "",
  });
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [orderCode, setOrderCode] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Isi otomatis dari profil user (nama, WhatsApp, alamat) — tetap bisa diedit.
  useEffect(() => {
    let cancelled = false;
    getCheckoutProfile()
      .then((profile) => {
        if (cancelled) return;
        setFormData((prev) => ({
          name: prev.name || profile.name,
          whatsapp: prev.whatsapp || profile.phone,
          address: prev.address || profile.address,
        }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Ambil rekening tujuan dari produk di keranjang (bank / e-wallet / QRIS).
  useEffect(() => {
    let cancelled = false;
    const productIds = Array.from(new Set(items.map((i) => i.product.id)));
    if (productIds.length === 0) {
      setPaymentOptions([]);
      return;
    }
    getCheckoutPaymentOptions(productIds)
      .then((options) => {
        if (cancelled) return;
        setPaymentOptions(options);
        setSelectedAccountId((prev) =>
          prev != null && options.some((o) => o.id === prev)
            ? prev
            : (options[0]?.id ?? null),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [items]);

  // Bersihkan object URL pratinjau bukti saat berubah / unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectedAccount = paymentOptions.find((o) => o.id === selectedAccountId) ?? null;
  const sellers = Array.from(new Set(paymentOptions.map((o) => o.sellerLabel)));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const goToConfirmation = () => {
    const newErrors = { name: "", whatsapp: "", address: "" };
    let hasError = false;

    if (!formData.name) {
      newErrors.name = "Data harus diisi";
      hasError = true;
    }
    if (!formData.whatsapp) {
      newErrors.whatsapp = "Data harus diisi";
      hasError = true;
    }
    if (!formData.address) {
      newErrors.address = "Data harus diisi";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) {
      toast.error("Lengkapi data pemesan terlebih dahulu.");
      return;
    }

    if (paymentOptions.length > 0 && selectedAccountId == null) {
      toast.error("Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    if (!selectedFile) {
      toast.error("Mohon upload bukti pembayaran terlebih dahulu.");
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmOrder = () => {
    if (items.length === 0 || !selectedFile) return;

    startTransition(async () => {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", selectedFile);

        const uploadResult = await uploadPublicImage(formDataUpload);

        const payload = {
          buyerName: formData.name,
          buyerContact: formData.whatsapp,
          buyerAddress: formData.address,
          paymentProofUrl: uploadResult.secure_url,
          items: items.map((item) => ({
            productId: item.product.id,
            sizeId: item.selectedSize?.id || null,
            variantId: item.selectedVariant?.id || null,
            quantity: item.quantity,
          })),
        };

        const res = await createOrder(payload);
        if (res.error) {
          toast.error("Checkout gagal", { description: res.error });
          return;
        }

        if (res.success && res.orderCode) {
          setOrderCode(res.orderCode);
          clearCart();
          setStep(3);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch {
        toast.error("Terjadi kesalahan yang tidak terduga.");
      }
    });
  };

  /* ----------------------------- STEP 3: Success ---------------------------- */
  if (step === 3) {
    const steps = [
      {
        icon: Clock,
        title: "Menunggu verifikasi",
        desc: "Admin memverifikasi bukti pembayaranmu, maksimal 12 jam.",
      },
      {
        icon: Truck,
        title: "Pesanan diproses",
        desc: "Setelah pembayaran valid, pesanan akan disiapkan/dikirim.",
      },
      {
        icon: CircleCheckBig,
        title: "Selesai",
        desc: "Pantau perubahan status kapan saja lewat menu Lacak Pesanan.",
      },
    ];

    return (
      <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#33A5D3]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-8">
            <Stepper current={3} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D0E11]">
            {/* Hero */}
            <div className="flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-[#33A5D3]/10 to-transparent px-6 py-10 text-center md:py-14">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <CircleCheckBig className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                Pesanan Berhasil Dibuat
              </h1>
              <p className="mt-2 max-w-lg text-sm text-gray-400">
                Terima kasih! Pesananmu sudah tercatat dan sedang menunggu
                verifikasi pembayaran. Kami akan memperbarui statusnya maksimal
                dalam 12 jam.
              </p>

              {/* Kode Pesanan + Copy */}
              <div className="mt-7 w-full max-w-md">
                <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-gray-500">
                  Kode Pesanan
                </p>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#33A5D3]/30 bg-[#33A5D3]/5 px-4 py-3">
                  <span className="truncate font-mono text-lg font-bold text-[#33A5D3]">
                    {orderCode}
                  </span>
                  <CopyButton value={orderCode} variant="text" label="Salin kode" />
                </div>
              </div>
            </div>

            {/* Langkah selanjutnya */}
            <div className="px-6 py-8 md:px-10">
              <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-400">
                Apa selanjutnya?
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-white/10 bg-[#111111] p-5"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#33A5D3]/10 text-[#33A5D3]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-bold text-white">{s.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-400">
                        {s.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() =>
                    router.push(`/account/track?code=${encodeURIComponent(orderCode)}`)
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#33A5D3] px-6 py-3.5 text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-[#33A5D3]/90"
                >
                  <Truck className="h-4 w-4" /> Lacak Pesanan
                </button>
                <button
                  onClick={() => router.push("/merch")}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Belanja Lagi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------- Empty cart -------------------------------- */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center pt-32 pb-20 px-6">
        <ShoppingBag size={64} className="text-gray-600 mb-6" />
        <h2 className="text-3xl font-black mb-4">Keranjang Kosong</h2>
        <p className="text-gray-400 mb-8">Belum ada produk untuk di-checkout.</p>
        <button
          onClick={() => router.push("/merch")}
          className="bg-[#33A5D3] text-black font-bold px-8 py-3 rounded-full hover:bg-[#33A5D3]/90 transition-colors"
        >
          Belanja Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#33A5D3]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Pembayaran</h1>
          <p className="text-gray-400 max-w-2xl text-sm leading-relaxed">
            {step === 1
              ? "Lengkapi detail pemesanan Anda dan pilih metode pembayaran untuk menyelesaikan transaksi Merch HMPSTI."
              : "Periksa kembali detail pesanan dan informasi toko sebelum mengirim pesanan."}
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-10">
          <Stepper current={step} />
        </div>

        {step === 1 ? (
          /* ============================ STEP 1 ============================ */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Form Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111111] border border-white/5 p-6 rounded-2xl"
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="text-[#33A5D3]" size={20} /> Informasi Orderan
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama Anda"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setErrors({ ...errors, name: "" });
                      }}
                      className={`w-full bg-[#1A1A1A] border-b px-4 py-3 text-white focus:outline-none transition-colors ${
                        errors.name
                          ? "border-red-500 focus:border-red-500"
                          : "border-white/10 focus:border-[#33A5D3]"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Nomor Whatsapp
                    </label>
                    <input
                      type="text"
                      placeholder="08xxxxxxxxxx"
                      value={formData.whatsapp}
                      onChange={(e) => {
                        setFormData({ ...formData, whatsapp: e.target.value });
                        setErrors({ ...errors, whatsapp: "" });
                      }}
                      className={`w-full bg-[#1A1A1A] border-b px-4 py-3 text-white focus:outline-none transition-colors ${
                        errors.whatsapp
                          ? "border-red-500 focus:border-red-500"
                          : "border-white/10 focus:border-[#33A5D3]"
                      }`}
                    />
                    {errors.whatsapp && (
                      <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Alamat Lengkap
                    </label>
                    <textarea
                      placeholder="Detail alamat pengiriman..."
                      rows={3}
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        setErrors({ ...errors, address: "" });
                      }}
                      className={`w-full bg-[#1A1A1A] border-b px-4 py-3 text-white focus:outline-none transition-colors resize-none ${
                        errors.address
                          ? "border-red-500 focus:border-red-500"
                          : "border-white/10 focus:border-[#33A5D3]"
                      }`}
                    ></textarea>
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Payment Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#111111] border border-white/5 p-6 rounded-2xl"
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Wallet className="text-[#33A5D3]" size={20} /> Pilihan Pembayaran
                </h3>
                {paymentOptions.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Belum ada rekening pembayaran yang aktif. Hubungi admin.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {paymentOptions.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => setSelectedAccountId(account.id)}
                        className={`p-4 rounded-xl border flex items-start gap-4 cursor-pointer transition-all ${
                          selectedAccountId === account.id
                            ? "border-[#33A5D3] bg-[#33A5D3]/5"
                            : "border-white/10 bg-[#1A1A1A] hover:border-white/20"
                        }`}
                      >
                        {account.type === "qris" && account.qrisImgUrl ? (
                          <img
                            src={account.qrisImgUrl}
                            alt={account.bankName}
                            className="w-14 h-14 rounded-lg bg-white object-contain shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-9 bg-white rounded flex items-center justify-center overflow-hidden shrink-0">
                            <span className="text-[10px] font-black uppercase text-black text-center px-1">
                              {account.bankName}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">
                            {account.bankName}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5 break-all">
                            {account.type === "qris"
                              ? "Scan QRIS"
                              : account.accountNumber}{" "}
                            <span className="font-sans text-[10px] ml-1 opacity-70">
                              a.n. {account.accountOwner}
                            </span>
                          </p>
                          <p className="text-[10px] text-gray-600 mt-0.5">
                            {account.sellerLabel}
                          </p>
                        </div>
                        {selectedAccountId === account.id && (
                          <Check className="text-[#33A5D3] shrink-0" size={18} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Summary */}
            <div className="space-y-6">
              {/* Cart Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#111111] border border-white/5 p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold flex items-center gap-2">
                    <ShoppingBag size={18} className="text-[#33A5D3]" /> Pembayaran
                    Produk
                  </h3>
                  <span className="bg-white/10 text-xs px-2 py-1 rounded-full font-bold">
                    {totalItems} items
                  </span>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-[#1A1A1A] p-3 rounded-lg border border-white/5"
                    >
                      <div className="w-12 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs truncate">
                          {item.product.name}
                        </h4>
                        {(item.selectedSize || item.selectedVariant) && (
                          <p className="text-[10px] text-gray-500 truncate">
                            {item.selectedSize
                              ? `Ukuran: ${item.selectedSize.sizeName}`
                              : ""}
                            {item.selectedSize && item.selectedVariant ? " · " : ""}
                            {item.selectedVariant
                              ? `Varian: ${item.selectedVariant.name}`
                              : ""}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.quantity} x{" "}
                          <span className="text-[#F56C6C]">
                            Rp{" "}
                            {variantPrice(
                              item.selectedVariant,
                              item.product.price,
                            ).toLocaleString("id-ID")}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-end justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-black text-[#33A5D3]">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </motion.div>

              {/* Upload Area & Submit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#111111] border border-white/5 p-6 rounded-2xl"
              >
                <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 mb-6 text-sm text-gray-400 space-y-2">
                  <p className="font-bold text-white mb-2 flex items-center gap-2">
                    <FileText size={16} /> Cara Pembayaran
                  </p>
                  <p>1. Transfer ke rekening pilihan Anda.</p>
                  <p>2. Simpan bukti transfer berupa screenshot/foto.</p>
                  <p>3. Upload bukti pembayaran pada area di bawah ini.</p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 bg-[#1A1A1A] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#33A5D3]/50 transition-colors mb-6 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg"
                  />
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Bukti pembayaran"
                      className="max-h-40 rounded-lg object-contain mb-3"
                    />
                  ) : (
                    <UploadCloud
                      size={32}
                      className="text-gray-500 group-hover:text-[#33A5D3] mb-3 transition-colors"
                    />
                  )}
                  <p className="font-bold text-sm">
                    {selectedFile ? selectedFile.name : "Upload Bukti"}
                  </p>
                  {!selectedFile && (
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  )}
                </div>

                <button
                  onClick={goToConfirmation}
                  className="w-full bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(51,165,211,0.2)] flex items-center justify-center gap-2"
                >
                  Lanjut ke Konfirmasi <ChevronRight size={18} />
                </button>
                <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest">
                  Tolong upload bukti pembayaran anda
                </p>
              </motion.div>
            </div>
          </div>
        ) : (
          /* ============================ STEP 2 ============================ */
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Detail Pesanan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111111] border border-white/5 p-6 rounded-2xl"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Receipt className="text-[#33A5D3]" size={20} /> Detail Pesanan
              </h3>
              <div className="space-y-4">
                {items.map((item) => {
                  const unit = variantPrice(item.selectedVariant, item.product.price);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="w-16 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">
                          {item.product.name}
                        </h4>
                        {(item.selectedSize || item.selectedVariant) && (
                          <p className="text-xs text-gray-500 truncate">
                            {item.selectedSize
                              ? `Ukuran: ${item.selectedSize.sizeName}`
                              : ""}
                            {item.selectedSize && item.selectedVariant ? " · " : ""}
                            {item.selectedVariant
                              ? `Varian: ${item.selectedVariant.name}`
                              : ""}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {item.quantity} x Rp {unit.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-sm text-white">
                        Rp {(unit * item.quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Total Item</span>
                  <span className="text-gray-200">{totalItems} pcs</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-bold text-lg">Total Pembayaran</span>
                  <span className="text-2xl font-black text-[#33A5D3]">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Informasi Toko */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-[#111111] border border-white/5 p-6 rounded-2xl"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Store className="text-[#33A5D3]" size={20} /> Informasi Toko
              </h3>
              {sellers.length > 0 ? (
                <div className="mb-5 flex flex-wrap gap-2">
                  {sellers.map((seller) => (
                    <span
                      key={seller}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#33A5D3]/30 bg-[#33A5D3]/10 px-3 py-1 text-xs font-semibold text-[#33A5D3]"
                    >
                      <Store size={12} /> {seller}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mb-5 text-sm text-gray-500 italic">
                  Informasi toko tidak tersedia.
                </p>
              )}

              {selectedAccount ? (
                <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#1A1A1A] p-4">
                  {selectedAccount.type === "qris" && selectedAccount.qrisImgUrl ? (
                    <img
                      src={selectedAccount.qrisImgUrl}
                      alt={selectedAccount.bankName}
                      className="h-20 w-20 rounded-lg bg-white object-contain shrink-0"
                    />
                  ) : (
                    <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white px-2">
                      <span className="text-[11px] font-black uppercase text-black text-center">
                        {selectedAccount.bankName}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-gray-500">
                      Tujuan Pembayaran
                    </p>
                    <p className="font-bold text-white">
                      {selectedAccount.bankName}
                    </p>
                    <p className="font-mono text-sm text-gray-300 break-all">
                      {selectedAccount.type === "qris"
                        ? "Scan QRIS"
                        : selectedAccount.accountNumber}
                    </p>
                    <p className="text-xs text-gray-400">
                      a.n. {selectedAccount.accountOwner} · {selectedAccount.sellerLabel}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Belum memilih metode pembayaran.
                </p>
              )}
            </motion.div>

            {/* Data Pemesan & Bukti */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <User className="text-[#33A5D3]" size={18} /> Data Pemesan
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500">
                      Nama
                    </p>
                    <p className="font-semibold text-white">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500">
                      WhatsApp
                    </p>
                    <p className="font-semibold text-white">{formData.whatsapp}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 flex items-center gap-1">
                      <MapPin size={11} /> Alamat
                    </p>
                    <p className="text-gray-300">{formData.address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <FileText className="text-[#33A5D3]" size={18} /> Bukti Pembayaran
                </h3>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Bukti pembayaran"
                    className="max-h-52 w-full rounded-lg border border-white/10 bg-black/40 object-contain"
                  />
                ) : (
                  <p className="text-sm text-gray-500 italic">Belum ada bukti.</p>
                )}
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold uppercase tracking-widest text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <ChevronLeft size={18} /> Kembali
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={isPending}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#33A5D3] px-8 py-4 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(51,165,211,0.2)] transition-all hover:bg-[#33A5D3]/90 disabled:opacity-50"
              >
                {isPending ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <ClipboardCheck size={18} />
                )}
                {isPending ? "Memproses..." : "Konfirmasi & Kirim Pesanan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Stepper -------------------------------- */
function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, idx) => {
        const isDone = current > s.id;
        const isActive = current === s.id;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors ${
                  isDone
                    ? "border-[#33A5D3] bg-[#33A5D3] text-black"
                    : isActive
                      ? "border-[#33A5D3] bg-[#33A5D3]/10 text-[#33A5D3]"
                      : "border-white/10 bg-white/5 text-gray-500"
                }`}
              >
                {isDone ? <Check size={16} /> : s.id}
              </div>
              <span
                className={`text-xs font-semibold sm:text-sm ${
                  isActive || isDone ? "text-white" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`mx-2 h-px flex-1 sm:mx-4 ${
                  current > s.id ? "bg-[#33A5D3]" : "bg-white/10"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
