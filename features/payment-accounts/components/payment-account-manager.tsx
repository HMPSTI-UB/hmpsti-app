"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Wallet,
  Landmark,
  QrCode,
  Upload,
  X,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { TablePagination } from "@/components/ui/table-pagination";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadImageToCloudinary } from "@/features/merch/actions/upload-actions";
import {
  createMyAccount,
  updateMyAccount,
  deleteMyAccount,
  adminUpdateAccount,
  adminDeleteAccount,
} from "../actions/payment-account-actions";
import type {
  AdminPaymentAccountRow,
  PaymentAccount,
  PaymentAccountInput,
  PaymentAccountType,
} from "../types";

type AnyAccount = PaymentAccount | AdminPaymentAccountRow;

const TYPE_LABEL: Record<PaymentAccountType, string> = {
  bank: "Bank",
  e_wallet: "E-Wallet",
  qris: "QRIS",
};

const TYPE_ICON: Record<PaymentAccountType, typeof Wallet> = {
  bank: Landmark,
  e_wallet: Wallet,
  qris: QrCode,
};

const emptyForm: PaymentAccountInput = {
  type: "bank",
  bankName: "",
  accountNumber: "",
  accountOwner: "",
  qrisImgUrl: "",
  isActive: true,
};

export function PaymentAccountManager({
  mode,
  accounts,
}: {
  mode: "owner" | "admin";
  accounts: AnyAccount[];
}) {
  const router = useRouter();
  const isAdminMode = mode === "admin";

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PaymentAccountType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PaymentAccountInput>(emptyForm);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [deleteTarget, setDeleteTarget] = useState<AnyAccount | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      if (typeFilter !== "ALL" && a.type !== typeFilter) return false;
      if (statusFilter === "ACTIVE" && !a.isActive) return false;
      if (statusFilter === "INACTIVE" && a.isActive) return false;
      if (search) {
        const admin = a as AdminPaymentAccountRow;
        const q = search.toLowerCase();
        return (
          a.bankName.toLowerCase().includes(q) ||
          (a.accountNumber ?? "").toLowerCase().includes(q) ||
          a.accountOwner.toLowerCase().includes(q) ||
          (admin.storeName ?? "").toLowerCase().includes(q) ||
          (admin.ownerName ?? "").toLowerCase().includes(q) ||
          (admin.ownerEmail ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [accounts, typeFilter, statusFilter, search]);

  const total = filtered.length;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeFilterCount = (typeFilter !== "ALL" ? 1 : 0) + (statusFilter !== "ALL" ? 1 : 0);

  const resetFilters = () => {
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setSearch("");
    setPage(1);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (account: AnyAccount) => {
    setEditingId(account.id);
    setForm({
      type: account.type,
      bankName: account.bankName,
      accountNumber: account.accountNumber ?? "",
      accountOwner: account.accountOwner,
      qrisImgUrl: account.qrisImgUrl ?? "",
      isActive: account.isActive,
    });
    setIsOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await uploadImageToCloudinary(data);
      setForm((prev) => ({ ...prev, qrisImgUrl: res.secure_url }));
      toast.success("Gambar QRIS berhasil diunggah.");
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengunggah gambar QRIS.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    if (!form.bankName.trim()) {
      toast.error("Nama bank / e-wallet wajib diisi.");
      return;
    }
    if (!form.accountOwner.trim()) {
      toast.error("Nama pemilik rekening wajib diisi.");
      return;
    }
    if (form.type === "qris" && !form.qrisImgUrl?.trim()) {
      toast.error("Gambar QRIS wajib diunggah.");
      return;
    }
    if (form.type !== "qris" && !form.accountNumber?.trim()) {
      toast.error("Nomor rekening wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = editingId
        ? isAdminMode
          ? await adminUpdateAccount(editingId, form)
          : await updateMyAccount(editingId, form)
        : await createMyAccount(form);

      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(editingId ? "Rekening diperbarui." : "Rekening ditambahkan.");
      setIsOpen(false);
      router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startDelete(async () => {
      const res = isAdminMode
        ? await adminDeleteAccount(deleteTarget.id)
        : await deleteMyAccount(deleteTarget.id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Rekening dihapus.");
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {isAdminMode ? "Semua Rekening" : "Rekening Toko"}
        </h1>
        <p className="text-sm text-gray-400">
          {isAdminMode
            ? "Kelola rekening bank / e-wallet / QRIS dari seluruh pengguna."
            : "Rekening tujuan pembayaran saat produkmu dibeli."}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari rekening / pemilik..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="border-white/10 bg-white/5 pl-9 text-white focus-visible:ring-[#33A5D3]"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            className="relative gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#33A5D3] px-1 text-[11px] font-bold text-[#050505]">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <Button
          onClick={openCreate}
          className="gap-2 self-start bg-[#33A5D3] font-bold text-black hover:bg-[#33A5D3]/90"
        >
          <Plus className="h-4 w-4" /> Tambah Rekening
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden overflow-x-auto rounded-2xl border border-white/5 bg-[#111111]">
        <Table>
          <TableHeader className="whitespace-nowrap bg-black/20 hover:bg-black/20">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="font-medium text-gray-400">Tipe</TableHead>
              <TableHead className="font-medium text-gray-400">Nama</TableHead>
              <TableHead className="font-medium text-gray-400">Nomor / Akun</TableHead>
              <TableHead className="font-medium text-gray-400">Pemilik</TableHead>
              {isAdminMode && (
                <TableHead className="font-medium text-gray-400">Milik</TableHead>
              )}
              <TableHead className="font-medium text-gray-400">Status</TableHead>
              <TableHead className="text-right font-medium text-gray-400">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell
                  colSpan={isAdminMode ? 7 : 6}
                  className="py-12 text-center text-gray-500"
                >
                  Belum ada rekening. Klik &quot;Tambah Rekening&quot; untuk membuat.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((account) => {
                const Icon = TYPE_ICON[account.type];
                const admin = account as AdminPaymentAccountRow;
                return (
                  <TableRow key={account.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-gray-300">
                        <Icon className="h-4 w-4 text-[#33A5D3]" />
                        {TYPE_LABEL[account.type]}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-bold text-white">
                      {account.bankName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-gray-300">
                      {account.type === "qris" ? "Scan QRIS" : account.accountNumber}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-gray-300">
                      {account.accountOwner}
                    </TableCell>
                    {isAdminMode && (
                      <TableCell className="whitespace-nowrap text-xs text-gray-400">
                        {admin.storeName || admin.ownerName || admin.ownerEmail || "-"}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-white/10",
                          account.isActive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-gray-800/50 text-gray-500",
                        )}
                      >
                        {account.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(account)}
                          className="h-8 w-8 text-[#33A5D3] hover:bg-[#33A5D3]/10"
                          title="Edit rekening"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(account)}
                          className="h-8 w-8 text-red-400 hover:bg-red-400/10"
                          title="Hapus rekening"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Filter modal */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="border-white/10 bg-[#111111] text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Filter Rekening</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Tipe</Label>
              <Select
                value={typeFilter}
                onValueChange={(v) => {
                  setTypeFilter(v as PaymentAccountType | "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full border-white/10 bg-white/5 text-white focus:ring-[#33A5D3]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111] text-white">
                  <SelectItem value="ALL">Semua Tipe</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as "ALL" | "ACTIVE" | "INACTIVE");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full border-white/10 bg-white/5 text-white focus:ring-[#33A5D3]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111] text-white">
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="text-gray-400 hover:bg-white/5 hover:text-white"
            >
              Reset
            </Button>
            <Button
              onClick={() => setIsFilterOpen(false)}
              className="bg-[#33A5D3] font-bold text-black hover:bg-[#33A5D3]/90"
            >
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-white/10 bg-[#111111] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Rekening" : "Tambah Rekening"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-300">Tipe</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, type: v as PaymentAccountType }))
                }
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#141414] text-white">
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-300">
                {form.type === "qris" ? "Nama QRIS" : "Nama Bank / E-Wallet"}
              </Label>
              <Input
                value={form.bankName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bankName: e.target.value }))
                }
                placeholder={
                  form.type === "qris" ? "QRIS HMPSTI Store" : "BCA / GoPay / DANA"
                }
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            {form.type !== "qris" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-300">
                  Nomor Rekening
                </Label>
                <Input
                  value={form.accountNumber ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      accountNumber: e.target.value,
                    }))
                  }
                  placeholder="1234567890"
                  className="border-white/10 bg-white/5 font-mono text-white"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-300">
                Nama Pemilik
              </Label>
              <Input
                value={form.accountOwner}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, accountOwner: e.target.value }))
                }
                placeholder="Nama sesuai rekening"
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            {form.type === "qris" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-300">
                  Gambar QRIS
                </Label>
                {form.qrisImgUrl ? (
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0A0A0A] p-2">
                    <img
                      src={form.qrisImgUrl}
                      alt="QRIS"
                      className="h-16 w-16 rounded-lg bg-black/40 object-contain"
                    />
                    <span className="flex-1 truncate text-xs text-gray-400">
                      {form.qrisImgUrl}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, qrisImgUrl: "" }))
                      }
                      className="h-8 w-8 text-red-400 hover:bg-red-400/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 py-3 text-xs text-gray-300 transition-colors hover:border-[#33A5D3] hover:text-white">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#33A5D3]" />
                    ) : (
                      <Upload className="h-4 w-4 text-[#33A5D3]" />
                    )}
                    <span>{isUploading ? "Mengunggah..." : "Upload Gambar QRIS"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
              <div>
                <Label className="text-xs font-bold text-white">Aktif</Label>
                <p className="text-[11px] text-gray-400">
                  Hanya rekening aktif yang tampil saat checkout.
                </p>
              </div>
              <Switch
                checked={form.isActive ?? true}
                onCheckedChange={(v) =>
                  setForm((prev) => ({ ...prev, isActive: v }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || isUploading}
              className="gap-2 bg-[#33A5D3] font-bold text-black hover:bg-[#33A5D3]/90"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-white/10 bg-[#111111] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus rekening ini?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Rekening <span className="text-white">{deleteTarget?.bankName}</span>{" "}
              akan dihapus permanen dan tidak lagi muncul di checkout.
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
