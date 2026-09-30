"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Upload, ImageIcon, Layers, Palette } from "lucide-react";
import { createProduct, updateProduct, getProductSizes } from "../actions/product-actions";
import { getProductVariants } from "../actions/variant-actions";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/handle-action";
import { uploadImage } from "@/features/pameran/actions/upload-action";
import { RupiahInput } from "./rupiah-input";
import type { AdminProduct, CategoryOption, ProductFormData, SizeFormData, VariantFormData } from "../types";

const PRESET_SIZES = ["S", "M", "L", "XL", "XXL"];

const emptyForm = (): ProductFormData => ({
  categoryId: null,
  name: "",
  description: "",
  price: 0,
  images: [],
  hasSizes: false,
  hasVariants: false,
  stock: 0,
  forcePreorder: false,
  sizes: [],
  variants: [],
});

const randomId = () => Math.random().toString(36).substring(2, 9);

const sortSizes = (sizes: SizeFormData[]) =>
  [...sizes].sort((a, b) => {
    if (!a.sizeName && b.sizeName) return 1;
    if (a.sizeName && !b.sizeName) return -1;
    return 0;
  });

export function ProductFormModal({
  open,
  editingProduct,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  editingProduct: AdminProduct | null;
  categories: CategoryOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState<ProductFormData>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);
  const [isFetchingSizes, setIsFetchingSizes] = useState(false);
  const [isFetchingVariants, setIsFetchingVariants] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (editingProduct) {
      setFormData({
        categoryId: editingProduct.categoryId,
        name: editingProduct.name,
        description: editingProduct.description ?? "",
        price: editingProduct.price,
        images: editingProduct.images,
        hasSizes: editingProduct.hasSizes,
        hasVariants: editingProduct.hasVariants,
        stock: editingProduct.stock,
        forcePreorder: editingProduct.availabilityType === "preorder" && !editingProduct.hasSizes,
        sizes: [],
        variants: [],
      });

      if (editingProduct.hasSizes) {
        setIsFetchingSizes(true);
        getProductSizes(editingProduct.id)
          .then((fetchedSizes) => {
            const mappedSizes = fetchedSizes.map((s) => ({
              ...s,
              _id: randomId(),
              _isCustom: !PRESET_SIZES.includes(s.sizeName),
            }));
            setFormData((prev) => ({ ...prev, sizes: sortSizes(mappedSizes) }));
          })
          .catch(() => setError("Gagal mengambil ukuran produk."))
          .finally(() => setIsFetchingSizes(false));
      }

      if (editingProduct.hasVariants) {
        setIsFetchingVariants(true);
        getProductVariants(editingProduct.id)
          .then((fetchedVariants) => {
            const mappedVariants: VariantFormData[] = fetchedVariants.map((v) => ({
              name: v.name,
              price: v.price ?? "",
              stock: v.stock,
              imageUrl: v.imageUrl ?? undefined,
              _id: randomId(),
            }));
            setFormData((prev) => ({ ...prev, variants: mappedVariants }));
          })
          .catch(() => setError("Gagal mengambil varian produk."))
          .finally(() => setIsFetchingVariants(false));
      }
    } else {
      setFormData(emptyForm());
    }
  }, [open, editingProduct]);

  const handleUpload = async (file: File) => {
    setUploadingImage(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("file", file);
      const result = await uploadImage(data);
      setFormData((prev) => ({ ...prev, images: [...prev.images, result.secure_url] }));
    } catch (err: unknown) {
      setError(`Gagal mengunggah gambar: ${getErrorMessage(err)}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVariantImageUpload = async (index: number, file: File) => {
    setUploadingVariantIndex(index);
    setError(null);
    try {
      const data = new FormData();
      data.append("file", file);
      const result = await uploadImage(data);
      setFormData((prev) => {
        const variants = [...(prev.variants || [])];
        variants[index] = { ...variants[index], imageUrl: result.secure_url };
        return { ...prev, variants };
      });
    } catch (err: unknown) {
      setError(`Gagal mengunggah foto varian: ${getErrorMessage(err)}`);
    } finally {
      setUploadingVariantIndex(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, patch: Partial<VariantFormData>) => {
    setFormData((prev) => {
      const variants = [...(prev.variants || [])];
      variants[index] = { ...variants[index], ...patch };
      return { ...prev, variants };
    });
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.categoryId) {
      setError("Silakan pilih kategori.");
      return;
    }

    if (formData.hasSizes) {
      const currentSizes = formData.sizes || [];
      if (currentSizes.length === 0) {
        setError("Silakan tambahkan minimal 1 ukuran.");
        return;
      }
      const names = currentSizes.map((s) => s.sizeName.trim().toLowerCase());
      if (names.some((n) => n === "")) {
        setError("Terdapat nama ukuran yang masih kosong.");
        return;
      }
      const unique = new Set(names);
      if (unique.size !== names.length) {
        setError("Terdapat nama ukuran yang duplikat.");
        return;
      }
    }

    if (formData.hasVariants) {
      const currentVariants = formData.variants || [];
      if (currentVariants.length === 0) {
        setError("Silakan tambahkan minimal 1 varian.");
        return;
      }
      const names = currentVariants.map((v) => v.name.trim().toLowerCase());
      if (names.some((n) => n === "")) {
        setError("Terdapat nama varian yang masih kosong.");
        return;
      }
      const unique = new Set(names);
      if (unique.size !== names.length) {
        setError("Terdapat nama varian yang duplikat.");
        return;
      }
      if (currentVariants.some((v) => v.stock === "")) {
        setError("Stok varian wajib diisi.");
        return;
      }
    }

    startTransition(async () => {
      try {
        const res = editingProduct
          ? await updateProduct(editingProduct.id, formData)
          : await createProduct(formData);

        if (res?.error) {
          setError(res.error);
          return;
        }
        toast.success(editingProduct ? "Produk diperbarui" : "Produk ditambahkan");
        onSaved();
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#111111] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-8 pt-4">
          {/* Informasi Dasar + Foto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Kiri */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="p-name" className="text-gray-300">Nama Produk</Label>
                <Input
                  id="p-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]"
                  placeholder="Misal: Jaket HMPSTI"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-category" className="text-gray-300">Kategori</Label>
                <Select
                  value={formData.categoryId ? String(formData.categoryId) : ""}
                  onValueChange={(val) => setFormData({ ...formData, categoryId: Number(val) })}
                >
                  <SelectTrigger id="p-category" className="w-full bg-white/5 border-white/10 text-white focus:ring-[#33A5D3]">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10 text-white">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-price" className="text-gray-300">Harga</Label>
                <RupiahInput
                  id="p-price"
                  value={formData.price}
                  onChange={(price) => setFormData({ ...formData, price: price === "" ? 0 : price })}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500">Format otomatis, contoh: 2000 menjadi Rp 2.000.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-desc" className="text-gray-300">Deskripsi</Label>
                <Textarea
                  id="p-desc"
                  value={formData.description ?? ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3] resize-none"
                  placeholder="Deskripsi singkat produk..."
                />
              </div>
            </div>

            {/* Kanan: Foto (opsional) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Foto Produk
                </Label>
                <span className="text-[11px] text-gray-500">Opsional</span>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {formData.images.map((url, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-black/40">
                      <img src={url} alt={`Gambar ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md hover:bg-red-600 shadow-lg"
                        aria-label={`Hapus gambar ${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-medium text-white">
                        {i === 0 ? "Utama" : `Gambar ${i + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-black/20 hover:bg-white/5 transition-colors">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    {uploadingImage ? (
                      <Loader2 className="w-5 h-5 animate-spin mb-1.5" />
                    ) : (
                      <Upload className="w-5 h-5 mb-1.5" />
                    )}
                    <p className="text-xs font-medium">Upload gambar produk</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">JPG/PNG · maks 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                      e.target.value = "";
                    }}
                  />
                </label>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Atau paste URL gambar..."
                    className="bg-black/20 border-white/10 text-xs text-gray-400 h-8 flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value;
                        if (val) {
                          setFormData((prev) => ({ ...prev, images: [...prev.images, val] }));
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stok */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white border-b border-white/10 pb-3">
              <Layers className="h-4 w-4 text-[#33A5D3]" strokeWidth={1.75} />
              Stok &amp; Variasi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <Label className="text-gray-300 cursor-pointer">Punya ukuran</Label>
                  <p className="text-xs text-gray-500">S/M/L/XL dengan stok per ukuran</p>
                </div>
                <Switch
                  checked={formData.hasSizes}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasSizes: checked })}
                  className="data-[state=checked]:bg-[#33A5D3]"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <div>
                  <Label className="text-gray-300 cursor-pointer">Punya varian</Label>
                  <p className="text-xs text-gray-500">Warna/edisi dengan harga &amp; foto sendiri</p>
                </div>
                <Switch
                  checked={formData.hasVariants}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasVariants: checked })}
                  className="data-[state=checked]:bg-[#33A5D3]"
                />
              </div>
            </div>

            {/* Tanpa ukuran & tanpa varian */}
            {!formData.hasSizes && !formData.hasVariants && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Stok tersedia</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.stock === null ? 0 : formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]"
                  />
                </div>
                <div className="flex items-center gap-2.5 sm:mt-7">
                  <Switch
                    checked={formData.forcePreorder}
                    onCheckedChange={(c) => setFormData({ ...formData, forcePreorder: c })}
                    className="data-[state=checked]:bg-[#33A5D3]"
                  />
                  <div>
                    <Label className="text-gray-300 cursor-pointer" onClick={() => setFormData({ ...formData, forcePreorder: !formData.forcePreorder })}>
                      Preorder
                    </Label>
                    <p className="text-xs text-gray-500">Tampilkan sebagai pre-order di halaman publik meski stok tersedia.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ukuran */}
            {formData.hasSizes && (
              <div className="p-4 bg-[#33A5D3]/5 border border-[#33A5D3]/20 rounded-lg space-y-4">
                <p className="text-sm text-[#33A5D3]">Produk berukuran otomatis berstatus pre-order. Kelola stok per ukuran:</p>

                {isFetchingSizes ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[#33A5D3]" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(formData.sizes || []).map((size, index) => {
                      const usedPresets = (formData.sizes || []).map((s) => s.sizeName).filter((n) => PRESET_SIZES.includes(n));
                      return (
                        <div key={size._id || index} className="flex gap-2 items-start">
                          <div className="w-1/3">
                            {size._isCustom ? (
                              <Input
                                autoFocus
                                className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]"
                                placeholder="Ketik ukuran..."
                                value={size.sizeName}
                                onChange={(e) => {
                                  const newSizes = [...(formData.sizes || [])];
                                  newSizes[index].sizeName = e.target.value;
                                  setFormData((prev) => ({ ...prev, sizes: newSizes }));
                                }}
                                onBlur={() => setFormData((prev) => ({ ...prev, sizes: sortSizes(prev.sizes || []) }))}
                              />
                            ) : (
                              <Select
                                value={size.sizeName || ""}
                                onValueChange={(val) => {
                                  const newSizes = [...(formData.sizes || [])];
                                  if (val === "custom") {
                                    newSizes[index]._isCustom = true;
                                    newSizes[index].sizeName = "";
                                  } else {
                                    newSizes[index]._isCustom = false;
                                    newSizes[index].sizeName = val;
                                  }
                                  setFormData((prev) => ({ ...prev, sizes: sortSizes(newSizes) }));
                                }}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-[#33A5D3]">
                                  <SelectValue placeholder="Pilih..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111] border-white/10 text-white">
                                  {PRESET_SIZES.map((preset) => (
                                    <SelectItem
                                      key={preset}
                                      value={preset}
                                      disabled={usedPresets.includes(preset) && size.sizeName !== preset}
                                    >
                                      {preset}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="custom">Lainnya...</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>

                          <div className="flex-1">
                            <Input
                              type="number"
                              min={0}
                              placeholder="Stok ukuran"
                              value={size.stock}
                              onChange={(e) => {
                                const newSizes = [...(formData.sizes || [])];
                                const val = e.target.value;
                                newSizes[index].stock = val === "" ? "" : Number(val);
                                setFormData((prev) => ({ ...prev, sizes: newSizes }));
                              }}
                              className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newSizes = [...(formData.sizes || [])];
                              newSizes.splice(index, 1);
                              setFormData((prev) => ({ ...prev, sizes: newSizes }));
                            }}
                            className="h-10 w-10 shrink-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSizes = [...(formData.sizes || []), { _id: randomId(), sizeName: "", stock: "" as const, _isCustom: false }];
                        setFormData((prev) => ({ ...prev, sizes: newSizes }));
                      }}
                      className="bg-transparent border-white/20 text-white hover:bg-white/10 mt-2"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Tambah Ukuran
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Varian */}
            {formData.hasVariants && (
              <div className="p-4 bg-white/[0.03] border border-white/10 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#33A5D3] flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Stok utama dihitung otomatis dari total stok varian.
                  </p>
                  <Label className="text-gray-300 flex items-center gap-2.5">
                    Preorder
                    <Switch
                      checked={formData.forcePreorder}
                      onCheckedChange={(c) => setFormData({ ...formData, forcePreorder: c })}
                      className="data-[state=checked]:bg-[#33A5D3]"
                    />
                  </Label>
                </div>

                {isFetchingVariants ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[#33A5D3]" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(formData.variants || []).map((variant, index) => (
                      <div key={variant._id || index} className="flex flex-wrap gap-2 items-start rounded-lg border border-white/5 bg-black/20 p-3">
                        <div className="w-full sm:w-36 space-y-1.5">
                          <Input
                            placeholder="Nama varian"
                            value={variant.name}
                            onChange={(e) => updateVariant(index, { name: e.target.value })}
                            className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3] h-9"
                          />
                          <p className="text-[10px] text-gray-500 px-0.5">misal: Hitam, Edisi A</p>
                        </div>

                        <div className="w-full sm:w-40 space-y-1.5">
                          <RupiahInput
                            value={variant.price}
                            onChange={(price) => updateVariant(index, { price })}
                            placeholder="0"
                            className="[&_input]:h-9 [&_input]:text-sm"
                          />
                          <p className="text-[10px] text-gray-500 px-0.5">Kosongkan untuk memakai harga utama</p>
                        </div>

                        <div className="w-28 space-y-1.5">
                          <Input
                            type="number"
                            min={0}
                            required
                            placeholder="Stok"
                            value={variant.stock}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateVariant(index, { stock: val === "" ? "" : Number(val) });
                            }}
                            className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3] h-9"
                          />
                          <p className="text-[10px] text-gray-500 px-0.5">Wajib diisi</p>
                        </div>

                        <div className="flex-1 min-w-[120px]">
                          {variant.imageUrl ? (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                              <img src={variant.imageUrl} alt={variant.name} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => updateVariant(index, { imageUrl: undefined })}
                                className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded"
                                aria-label="Hapus foto varian"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-16 h-16 border border-dashed border-white/20 rounded-lg cursor-pointer bg-black/20 hover:bg-white/5 transition-colors">
                              {uploadingVariantIndex === index ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                              ) : (
                                <Upload className="w-4 h-4 text-gray-400" />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingVariantIndex !== null}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleVariantImageUpload(index, file);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(index)}
                          className="h-9 w-9 shrink-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newVariants = [...(formData.variants || []), { _id: randomId(), name: "", price: "" as const, stock: "" as const }];
                        setFormData((prev) => ({ ...prev, variants: newVariants }));
                      }}
                      className="bg-transparent border-white/20 text-white hover:bg-white/10 mt-2"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Tambah Varian
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm font-medium p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              {error}
            </p>
          )}

          <div className="pt-4 flex justify-end gap-2 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-white/5 hover:text-white text-gray-400">
              Batal
            </Button>
            <Button type="submit" disabled={isPending || uploadingImage} className="bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-bold min-w-[100px]">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Produk"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}