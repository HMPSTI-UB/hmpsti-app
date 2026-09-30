"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { deleteMyProducts } from "../actions/my-product-actions";
import type { AdminProduct } from "@/features/merch/types";

const availabilityLabel = {
  ready: "Ready",
  out_of_stock: "Habis",
  preorder: "Preorder",
} as const;

const availabilityClass = {
  ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  preorder: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  out_of_stock: "bg-red-500/10 text-red-400 border-red-500/20",
} as const;

export function MyProductManager({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startDelete(async () => {
      const res = await deleteMyProducts([deleteTarget.id]);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Produk dihapus.");
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#33A5D3]">
            Merchant
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
            Produk Saya
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Produk yang kamu tambahkan akan langsung tayang di halaman Merch.
          </p>
        </div>
        <Button
          asChild
          className="gap-2 bg-[#33A5D3] font-bold text-black hover:bg-[#33A5D3]/90"
        >
          <Link href="/account/my/products/new">
            <Plus className="h-4 w-4" /> Tambah Produk
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-sm text-gray-500">
          Belum ada produk. Klik &quot;Tambah Produk&quot; untuk memulai.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-white/5 bg-[#0D0E11] transition-colors hover:border-white/20"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-600">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute left-3 top-3">
                  <Badge className={cn("border", availabilityClass[product.availabilityType])}>
                    {availabilityLabel[product.availabilityType]}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">{product.name}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {product.categoryName ?? "Tanpa Kategori"}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-sm font-semibold text-white">
                    Rp{" "}
                    {(product.priceFrom ?? product.price).toLocaleString("id-ID")}
                    {product.hasVariants &&
                    product.priceTo != null &&
                    product.priceFrom !== product.priceTo
                      ? ` – ${product.priceTo.toLocaleString("id-ID")}`
                      : ""}
                  </p>
                </div>

                <div className="flex justify-end gap-1 border-t border-white/5 pt-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#33A5D3] hover:bg-[#33A5D3]/10"
                    title="Edit produk"
                  >
                    <Link href={`/account/my/products/${product.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(product)}
                    className="h-8 w-8 text-red-400 hover:bg-red-400/10"
                    title="Hapus produk"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-white/10 bg-[#111111] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus produk ini?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Produk{" "}
              <span className="text-white">{deleteTarget?.name}</span> beserta
              gambarnya akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-white/10 bg-transparent text-gray-300 hover:bg-white/5 hover:text-white"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
