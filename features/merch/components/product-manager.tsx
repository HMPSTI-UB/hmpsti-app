"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useLegacyTable,
  legacyCreateColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type LegacyColumnDef,
  type LegacyReactTable,
  type LegacyRow,
  type LegacyTable,
} from "@tanstack/react-table/legacy";
import { flexRender } from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Edit, Trash2, Loader2, Search, ImageIcon,
  ArrowUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Filter, SlidersHorizontal, LayoutGrid, Table as TableIcon, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { deleteManyProducts } from "../actions/product-actions";
import { ProductFormModal } from "./product-form-modal";
import type { AdminProduct, CategoryOption } from "../types";

const VIEW_KEY = "hmpsti:merch:view";
const availabilityLabel = { ready: "Ready", out_of_stock: "Habis", preorder: "Preorder" } as const;
const availabilityClass = {
  ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  preorder: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  out_of_stock: "bg-red-500/10 text-red-400 border-red-500/20",
} as const;

export function ProductManager({
  initialProducts,
  categories,
}: {
  initialProducts: AdminProduct[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [view, setView] = useState<"table" | "card">("table");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<number[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (saved === "table" || saved === "card") setView(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch { /* ignore */ }
  }, [view]);

  const columnHelper = legacyCreateColumnHelper<AdminProduct>();

  const columns = useMemo<LegacyColumnDef<AdminProduct, any>[]>(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => <SelectHeader table={table} />,
        cell: ({ row }) => <SelectCell row={row} />,
        enableSorting: false,
      }),
      columnHelper.display({
        id: "image",
        header: () => <span className="text-gray-400 font-medium">Gambar</span>,
        cell: ({ row }) => <Thumbnail url={row.original.images?.[0]} name={row.original.name} />,
        enableSorting: false,
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => <SortableHeader column={column} label="Nama Produk" />,
        cell: ({ row }) => <span className="font-bold text-white whitespace-nowrap">{row.original.name}</span>,
      }),
      columnHelper.accessor((r) => r.categoryName, {
        id: "category",
        header: () => <span className="text-gray-400 font-medium">Kategori</span>,
        cell: ({ row }) =>
          row.original.categoryName ? (
            <span className="text-gray-300">{row.original.categoryName}</span>
          ) : (
            <Badge variant="outline" className="bg-gray-800/50 text-gray-400 border-gray-700">Tanpa Kategori</Badge>
          ),
        filterFn: "equals",
      }),
      columnHelper.accessor("price", {
        header: ({ column }) => <SortableHeader column={column} label="Harga" />,
        cell: ({ row }) => <PriceCell product={row.original} />,
      }),
      columnHelper.accessor((r) => r.hasSizes || r.hasVariants, {
        id: "stockType",
        header: () => <span className="text-gray-400 font-medium">Varian</span>,
        cell: ({ row }) => {
          const p = row.original;
          if (p.hasSizes && p.hasVariants) {
            return <Badge className="bg-[#33A5D3]/10 text-[#33A5D3] border-[#33A5D3]/20">Ukuran + Varian</Badge>;
          }
          if (p.hasSizes) {
            return <Badge className="bg-[#33A5D3]/10 text-[#33A5D3] border-[#33A5D3]/20">Multi-Ukuran</Badge>;
          }
          if (p.hasVariants) {
            return <Badge className="bg-[#33A5D3]/10 text-[#33A5D3] border-[#33A5D3]/20">Multi-Varian</Badge>;
          }
          return (
            <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/10">
              Stok Tunggal ({p.stock ?? 0})
            </Badge>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor("availabilityType", {
        id: "availability",
        header: () => <span className="text-gray-400 font-medium">Status</span>,
        cell: ({ row }) => (
          <Badge className={cn("border", availabilityClass[row.original.availabilityType])}>
            {availabilityLabel[row.original.availabilityType]}
          </Badge>
        ),
        filterFn: "equals",
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="block text-right text-gray-400 font-medium">Aksi</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEdit(row.original)}
              className="h-8 w-8 text-[#33A5D3] hover:text-[#33A5D3] hover:bg-[#33A5D3]/10"
              title="Edit Produk"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDelete([row.original.id])}
              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
              title="Hapus Produk"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
        enableSorting: false,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useLegacyTable({
    data: initialProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => String(row.id),
    globalFilterFn: "includesString",
  });

  const { columnFilters, globalFilter, rowSelection } = table.state;
  const selectedCount = Object.keys(rowSelection ?? {}).length;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageRows = table.getRowModel().rows;
  const activeFilterCount = (columnFilters ?? []).length;

  const openEdit = (product: AdminProduct) => {
    router.push(`/dashboard/merch/products/${product.id}/edit`);
  };

  const openCreate = () => {
    router.push("/dashboard/merch/products/new");
  };

  const openDelete = (ids: number[]) => {
    setDeleteTargets(ids);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    startDelete(async () => {
      const res = await deleteManyProducts(deleteTargets);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(deleteTargets.length > 1 ? `${deleteTargets.length} produk dihapus` : "Produk berhasil dihapus");
      setIsDeleteOpen(false);
      setDeleteTargets([]);
      table.setRowSelection({});
      router.refresh();
    });
  };

  const handleSaved = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    router.refresh();
  };

  const getFilterValue = (id: string): string => {
    const f = (columnFilters ?? []).find((c) => c.id === id);
    return f ? String(f.value) : "ALL";
  };

  const setFilterValue = (id: string, value: string) => {
    table.setColumnFilters((prev) => {
      const rest = prev.filter((c) => c.id !== id);
      if (value === "ALL") return rest;
      return [...rest, { id, value }];
    });
    table.setPageIndex(0);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              value={globalFilter ?? ""}
              onChange={(e) => {
                table.setGlobalFilter(e.target.value);
                table.setPageIndex(0);
              }}
              className="pl-9 bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white gap-2 relative"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-[#33A5D3] text-[#050505] text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setView("table")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                view === "table" ? "bg-[#33A5D3] text-[#050505]" : "text-gray-400 hover:text-white",
              )}
            >
              <TableIcon className="w-3.5 h-3.5" /> Tabel
            </button>
            <button
              type="button"
              onClick={() => setView("card")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                view === "card" ? "bg-[#33A5D3] text-[#050505]" : "text-gray-400 hover:text-white",
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kartu
            </button>
          </div>
        </div>

        <Button onClick={openCreate} className="bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-bold whitespace-nowrap gap-2 self-start">
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && view === "table" && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#33A5D3]/10 border border-[#33A5D3]/20 rounded-xl">
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-white">{selectedCount}</span> produk dipilih
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => table.setRowSelection({})} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4 mr-1" /> Batal pilih
            </Button>
            <Button
              size="sm"
              onClick={() => openDelete(Object.keys(rowSelection ?? {}).map(Number))}
              className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Hapus
            </Button>
          </div>
        </div>
      )}

      {/* Table / Card view */}
      {view === "table" ? (
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/20 hover:bg-black/20 whitespace-nowrap">
              <TableRow className="border-white/10 hover:bg-transparent">
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-400 font-medium">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableCell colSpan={columns.length} className="text-center py-12 text-gray-500">
                    Tidak ada produk yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn("border-white/10 hover:bg-white/5", row.getIsSelected() && "bg-[#33A5D3]/5")}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <PaginationFooter table={table} totalRows={totalRows} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {pageRows.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-[#111111] border border-white/5 rounded-2xl">
              Tidak ada produk yang ditemukan.
            </div>
          ) : (
            pageRows.map((row) => <ProductCard key={row.id} product={row.original} onEdit={openEdit} onDelete={(id) => openDelete([id])} />)
          )}
        </div>
      )}

      {view === "card" && totalRows > 0 && (
        <PaginationFooter table={table} totalRows={totalRows} />
      )}

      {/* Filter modal */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="bg-[#111111] border-white/10 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter Produk
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Kategori</Label>
              <Select value={getFilterValue("category")} onValueChange={(v) => setFilterValue("category", v)}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:ring-[#33A5D3]">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10 text-white">
                  <SelectItem value="ALL">Semua Kategori</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select value={getFilterValue("availability")} onValueChange={(v) => setFilterValue("availability", v)}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:ring-[#33A5D3]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10 text-white">
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="preorder">Preorder</SelectItem>
                  <SelectItem value="out_of_stock">Habis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                table.setColumnFilters([]);
                table.setGlobalFilter("");
                table.setPageIndex(0);
              }}
              className="hover:bg-white/5 hover:text-white text-gray-400"
            >
              Reset
            </Button>
            <Button onClick={() => setIsFilterOpen(false)} className="bg-[#33A5D3] hover:bg-[#33A5D3]/90 text-black font-bold">
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={isDeleteOpen} onOpenChange={(open) => !open && setIsDeleteOpen(false)}>
        <AlertDialogContent className="bg-[#111111] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {deleteTargets.length > 1 ? `${deleteTargets.length} produk` : "produk ini"}?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Produk yang dipilih beserta gambar terkait akan dihapus secara permanen dari Cloudinary dan database. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function SortableHeader({
  column,
  label,
}: {
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
  label: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-7 px-2 -ml-2 text-gray-400 hover:text-white font-medium gap-1"
    >
      {label}
      {sorted === "asc" ? (
        <ChevronUp className="h-3.5 w-3.5" />
      ) : sorted === "desc" ? (
        <ChevronDown className="h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </Button>
  );
}

function SelectHeader({ table }: { table: LegacyTable<AdminProduct> }) {
  const checked = table.getIsAllPageRowsSelected();
  const indeterminate = table.getIsSomePageRowsSelected();
  return (
    <Checkbox
      checked={checked ? (indeterminate ? "indeterminate" : true) : false}
      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      aria-label="Pilih semua baris"
    />
  );
}

function SelectCell({ row }: { row: LegacyRow<AdminProduct> }) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(v) => row.toggleSelected(!!v)}
      aria-label={`Pilih ${row.original.name}`}
    />
  );
}

