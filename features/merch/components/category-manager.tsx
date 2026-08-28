"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Loader2, FolderTree } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getCategoryImpact 
} from "../actions/category-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/handle-action";

type Category = {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
};

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // Delete State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [impactCount, setImpactCount] = useState<number | null>(null);
  const [isFetchingImpact, setIsFetchingImpact] = useState(false);

  const handleOpenForm = (category?: Category) => {
    setFormError(null);
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
    } else {
      setEditingCategory(null);
      setName("");
      setSlug("");
    }
    setIsFormOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      // Auto-generate slug for new category
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    startTransition(async () => {
      try {
        if (editingCategory) {
          const res = await updateCategory(editingCategory.id, { name, slug });
          if (res?.error) {
            setFormError(res.error);
            return;
          }
          toast.success("Kategori berhasil diperbarui");
        } else {
          const res = await createCategory({ name, slug });
          if (res?.error) {
            setFormError(res.error);
            return;
          }
          toast.success("Kategori berhasil ditambahkan");
        }
        setIsFormOpen(false);
        router.refresh();
      } catch (err: unknown) {
        setFormError(getErrorMessage(err));
      }
    });
  };

  const handleConfirmDeleteClick = async (category: Category) => {
    setDeletingCategory(category);
    setIsFetchingImpact(true);
    setImpactCount(null);
    try {
      const count = await getCategoryImpact(category.id);
      setImpactCount(count);
    } catch {
      toast.error("Gagal memeriksa dampak penghapusan");
      setDeletingCategory(null);
    } finally {
      setIsFetchingImpact(false);
    }
  };

  const executeDelete = async () => {
    if (!deletingCategory) return;
    
    startTransition(async () => {
      try {
        const res = await deleteCategory(deletingCategory.id);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Kategori berhasil dihapus");
        setDeletingCategory(null);
        router.refresh();
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Gagal menghapus kategori"));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderTree className="text-[#33A5D3]" /> Kategori Produk
          </h2>
          <p className="text-gray-400 text-sm mt-1">Kelola master kategori untuk merchandise</p>
        </div>
        
        <Button onClick={() => handleOpenForm()} className="bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-bold gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[#111111] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Nama Kategori</Label>
              <Input 
                id="name" 
                required
                value={name} 
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]" 
                placeholder="Misal: Kaos, Topi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-gray-300">Slug (URL)</Label>
              <Input 
                id="slug" 
                required
                value={slug} 
                onChange={(e) => setSlug(e.target.value)}
                className="bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]" 
                placeholder="misal: kaos"
              />
            </div>
            
            {formError && <p className="text-red-400 text-sm">{formError}</p>}
            
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="hover:bg-white/5 hover:text-white text-gray-400">
                Batal
              </Button>
              <Button type="submit" disabled={isPending} className="bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-bold min-w-[100px]">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && !isPending && setDeletingCategory(null)}>
        <AlertDialogContent className="bg-[#111111] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Apakah Anda yakin ingin menghapus kategori <strong>"{deletingCategory?.name}"</strong>?
              {isFetchingImpact ? (
                <span className="block mt-4 flex items-center gap-2 text-[#33A5D3]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Memeriksa dampak penghapusan...
                </span>
              ) : impactCount !== null ? (
                <span className="block mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400">
                  Peringatan: Kategori ini sedang digunakan oleh <strong>{impactCount} produk</strong>. 
                  Jika dihapus, produk-produk tersebut akan menjadi "Tanpa Kategori".
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending || isFetchingImpact} className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                executeDelete();
              }}
              disabled={isPending || isFetchingImpact}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus Kategori"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-black/20 hover:bg-black/20">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-gray-400 font-medium">Nama Kategori</TableHead>
              <TableHead className="text-gray-400 font-medium">Slug</TableHead>
              <TableHead className="text-gray-400 font-medium text-right">Ditambahkan</TableHead>
              <TableHead className="text-gray-400 font-medium text-right w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCategories.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Belum ada kategori yang ditambahkan.
                </TableCell>
              </TableRow>
            ) : (
              initialCategories.map((category) => (
                <TableRow key={category.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-gray-400 font-mono text-sm">
                    {category.slug}
                  </TableCell>
                  <TableCell className="text-gray-400 text-right text-sm">
                    {format(category.createdAt, "dd MMM yyyy", { locale: id })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenForm(category)}
                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        title="Edit Kategori"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleConfirmDeleteClick(category)}
                        disabled={isFetchingImpact || isPending}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        title="Hapus Kategori"
                      >
                        {isFetchingImpact && deletingCategory?.id === category.id ? (
                           <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                           <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
