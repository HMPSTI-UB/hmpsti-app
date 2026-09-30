"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Package,
  FolderTree,
  ImageIcon,
  Plus,
  Edit,
  Trash2,
  Layers,
  Sparkles,
  X,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RichTextEditor } from "./rich-text-editor";
import { RupiahInput } from "./rupiah-input";
import { createProduct, updateProduct } from "../actions/product-actions";
import { createMyProduct, updateMyProduct } from "@/features/merchant/actions/my-product-actions";
import { uploadImageToCloudinary } from "../actions/upload-actions";
import type { AdminProduct, CategoryOption, SizeFormData, VariantFormData } from "../types";

const SIZE_PRESETS = ["S", "M", "L", "XL", "XXL", "3XL"];

interface ProductFormPageProps {
  mode: "create" | "edit";
  initialProduct?: AdminProduct & {
    sizes?: { id: number; sizeName: string; stock: number | null }[];
    variants?: { id: number; name: string; price: number | null; stock: number; imageUrl: string | null }[];
  };
  categories: CategoryOption[];
  scope?: "admin" | "merchant";
}

export function ProductFormPage({
  mode,
  initialProduct,
  categories,
  scope = "admin",
}: ProductFormPageProps) {
  const router = useRouter();
  const backHref = scope === "merchant" ? "/account/my/products" : "/dashboard/merch/products";
  const [isPending, startTransition] = useTransition();

  // Upload loading states
  const [isUploadingMain, setIsUploadingMain] = useState<boolean>(false);
  const [isUploadingVariant, setIsUploadingVariant] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>(initialProduct?.name || "");
  const [categoryId, setCategoryId] = useState<number | null>(initialProduct?.categoryId ?? null);
  const [description, setDescription] = useState<string>(initialProduct?.description || "");
  const [price, setPrice] = useState<number | "">(initialProduct?.price ?? "");
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [forcePreorder, setForcePreorder] = useState<boolean>(
    initialProduct?.availabilityType === "preorder"
  );

  // Multi-size states
  const [hasSizes, setHasSizes] = useState<boolean>(initialProduct?.hasSizes ?? false);
  const [sizes, setSizes] = useState<SizeFormData[]>(
    initialProduct?.sizes
      ? initialProduct.sizes.map((s) => ({
          sizeName: s.sizeName,
          stock: s.stock ?? 0,
          _id: String(s.id),
        }))
      : []
  );
  const [customSizeInput, setCustomSizeInput] = useState<string>("");

  // Multi-variant states
  const [hasVariants, setHasVariants] = useState<boolean>(initialProduct?.hasVariants ?? false);
  const [variants, setVariants] = useState<VariantFormData[]>(
    initialProduct?.variants
      ? initialProduct.variants.map((v) => ({
          name: v.name,
          price: v.price ?? "",
          stock: v.stock,
          imageUrl: v.imageUrl || "",
          _id: String(v.id),
        }))
      : []
  );

  // Variant Dialog modal states
  const [isVariantModalOpen, setIsVariantModalOpen] = useState<boolean>(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [modalVariantName, setModalVariantName] = useState<string>("");
  const [modalVariantStock, setModalVariantStock] = useState<number | "">(10);
  const [modalVariantPrice, setModalVariantPrice] = useState<number | "">("");
  const [modalVariantImageUrl, setModalVariantImageUrl] = useState<string>("");

  // Single stock state (used when no variants and no sizes)
  const [stock, setStock] = useState<number | "">(initialProduct?.stock ?? 0);

  // Image Upload via Server Action (bypasses Cloudinary upload preset!)
  const handleMainFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMain(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await uploadImageToCloudinary(data);
      setImages((prev) => [...prev, res.secure_url]);
      toast.success("Gambar produk berhasil diunggah!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah gambar ke Cloudinary.");
    } finally {
      setIsUploadingMain(false);
      e.target.value = "";
    }
  };

  const handleVariantFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVariant(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await uploadImageToCloudinary(data);
      setModalVariantImageUrl(res.secure_url);
      toast.success("Foto varian berhasil diunggah!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah foto varian.");
    } finally {
      setIsUploadingVariant(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Size helper methods
  const togglePresetSize = (preset: string) => {
    if (sizes.some((s) => s.sizeName.toUpperCase() === preset)) {
      setSizes((prev) => prev.filter((s) => s.sizeName.toUpperCase() !== preset));
    } else {
      setSizes((prev) => [...prev, { sizeName: preset, stock: 10, _id: crypto.randomUUID() }]);
    }
  };

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    if (sizes.some((s) => s.sizeName.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Ukuran ini sudah ada dalam daftar");
      return;
    }
    setSizes((prev) => [...prev, { sizeName: trimmed, stock: 10, _id: crypto.randomUUID() }]);
    setCustomSizeInput("");
  };

  const removeSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSizeStock = (index: number, val: number | "") => {
    setSizes((prev) => {
      const copy = [...prev];
      copy[index].stock = val;
      return copy;
    });
  };

  // Variant Modal helper methods
  const openAddVariantModal = () => {
    setEditingVariantIndex(null);
    setModalVariantName(`Varian ${variants.length + 1}`);
    setModalVariantStock(10);
    setModalVariantPrice("");
    setModalVariantImageUrl("");
    setIsVariantModalOpen(true);
  };

  const openEditVariantModal = (index: number) => {
    const target = variants[index];
    setEditingVariantIndex(index);
    setModalVariantName(target.name);
    setModalVariantStock(target.stock);
    setModalVariantPrice(target.price);
    setModalVariantImageUrl(target.imageUrl || "");
    setIsVariantModalOpen(true);
  };

  const handleSaveVariantModal = () => {
    if (!modalVariantName.trim()) {
      toast.error("Nama varian wajib diisi");
      return;
    }

    const newVariant: VariantFormData = {
      name: modalVariantName.trim(),
      stock: modalVariantStock === "" ? 0 : Number(modalVariantStock),
      price: modalVariantPrice === "" ? "" : Number(modalVariantPrice),
      imageUrl: modalVariantImageUrl.trim(),
      _id: editingVariantIndex !== null ? variants[editingVariantIndex]._id : crypto.randomUUID(),
    };

    if (editingVariantIndex !== null) {
      setVariants((prev) => {
        const copy = [...prev];
        copy[editingVariantIndex] = newVariant;
        return copy;
      });
      toast.success("Varian berhasil diperbarui");
    } else {
      setVariants((prev) => [...prev, newVariant]);
      toast.success("Varian berhasil ditambahkan");
    }

    setIsVariantModalOpen(false);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama produk wajib diisi");
      return;
    }
    if (price === "" || price <= 0) {
      toast.error("Harga dasar produk harus lebih besar dari 0");
      return;
    }
    if (images.length === 0) {
      toast.error("Minimal upload 1 foto produk");
      return;
    }

    if (hasSizes && sizes.length === 0) {
      toast.error("Produk opsi ukuran harus memiliki minimal 1 ukuran");
      return;
    }

    if (hasVariants && variants.length === 0) {
      toast.error("Produk opsi varian harus memiliki minimal 1 varian");
      return;
    }

    startTransition(async () => {
      const payload = {
        categoryId,
        name: name.trim(),
        description: description.trim() || null,
        price: Number(price),
        images,
        hasSizes,
        hasVariants,
        stock: hasSizes || hasVariants ? null : Number(stock),
        forcePreorder,
        sizes: hasSizes ? sizes : [],
        variants: hasVariants ? variants : [],
      };

      let result;
      if (mode === "create") {
        result = scope === "merchant" ? await createMyProduct(payload) : await createProduct(payload);
      } else if (mode === "edit" && initialProduct) {
        result =
          scope === "merchant"
            ? await updateMyProduct(initialProduct.id, payload)
            : await updateProduct(initialProduct.id, payload);
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        mode === "create" ? "Produk berhasil ditambahkan!" : "Produk berhasil diperbarui!"
      );
      router.push(backHref);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto py-6 px-4 md:px-8 space-y-8 pb-20">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => router.push(backHref)}
            className="bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {mode === "create" ? "Tambah Produk Baru" : `Edit Produk: ${name || "..."}`}
              </h1>
              <Badge className="bg-[#33A5D3]/10 text-[#33A5D3] border-[#33A5D3]/30">
                {mode === "create" ? "Draft Baru" : `ID #${initialProduct?.id}`}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Lengkapi informasi produk, harga, varian, dan deskripsi detail untuk toko merchandise.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(backHref)}
            className="text-gray-400 hover:text-white"
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isPending || isUploadingMain || isUploadingVariant}
            className="bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-extrabold gap-2 min-w-[140px]"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} />
                {mode === "create" ? "Simpan Produk" : "Update Produk"}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Core Details & Description (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Section 1: Informasi Utama */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Package size={18} className="text-[#33A5D3]" />
              Informasi Utama Produk
            </h3>

            {/* Nama Produk */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-300">
                Nama Produk <span className="text-red-400">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Jaket Himpunan 2026, Keychain Innovara"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#33A5D3]"
              />
            </div>

            {/* Category & Pricing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kategori */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Kategori</Label>
                <Select
                  value={categoryId ? String(categoryId) : "none"}
                  onValueChange={(val) => setCategoryId(val === "none" ? null : Number(val))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#33A5D3]">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-white/10 text-white">
                    <SelectItem value="none">Tanpa Kategori</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Harga Dasar */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">
                  Harga Dasar (IDR) <span className="text-red-400">*</span>
                </Label>
                <RupiahInput
                  value={price}
                  onChange={setPrice}
                  placeholder="0"
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]"
                />
              </div>
            </div>

            {/* Single Stock (if no sizes and no variants) */}
            {!hasSizes && !hasVariants && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold text-gray-300">Stok Produk</Label>
                <Input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Jumlah stok unit tersedia"
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]"
                />
              </div>
            )}

            {/* Pre-Order Toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-white flex items-center gap-1.5">
                  Set Sebagai Pre-Order (PO)
                </Label>
                <p className="text-[11px] text-gray-400">
                  Aktifkan jika produk perlu waktu pembuatan (Pre-order batch)
                </p>
              </div>
              <Switch
                checked={forcePreorder}
                onCheckedChange={setForcePreorder}
              />
            </div>

          </div>

          {/* Section 2: Rich Text Editor Deskripsi */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-[#33A5D3]" />
                Deskripsi Lengkap Produk (Rich Text)
              </h3>
              <span className="text-[11px] text-gray-400">WYSIWYG Formatter</span>
            </div>

            <p className="text-xs text-gray-400">
              Gunakan toolbar di bawah untuk memberikan format teks tebal, poin-poin spesifikasi, daftar ukuran, maupun garis bawah.
            </p>

            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Tuliskan detail bahan (Cotton Combed 30s, Sablon DTF), tabel ukuran (Size Chart), maupun garansi..."
            />
          </div>

        </div>

        {/* RIGHT COLUMN: Gallery & Dynamic Variants (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Section 3: Galeri Foto */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <ImageIcon size={18} className="text-[#33A5D3]" />
              Foto Produk ({images.length})
            </h3>

            {/* Images Grid */}
            <div className="grid grid-cols-3 gap-3">
              {images.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl bg-black/40 border border-white/10 overflow-hidden group"
                >
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-[#33A5D3] text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                      UTAMA
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus Foto"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Upload Button using Server Action */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-[#33A5D3] bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-white transition-all cursor-pointer">
                {isUploadingMain ? (
                  <Loader2 size={20} className="animate-spin text-[#33A5D3]" />
                ) : (
                  <Upload size={20} className="text-[#33A5D3]" />
                )}
                <span className="text-[11px] font-semibold">
                  {isUploadingMain ? "Uploading..." : "Upload"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainFileUpload}
                  disabled={isUploadingMain}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-gray-500 italic">
              *Foto pertama akan otomatis menjadi gambar sampul utama.
            </p>
          </div>

          {/* Section 4: Multi-Size Management */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-[#33A5D3]" />
                Opsi Ukuran Pakaian
              </h3>
              <Switch checked={hasSizes} onCheckedChange={setHasSizes} />
            </div>

            {hasSizes && (
              <div className="space-y-4 pt-1">
                {/* Presets */}
                <div>
                  <span className="text-xs text-gray-400 font-semibold block mb-2">Preset Ukuran:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZE_PRESETS.map((preset) => {
                      const active = sizes.some((s) => s.sizeName.toUpperCase() === preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => togglePresetSize(preset)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                            active
                              ? "bg-[#33A5D3] text-black border-[#33A5D3]"
                              : "bg-white/5 text-gray-300 border-white/10 hover:border-white/30"
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Size Input */}
                <div className="flex gap-2">
                  <Input
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    placeholder="Tambah ukuran custom (misal: All Size)"
                    className="bg-white/5 border-white/10 text-white text-xs"
                  />
                  <Button
                    type="button"
                    onClick={addCustomSize}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs px-3"
                  >
                    + Tambah
                  </Button>
                </div>

                {/* Size List Table */}
                {sizes.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs text-gray-400 font-semibold block">Daftar Stok Ukuran:</span>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {sizes.map((s, idx) => (
                        <div
                          key={s._id || idx}
                          className="flex items-center justify-between gap-3 bg-[#0A0A0A] p-2.5 rounded-xl border border-white/5"
                        >
                          <span className="text-xs font-bold text-white w-16">{s.sizeName}</span>
                          <div className="flex items-center gap-2 flex-1 max-w-[140px]">
                            <span className="text-[11px] text-gray-400">Stok:</span>
                            <Input
                              type="number"
                              min={0}
                              value={s.stock}
                              onChange={(e) =>
                                updateSizeStock(
                                  idx,
                                  e.target.value === "" ? "" : Number(e.target.value)
                                )
                              }
                              className="h-8 bg-white/5 border-white/10 text-white text-xs font-mono"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSize(idx)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Multi-Variant Management (Dialog Modal Trigger) */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderTree size={18} className="text-[#33A5D3]" />
                Opsi Varian Warna / Tipe
              </h3>
              <Switch checked={hasVariants} onCheckedChange={setHasVariants} />
            </div>

            {hasVariants && (
              <div className="space-y-4 pt-1">
                <Button
                  type="button"
                  onClick={openAddVariantModal}
                  className="w-full bg-[#33A5D3]/15 text-[#33A5D3] border border-[#33A5D3]/30 hover:bg-[#33A5D3]/25 text-xs font-bold gap-1.5 h-10 rounded-xl"
                >
                  <Plus size={15} /> + Tambah Varian Baru
                </Button>

                {/* Variant Items List */}
                {variants.length > 0 ? (
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {variants.map((v, idx) => (
                      <div
                        key={v._id || idx}
                        className="flex items-center justify-between gap-3 bg-[#0A0A0A] p-3 rounded-xl border border-white/5 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {v.imageUrl ? (
                            <img
                              src={v.imageUrl}
                              alt={v.name}
                              className="w-9 h-9 object-contain rounded-lg bg-black/40 border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-500">
                              <ImageIcon size={16} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{v.name}</p>
                            <p className="text-[11px] text-gray-400">
                              Stok: <span className="text-white font-mono">{v.stock}</span>
                              {v.price !== "" && v.price != null && (
                                <span className="ml-2 text-[#33A5D3]">
                                  • Rp {Number(v.price).toLocaleString("id-ID")}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditVariantModal(idx)}
                            className="h-8 w-8 text-[#33A5D3] hover:bg-[#33A5D3]/10"
                            title="Edit Varian"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(idx)}
                            className="h-8 w-8 text-red-400 hover:bg-red-400/10"
                            title="Hapus Varian"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic text-center py-4 border border-dashed border-white/10 rounded-xl">
                    Belum ada varian ditambahkan. Klik "+ Tambah Varian Baru".
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* DIALOG MODAL: TAMBAH / EDIT VARIAN */}
      <Dialog open={isVariantModalOpen} onOpenChange={setIsVariantModalOpen}>
        <DialogContent className="bg-[#111111] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <FolderTree size={18} className="text-[#33A5D3]" />
              {editingVariantIndex !== null ? "Edit Varian Produk" : "Tambah Varian Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Nama Varian */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-300">
                Nama Varian <span className="text-red-400">*</span>
              </Label>
              <Input
                value={modalVariantName}
                onChange={(e) => setModalVariantName(e.target.value)}
                placeholder="Contoh: Hitam Glossy, Model A, Kemasan Spesial"
                className="bg-white/5 border-white/10 text-white text-xs focus-visible:ring-[#33A5D3]"
              />
            </div>

            {/* Stok Varian & Harga Khusus */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-300">Stok Varian</Label>
                <Input
                  type="number"
                  min={0}
                  value={modalVariantStock}
                  onChange={(e) =>
                    setModalVariantStock(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="10"
                  className="bg-white/5 border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-300">
                  Harga Khusus (Opsional)
                </Label>
                <RupiahInput
                  value={modalVariantPrice}
                  onChange={setModalVariantPrice}
                  placeholder="Sama dengan dasar"
                  className="bg-white/5 border-white/10 text-white text-xs"
                />
              </div>
            </div>

            {/* Upload Foto Varian */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-gray-300">Foto Varian (Opsional)</Label>
              {modalVariantImageUrl ? (
                <div className="flex items-center gap-3 bg-[#0A0A0A] p-2 rounded-xl border border-white/10">
                  <img
                    src={modalVariantImageUrl}
                    alt="Preview Varian"
                    className="w-10 h-10 object-contain rounded bg-black/40 border border-white/10"
                  />
                  <span className="text-xs text-gray-400 truncate flex-1">{modalVariantImageUrl}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setModalVariantImageUrl("")}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs h-7"
                  >
                    Hapus
                  </Button>
                </div>
              ) : (
                <label className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-[#33A5D3] bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 text-xs text-gray-300 hover:text-white transition-all cursor-pointer">
                  {isUploadingVariant ? (
                    <Loader2 size={14} className="animate-spin text-[#33A5D3]" />
                  ) : (
                    <Upload size={14} className="text-[#33A5D3]" />
                  )}
                  <span>{isUploadingVariant ? "Mengunggah foto..." : "Upload Foto Varian"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleVariantFileUpload}
                    disabled={isUploadingVariant}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsVariantModalOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveVariantModal}
              disabled={isUploadingVariant}
              className="bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-extrabold"
            >
              {editingVariantIndex !== null ? "Simpan Perubahan" : "Tambah Varian"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </form>
  );
}
