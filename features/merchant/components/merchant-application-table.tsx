"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { Search, Check, X, Loader2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { approveMerchant, rejectMerchant } from "../actions/admin-merchant-actions";
import type { MerchantApplicationRow, MerchantStatus } from "../types";

const STATUS_META: Record<MerchantStatus, { label: string; className: string }> = {
  PENDING: { label: "Menunggu", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  APPROVED: { label: "Disetujui", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  REJECTED: { label: "Ditolak", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function MerchantApplicationTable({
  applications,
}: {
  applications: MerchantApplicationRow[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MerchantStatus | "ALL">("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [approveTarget, setApproveTarget] = useState<MerchantApplicationRow | null>(null);
  const [isApproving, startApprove] = useTransition();

  const [rejectTarget, setRejectTarget] = useState<MerchantApplicationRow | null>(null);
  const [reason, setReason] = useState("");
  const [isRejecting, startReject] = useTransition();

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (status !== "ALL" && a.status !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.storeName.toLowerCase().includes(q) ||
          (a.userName ?? "").toLowerCase().includes(q) ||
          (a.userEmail ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [applications, status, search]);

  const total = filtered.length;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeFilterCount = status !== "ALL" ? 1 : 0;

  const resetFilters = () => {
    setStatus("ALL");
    setSearch("");
    setPage(1);
  };

  const confirmApprove = () => {
    if (!approveTarget) return;
    startApprove(async () => {
      const res = await approveMerchant(approveTarget.id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Merchant "${approveTarget.storeName}" disetujui.`);
      setApproveTarget(null);
      router.refresh();
    });
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    if (!reason.trim()) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }
    startReject(async () => {
      const res = await rejectMerchant(rejectTarget.id, reason);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Pengajuan "${rejectTarget.storeName}" ditolak.`);
      setRejectTarget(null);
      setReason("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Verifikasi Merchant</h1>
        <p className="text-sm text-gray-400">Tinjau dan setujui pengajuan merchant.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari toko / nama / email..."
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
      </div>

      {/* Table */}
      <div className="overflow-hidden overflow-x-auto rounded-2xl border border-white/5 bg-[#111111]">
        <Table>
          <TableHeader className="whitespace-nowrap bg-black/20 hover:bg-black/20">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="font-medium text-gray-400">Toko</TableHead>
              <TableHead className="font-medium text-gray-400">Pemilik</TableHead>
              <TableHead className="font-medium text-gray-400">Kontak</TableHead>
              <TableHead className="font-medium text-gray-400">Status</TableHead>
              <TableHead className="font-medium text-gray-400">Diajukan</TableHead>
              <TableHead className="text-right font-medium text-gray-400">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                  Tidak ada pengajuan ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((app) => (
                <TableRow key={app.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div className="min-w-[180px]">
                      <p className="font-bold text-white">{app.storeName}</p>
                      {app.description && (
                        <p className="line-clamp-1 max-w-[240px] text-xs text-gray-500">
                          {app.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-200">{app.userName ?? "-"}</p>
                    <p className="text-xs text-gray-500">{app.userEmail ?? "-"}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-300">
                    {app.phone ?? "-"}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge className={cn("border", STATUS_META[app.status].className)}>
                        {STATUS_META[app.status].label}
                      </Badge>
                      {app.status === "REJECTED" && app.rejectionReason && (
                        <p className="max-w-[200px] text-xs text-red-400">
                          {app.rejectionReason}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-gray-400">
                    {format(new Date(app.createdAt), "d MMM yyyy", { locale: localeID })}
                  </TableCell>
                  <TableCell>
                    {app.status === "PENDING" ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          onClick={() => setApproveTarget(app)}
                          className="gap-1.5 bg-emerald-500 font-bold text-black hover:bg-emerald-400"
                        >
                          <Check className="h-4 w-4" /> Setujui
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReason("");
                            setRejectTarget(app);
                          }}
                          className="gap-1.5 border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <X className="h-4 w-4" /> Tolak
                        </Button>
                      </div>
                    ) : (
                      <p className="text-right text-xs text-gray-600">—</p>
                    )}
                  </TableCell>
                </TableRow>
              ))
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
            <DialogTitle>Filter Merchant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-gray-300">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as MerchantStatus | "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full border-white/10 bg-white/5 text-white focus:ring-[#33A5D3]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#111] text-white">
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
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

      {/* Approve confirm */}
      <AlertDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
      >
        <AlertDialogContent className="border-white/10 bg-[#111111] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui merchant ini?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              <span className="text-white">{approveTarget?.storeName}</span> akan
              menjadi merchant aktif dan bisa menambah produk serta rekening.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isApproving}
              className="border-white/10 bg-transparent text-gray-300 hover:bg-white/5 hover:text-white"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmApprove();
              }}
              disabled={isApproving}
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Setujui"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="border-white/10 bg-[#111111] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak pengajuan</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs font-semibold text-gray-300">
              Alasan penolakan
            </Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Tuliskan alasan agar merchant bisa memperbaiki..."
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#33A5D3]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setRejectTarget(null)}
              className="text-gray-400 hover:text-white"
            >
              Batal
            </Button>
            <Button
              onClick={confirmReject}
              disabled={isRejecting}
              className="gap-2 bg-red-600 font-bold text-white hover:bg-red-700"
            >
              {isRejecting && <Loader2 className="h-4 w-4 animate-spin" />}
              Tolak Pengajuan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