function PriceCell({ product }: { product: AdminProduct }) {
  if (product.hasVariants && product.priceFrom != null && product.priceTo != null && product.priceFrom !== product.priceTo) {
    return (
      <span className="text-gray-300 font-mono whitespace-nowrap">
        Rp {product.priceFrom.toLocaleString("id-ID")} – Rp {product.priceTo.toLocaleString("id-ID")}
      </span>
    );
  }
  return <span className="text-gray-300 font-mono">Rp {product.price.toLocaleString("id-ID")}</span>;
}

function Thumbnail({ url, name }: { url?: string; name: string }) {
  return (
    <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden border border-white/5 shrink-0">
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-600">
          <ImageIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: AdminProduct;
  onEdit: (p: AdminProduct) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="group bg-[#111111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
      <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <ImageIcon className="w-10 h-10" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={cn("border", availabilityClass[product.availabilityType])}>
            {availabilityLabel[product.availabilityType]}
          </Badge>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-white truncate">{product.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {product.categoryName ?? "Tanpa Kategori"}
              {product.hasSizes && product.hasVariants
                ? " · Ukuran + Varian"
                : product.hasSizes
                  ? " · Multi-ukuran"
                  : product.hasVariants
                    ? " · Multi-varian"
                    : ` · Stok ${product.stock ?? 0}`}
            </p>
          </div>
          {product.hasVariants && product.priceFrom != null && product.priceTo != null && product.priceFrom !== product.priceTo ? (
            <p className="text-sm font-semibold text-white font-mono shrink-0">
              Rp {product.priceFrom.toLocaleString("id-ID")} – Rp {product.priceTo.toLocaleString("id-ID")}
            </p>
          ) : (
            <p className="text-sm font-semibold text-white font-mono shrink-0">Rp {product.price.toLocaleString("id-ID")}</p>
          )}
        </div>
        <div className="flex justify-end gap-1 pt-1 border-t border-white/5">
          <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="h-8 w-8 text-[#33A5D3] hover:text-[#33A5D3] hover:bg-[#33A5D3]/10" title="Edit Produk">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10" title="Hapus Produk">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaginationFooter({ table, totalRows }: { table: LegacyReactTable<AdminProduct>; totalRows: number }) {
  const { pageIndex, pageSize } = table.state.pagination;
  const pageCount = table.getPageCount();
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/10">
      <p className="text-xs text-gray-500">
        Menampilkan <span className="text-gray-300 font-medium">{from}–{to}</span> dari{" "}
        <span className="text-gray-300 font-medium">{totalRows}</span> produk
      </p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Baris</span>
          <Select value={String(pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
            <SelectTrigger className="h-8 w-[80px] bg-white/5 border-white/10 text-white text-xs focus:ring-[#33A5D3]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-white/10 text-white">
              {[5, 10, 20, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-gray-400 px-1">
            {pageCount === 0 ? 0 : pageIndex + 1} / {pageCount}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}