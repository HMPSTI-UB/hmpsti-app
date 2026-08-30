"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getOrderDetail, verifyOrder, rejectOrder } from "../actions/order-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Search } from "lucide-react";
import { format } from "date-fns";

type OrderManagerProps = {
  initialOrders: any[];
  totalOrders: number;
  currentPage: number;
  currentLimit: number | "ALL";
  currentSearch: string;
  currentStatus?: string;
};

export function OrderManager({
  initialOrders,
  totalOrders,
  currentPage,
  currentLimit,
  currentSearch,
  currentStatus,
}: OrderManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);
  const [status, setStatus] = useState<string>(currentStatus || "SEMUA");

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const totalPages = currentLimit === "ALL" ? 1 : Math.ceil(totalOrders / currentLimit);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") {
      params.set("page", "1");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search);
  };

  const openDetail = async (orderId: number) => {
    setSelectedOrderId(orderId);
    setDetailLoading(true);
    setRejectionReason("");
    setIsRejecting(false);
    
    try {
      const res = await getOrderDetail(orderId);
      if (res.error) {
        toast.error(res.error);
        setSelectedOrderId(null);
      } else {
        setOrderDetail(res);
      }
    } catch (error) {
      toast.error("Gagal memuat detail pesanan.");
      setSelectedOrderId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedOrderId(null);
    setOrderDetail(null);
    setIsRejecting(false);
  };

  const handleVerify = async () => {
    if (!selectedOrderId) return;
    
    // Optimistic loading state handled by isPending or manual
    const loadingToast = toast.loading("Memverifikasi pesanan...");
    
    try {
      const res = await verifyOrder(selectedOrderId);

      // Cabang 1: server mengembalikan error eksplisit
      if (res && "error" in res) {
        toast.error(res.error, { id: loadingToast });
        return;
      }

      // Cabang 2: server mengembalikan success eksplisit
      if (res && "success" in res && res.success) {
        toast.success("Pesanan berhasil diverifikasi!", { id: loadingToast });
        // Update local state without closing dialog to show status change
        setOrderDetail((prev: any) => ({
          ...prev,
          order: { ...prev.order, status: "TERVERIFIKASI" }
        }));
        // Router refresh to update the table
        router.refresh();
        return;
      }

      // Cabang 3: fallback — res undefined/null/bentuk tak terduga
      toast.error("Terjadi kesalahan tak terduga. Coba muat ulang halaman.", { id: loadingToast });

    } catch (err) {
      // Cabang 4: exception
      toast.error("Terjadi kesalahan sistem.", { id: loadingToast });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleReject = async () => {
    if (!selectedOrderId) return;
    if (!rejectionReason.trim()) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }

    const loadingToast = toast.loading("Menolak pesanan...");
    
    try {
      const res = await rejectOrder(selectedOrderId, rejectionReason);
      
      // Cabang 1: server mengembalikan error eksplisit
      if (res && "error" in res) {
        toast.error(res.error, { id: loadingToast });
        return;
      }

      // Cabang 2: server mengembalikan success eksplisit
      if (res && "success" in res && res.success) {
        toast.success("Pesanan berhasil ditolak.", { id: loadingToast });
        setOrderDetail((prev: any) => ({
          ...prev,
          order: { ...prev.order, status: "DITOLAK", rejectionReason }
        }));
        router.refresh();
        return;
      }

      // Cabang 3: fallback
      toast.error("Terjadi kesalahan tak terduga. Coba muat ulang halaman.", { id: loadingToast });

    } catch (err) {
      // Cabang 4: exception
      toast.error("Terjadi kesalahan sistem.", { id: loadingToast });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU_VERIFIKASI": return <Badge variant="outline" className="text-yellow-500 border-yellow-500 bg-yellow-500/10">Menunggu</Badge>;
      case "TERVERIFIKASI": return <Badge variant="outline" className="text-emerald-500 border-emerald-500 bg-emerald-500/10">Terverifikasi</Badge>;
      case "DITOLAK": return <Badge variant="outline" className="text-red-500 border-red-500 bg-red-500/10">Ditolak</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="text-[#33A5D3]" /> Verifikasi Pesanan
          </h1>
          <p className="text-sm text-gray-400 mt-1">Kelola dan verifikasi pembayaran merchandise HMPSTI</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#111] p-4 rounded-xl border border-white/5">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pembeli atau resi..."
            className="pl-9 bg-black border-white/10 text-white"
          />
        </form>
        
        <Select 
          value={status} 
          onValueChange={(val) => {
            setStatus(val);
            updateFilters("status", val === "SEMUA" ? "" : val);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px] bg-black border-white/10 text-white">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-white/10 text-white">
            <SelectItem value="SEMUA">Semua Status</SelectItem>
            <SelectItem value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</SelectItem>
            <SelectItem value="TERVERIFIKASI">Terverifikasi</SelectItem>
            <SelectItem value="DITOLAK">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-white/10 rounded-xl overflow-hidden bg-black/50">
        <Table>
          <TableHeader className="bg-white/5 hover:bg-white/5">
            <TableRow className="border-white/10">
              <TableHead className="text-gray-400">Resi Pesanan</TableHead>
              <TableHead className="text-gray-400">Pembeli</TableHead>
              <TableHead className="text-gray-400">Tanggal</TableHead>
              <TableHead className="text-gray-400 text-right">Total</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialOrders.length === 0 ? (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Tidak ada data pesanan ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              initialOrders.map((order) => (
                <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-mono text-sm text-[#33A5D3]">{order.orderCode}</TableCell>
                  <TableCell>
                    <div className="font-medium text-white">{order.buyerName}</div>
                    <div className="text-xs text-gray-500">{order.buyerContact}</div>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm">
                    {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
                  </TableCell>
                  <TableCell className="text-right font-bold text-white">
                    Rp {order.totalAmount.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openDetail(order.id)}
                      className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <Eye className="w-4 h-4 mr-2" /> Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilters("page", String(currentPage - 1))}
            disabled={currentPage === 1 || isPending}
            className="bg-transparent border-white/10 text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-400 mx-2">
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilters("page", String(currentPage + 1))}
            disabled={currentPage === totalPages || isPending}
            className="bg-transparent border-white/10 text-white hover:bg-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={selectedOrderId !== null} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-3">
              Detail Pesanan
              {orderDetail?.order && getStatusBadge(orderDetail.order.status)}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {orderDetail?.order?.orderCode}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-12 text-center text-gray-500">Memuat detail pesanan...</div>
          ) : orderDetail ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              
              {/* Kiri: Info Data */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Informasi Pembeli</h3>
                  <div className="bg-white/5 rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Nama</span>
                      <span className="font-medium">{orderDetail.order.buyerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-gray-400">Kontak (WA)</span>
                      <span className="font-medium text-[#33A5D3]">{orderDetail.order.buyerContact}</span>
                    </div>
                    <div className="flex flex-col border-b border-white/5 pb-2 gap-1">
                      <span className="text-gray-400">Alamat Pengiriman</span>
                      <span className="font-medium leading-relaxed">{orderDetail.order.buyerAddress}</span>
                    </div>
                    {orderDetail.order.buyerNote && (
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400">Catatan</span>
                        <span className="font-medium text-yellow-500/80 italic">"{orderDetail.order.buyerNote}"</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Rincian Item</h3>
                  <div className="bg-white/5 rounded-lg overflow-hidden border border-white/5">
                    <Table>
                      <TableHeader className="bg-black/20">
                        <TableRow className="border-white/5">
                          <TableHead className="text-gray-400 text-xs">Produk</TableHead>
                          <TableHead className="text-gray-400 text-xs text-right">Qty</TableHead>
                          <TableHead className="text-gray-400 text-xs text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderDetail.items.map((item: any) => (
                          <TableRow key={item.id} className="border-white/5">
                            <TableCell>
                              <div className="font-medium text-sm text-white">{item.productNameSnapshot}</div>
                              {item.sizeNameSnapshot && (
                                <div className="text-xs text-gray-400">Ukuran: {item.sizeNameSnapshot}</div>
                              )}
                              <div className="text-xs text-gray-500">@ Rp {item.productPriceSnapshot.toLocaleString("id-ID")}</div>
                            </TableCell>
                            <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                            <TableCell className="text-right font-medium text-sm">Rp {item.subtotal.toLocaleString("id-ID")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-4 bg-black/40 flex justify-between items-center border-t border-white/5">
                      <span className="font-bold text-gray-400">Total Tagihan</span>
                      <span className="font-black text-[#33A5D3] text-lg">Rp {orderDetail.order.totalAmount.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kanan: Bukti Transfer & Aksi */}
              <div className="space-y-6 flex flex-col h-full">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Bukti Pembayaran</h3>
                  <a 
                    href={orderDetail.order.paymentProofUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block relative rounded-lg overflow-hidden border border-white/10 group cursor-pointer aspect-[3/4] sm:aspect-auto sm:h-[400px] bg-black/50"
                  >
                    <img 
                      src={orderDetail.order.paymentProofUrl} 
                      alt="Bukti Transfer" 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="bg-black/80 px-4 py-2 rounded-full text-xs font-bold tracking-widest">BUKA UKURAN PENUH</span>
                    </div>
                  </a>
                </div>

                {/* Status Section / Actions */}
                <div className="mt-auto pt-6 border-t border-white/10">
                  {orderDetail.order.status === "MENUNGGU_VERIFIKASI" ? (
                    <div className="space-y-4">
                      {isRejecting ? (
                        <div className="space-y-3 bg-red-500/5 p-4 rounded-lg border border-red-500/20">
                          <label className="text-sm text-gray-300 font-medium">Alasan Penolakan:</label>
                          <Textarea 
                            placeholder="Tulis alasan menolak pesanan ini (misal: Bukti transfer buram/kurang)..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="bg-black/50 border-red-500/30 text-white min-h-[80px]"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setIsRejecting(false)}>Batal</Button>
                            <Button variant="destructive" size="sm" onClick={handleReject}>Konfirmasi Tolak</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <Button 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12"
                            onClick={handleVerify}
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Verifikasi Pesanan
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="font-bold h-12 px-6"
                            onClick={() => setIsRejecting(true)}
                          >
                            <XCircle className="w-5 h-5 mr-2" />
                            Tolak
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/5 p-4 rounded-lg text-center space-y-1">
                      {orderDetail.order.status === "TERVERIFIKASI" && (
                        <>
                          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <div className="font-bold text-white">Pesanan Terverifikasi</div>
                          <div className="text-sm text-gray-400">Oleh Admin: {orderDetail.order.verifiedBy || "Unknown"}</div>
                          <div className="text-xs text-gray-500 mt-2">
                            {orderDetail.order.verifiedAt && format(new Date(orderDetail.order.verifiedAt), "dd MMM yyyy, HH:mm")}
                          </div>
                        </>
                      )}
                      {orderDetail.order.status === "DITOLAK" && (
                        <>
                          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <div className="font-bold text-white">Pesanan Ditolak</div>
                          <div className="text-sm text-gray-400">Oleh Admin: {orderDetail.order.verifiedBy || "Unknown"}</div>
                          <div className="text-sm text-red-400/80 bg-red-500/10 p-2 rounded mt-2 border border-red-500/20 italic">
                            "{orderDetail.order.rejectionReason}"
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
