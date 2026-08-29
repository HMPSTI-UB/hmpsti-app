"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Loader2, Search, Package, SwitchCamera, Upload, ImageIcon } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { createProduct, updateProduct, deleteProduct } from "../actions/product-actions";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/handle-action";
import { PaginationBar } from "@/features/pameran-iot/components/pagination-bar";
import { uploadImage } from "@/features/pameran-iot/actions/upload-action";
import type { ProductFormData } from "../types";

type AdminProduct = {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  name: string;
  price: number;
  images: string[];
  hasSizes: boolean;
  stock: number | null;
  availabilityType: "ready" | "out_of_stock" | "preorder";
  createdAt: Date;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

interface ProductManagerProps {
  initialProducts: AdminProduct[];
  totalProducts: number;
  categories: Category[];
  currentPage: number;
  currentLimit: number | "ALL";
  currentSearch: string;
  currentCategoryId: number | undefined;
  currentAvailability: string | undefined;
}

const emptyForm = (): ProductFormData => ({
  categoryId: null,
  name: "",
  description: "",
  price: 0,
  images: [],
  hasSizes: false,
  stock: 0,
  forcePreorder: false,
});

export function ProductManager({
  initialProducts,
  totalProducts,
  categories,
  currentPage,
  currentLimit,
  currentSearch,
  currentCategoryId,
  currentAvailability,
}: ProductManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<ProductFormData>(emptyForm());
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Dialog State Delete
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalPages = currentLimit === "ALL" ? 1 : Math.ceil(totalProducts / currentLimit);

  const buildUrl = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "" || value === "ALL") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    if (!("page" in updates)) {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  const navigate = useCallback((updates: Record<string, string | undefined>) => {
    router.push(buildUrl(updates));
  }, [router, buildUrl]);

  const handleOpenDialog = (product?: AdminProduct) => {
    setError(null);
    if (product) {
      setEditingProduct(product);
      setFormData({
        categoryId: product.categoryId,
        name: product.name,
        description: "", 
        price: product.price,
        images: product.images,
        hasSizes: product.hasSizes,
        stock: product.stock,
        forcePreorder: product.availabilityType === "preorder" && !product.hasSizes,
      });
    } else {
      setEditingProduct(null);
      setFormData(emptyForm());
    }
    setIsDialogOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploadingImage(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('file', file);
      const result = await uploadImage(data);
      setFormData(prev => ({ ...prev, images: [...prev.images, result.secure_url] }));
    } catch (err: unknown) {
      setError(`Gagal mengunggah gambar: ${getErrorMessage(err)}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.categoryId) {
      setError("Silakan pilih kategori.");
      return;
    }
    if (formData.images.length < 2 || formData.images.length > 4) {
      setError("Produk harus memiliki minimal 2 dan maksimal 4 gambar.");
      return;
    }

    startTransition(async () => {
      try {
        let res;
        if (editingProduct) {
          res = await updateProduct(editingProduct.id, formData);
        } else {
          res = await createProduct(formData);
        }

        if (res?.error) {
          setError(res.error);
          return;
        }

        toast.success(editingProduct ? "Produk diperbarui" : "Produk ditambahkan");
        setIsDialogOpen(false);
        router.refresh();
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    startTransition(async () => {
      try {
        const res = await deleteProduct(deletingId);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Produk berhasil dihapus");
        setDeletingId(null);
        router.refresh();
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Gagal menghapus produk"));
      }
    });
  };

  const resolvedPageSize = currentLimit === "ALL" ? totalProducts : currentLimit;
  const startIndex = (currentPage - 1) * resolvedPageSize;

  const availabilityLabel = {
    ready: "Ready",
    out_of_stock: "Habis",
    preorder: "Pre-order",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-[#33A5D3]" /> Manajemen Produk
          </h2>
          <p className="text-gray-400 text-sm mt-1">Kelola katalog barang dagangan HMPSTI</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              defaultValue={currentSearch}
              onChange={(e) => {
                const val = e.target.value;
                const timer = setTimeout(() => navigate({ search: val }), 400);
                return () => clearTimeout(timer);
              }}
              className="pl-9 bg-white/5 border-white/10 text-white w-full focus-visible:ring-[#33A5D3]"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap w-full sm:w-auto items-center gap-3">
            <Select value={String(currentLimit)} onValueChange={(val) => navigate({ limit: val })}>
              <SelectTrigger className="w-full sm:w-[90px] bg-white/5 border-white/10 text-white focus:ring-[#33A5D3]">
                <SelectValue placeholder="Tampil" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white">
                <SelectItem value="5">5 Data</SelectItem>
                <SelectItem value="10">10 Data</SelectItem>
                <SelectItem value="20">20 Data</SelectItem>
                <SelectItem value="ALL">Semua</SelectItem>
              </SelectContent>
            </Select>

            <Select value={currentCategoryId ? String(currentCategoryId) : "ALL"} onValueChange={(val) => navigate({ category: val === "ALL" ? undefined : val })}>
              <SelectTrigger className="w-full sm:w-[150px] bg-white/5 border-white/10 text-white focus:ring-[#33A5D3]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white">
                <SelectItem value="ALL">Semua Kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={currentAvailability ?? "ALL"} onValueChange={(val) => navigate({ availability: val === "ALL" ? undefined : val })}>
              <SelectTrigger className="w-full sm:w-[130px] bg-white/5 border-white/10 text-white focus:ring-[#33A5D3]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white">
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="preorder">Pre-order</SelectItem>
                <SelectItem value="out_of_stock">Habis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={() => handleOpenDialog()} className="bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-bold whitespace-nowrap gap-2">
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-black/20 hover:bg-black/20 whitespace-nowrap">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400 font-medium">Gambar</TableHead>
              <TableHead className="text-gray-400 font-medium">Nama Produk</TableHead>
              <TableHead className="text-gray-400 font-medium">Kategori</TableHead>
              <TableHead className="text-gray-400 font-medium">Harga</TableHead>
              <TableHead className="text-gray-400 font-medium text-center">Tipe Stok</TableHead>
              <TableHead className="text-gray-400 font-medium text-center">Status</TableHead>
              <TableHead className="text-gray-400 font-medium text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialProducts.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Tidak ada produk yang ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              initialProducts.map((product) => (
                <TableRow key={product.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div className="w-12 h-12 rounded bg-black/40 overflow-hidden border border-white/5">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-white whitespace-nowrap">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    {product.categoryId ? (
                      <span className="text-gray-300">{product.categoryName}</span>
                    ) : (
                      <Badge variant="outline" className="bg-gray-800/50 text-gray-400 border-gray-700">Tanpa Kategori</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300 font-mono">
                    Rp {product.price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-center text-gray-300 whitespace-nowrap">
                    {product.hasSizes ? (
                      <Badge className="bg-blue-900/30 text-blue-400 border border-blue-800 hover:bg-blue-900/40">Multi-Ukuran</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/10">Stok Tunggal ({product.stock})</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={
                      product.availabilityType === "ready" ? "bg-green-500/20 text-green-400 border-green-500/20" :
                      product.availabilityType === "preorder" ? "bg-orange-500/20 text-orange-400 border-orange-500/20" :
                      "bg-red-500/20 text-red-400 border-red-500/20"
                    }>
                      {availabilityLabel[product.availabilityType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(product)}
                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        title="Edit Produk"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(product.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <PaginationBar
          page={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => navigate({ page: String(p) })}
          startIndex={startIndex}
          pageSize={resolvedPageSize}
          totalItems={totalProducts}
          itemLabel="produk"
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#111111] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Nama Produk</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]"
                  placeholder="Misal: Jaket HMPSTI"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Kategori</Label>
                <Select
                  value={formData.categoryId ? String(formData.categoryId) : ""}
                  onValueChange={(val) => setFormData({...formData, categoryId: Number(val)})}
                  required
                >
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:ring-[#33A5D3]">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10 text-white">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} (Tipe: {c.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Harga (Rp)</Label>
                <Input
                  type="number"
                  required
                  min={0}
                  value={formData.price || ""}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]"
                  placeholder="Misal: 150000"
                />
              </div>
            </div>

            <div className="space-y-2 p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-white text-base font-semibold">Tipe Stok & Ukuran</Label>
                  <p className="text-sm text-gray-400">Pilih apakah produk ini memiliki ragam ukuran atau tidak.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Tunggal</span>
                  <Switch
                    checked={formData.hasSizes}
                    onCheckedChange={(checked) => setFormData({...formData, hasSizes: checked})}
                    className="data-[state=checked]:bg-[#33A5D3]"
                  />
                  <span className="text-sm text-gray-400">Multi-Ukuran</span>
                </div>
              </div>

              {!formData.hasSizes ? (
                <div className="flex flex-col sm:flex-row gap-4 p-3 bg-black/20 rounded border border-white/5">
                  <div className="flex-1 space-y-2">
                    <Label className="text-gray-300">Stok Tersedia</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.stock === null ? 0 : formData.stock}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mt-4 sm:mt-6">
                      <Switch
                        checked={formData.forcePreorder}
                        onCheckedChange={(c) => setFormData({...formData, forcePreorder: c})}
                        className="data-[state=checked]:bg-[#33A5D3]"
                      />
                      <Label className="text-gray-300 cursor-pointer" onClick={() => setFormData({...formData, forcePreorder: !formData.forcePreorder})}>
                        Tandai sebagai Pre-order
                      </Label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-md">
                  <p className="text-sm text-blue-400 flex items-start gap-2">
                    <SwitchCamera className="w-4 h-4 mt-0.5 shrink-0" />
                    Manajemen ukuran spesifik (S, M, L, dll) dan stok masing-masing akan dikelola secara detail setelah Anda menyimpan produk ini. Produk akan berstatus Pre-order secara otomatis.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Foto Produk (Wajib 2 - 4 Gambar)
              </Label>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formData.images.map((url, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 w-full mx-auto bg-black/40">
                      <img src={url} alt={`Gambar ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md hover:bg-red-600 shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs font-medium text-white shadow-lg backdrop-blur-sm">
                        {i === 0 ? "Utama" : `Gambar ${i + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length < 4 && (
                <div className="mt-4 flex flex-col gap-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-black/20 hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      ) : (
                        <Upload className="w-6 h-6 mb-2" />
                      )}
                      <p className="text-sm font-medium">
                        {formData.images.length === 0 ? "Upload Gambar Pertama (Wajib)" : "Upload Gambar Tambahan"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Format JPG/PNG. Maks 5MB.
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                        // Reset target value so same file can be uploaded again if needed
                        e.target.value = '';
                      }}
                    />
                  </label>
                  
                  {/* Manual URL Input Fallback */}
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      placeholder="Atau paste URL gambar dari internet..."
                      className="bg-black/20 border-white/10 text-xs text-gray-400 h-8 flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value;
                          if (val) {
                            setFormData(prev => ({ ...prev, images: [...prev.images, val] }));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-sm font-medium p-3 bg-red-500/10 rounded-lg border border-red-500/20">{error}</p>}

            <div className="pt-4 flex justify-end gap-2 border-t border-white/10">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/5 hover:text-white text-gray-400">
                Batal
              </Button>
              <Button type="submit" disabled={isPending || uploadingImage} className="bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-bold min-w-[100px]">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Produk"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-[#111111] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Apakah Anda yakin ingin menghapus produk ini? Gambar yang terkait juga akan dihapus dari Cloudinary secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

