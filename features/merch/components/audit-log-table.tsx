"use client";

import { useState, Fragment } from "react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PaginationBar } from "@/features/pameran-iot/components/pagination-bar";

type AuditLog = {
  id: number;
  adminId: string | null;
  entity: "category" | "product" | "order";
  entityId: number | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "VERIFY" | "REJECT";
  message: string;
  createdAt: Date;
};

interface AuditLogTableProps {
  logs: AuditLog[];
  totalItemCount: number;
  currentPage: number;
  totalPages: number;
  currentFilter: string;
  pageSize: string;
}

export function AuditLogTable({
  logs,
  totalItemCount,
  currentPage,
  totalPages,
  currentFilter,
  pageSize,
}: AuditLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const parseLogMessage = (message: string) => {
    const splitIndex = message.indexOf(". Perubahan: ");
    if (splitIndex !== -1) {
      return {
        mainMessage: message.substring(0, splitIndex),
        changesStr: message.substring(splitIndex + 13),
      };
    }
    return { mainMessage: message, changesStr: null };
  };

  const formatChanges = (changesStr: string) => {
    const parts = changesStr.split(", ");
    return (
      <div className="bg-[#0a0a0a] p-4 rounded-md border border-white/10 font-mono text-xs sm:text-sm mt-1 ml-4 sm:ml-[296px] mr-4 mb-2 overflow-x-auto">
        <div className="text-gray-500 mb-3 font-semibold tracking-wider">PERUBAHAN (CHANGES)</div>
        <ul className="space-y-1.5">
          {parts.map((p, i) => {
            const match = p.match(/(.*) \((.*) -> (.*)\)/);
            if (match) {
              return (
                <li key={i} className="text-gray-300">
                  <span className="text-blue-400">"{match[1]}"</span>: <span className="text-red-400 line-through mr-1">{match[2]}</span> <span className="text-gray-500 mr-1">➔</span> <span className="text-green-400">{match[3]}</span>
                </li>
              );
            }
            return <li key={i} className="text-gray-300">{p}</li>;
          })}
        </ul>
      </div>
    );
  };

  const handleFilterChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (val === "all") {
      params.delete("entity");
    } else {
      params.set("entity", val);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE": return <Badge className="bg-green-500/50 hover:bg-green-600/50 text-white">Buat</Badge>;
      case "UPDATE": return <Badge className="bg-yellow-500/50 hover:bg-yellow-600/50 text-white">Ubah</Badge>;
      case "DELETE": return <Badge className="bg-red-500/50 hover:bg-red-600/50 text-white">Hapus</Badge>;
      case "VERIFY": return <Badge className="bg-green-500/50 hover:bg-green-600/50 text-white">Terima</Badge>;
      case "REJECT": return <Badge className="bg-rose-600/50 hover:bg-rose-700/50 text-white">Tolak</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Riwayat Aktivitas ({totalItemCount})</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select 
            value={pageSize} 
            onValueChange={(val) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", "1");
              if (val === "10") {
                params.delete("pageSize");
              } else {
                params.set("pageSize", val);
              }
              const qs = params.toString();
              router.push(qs ? `${pathname}?${qs}` : pathname);
            }}
          >
            <SelectTrigger className="w-full sm:w-[110px]">
              <SelectValue placeholder="Tampil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Data</SelectItem>
              <SelectItem value="10">10 Data</SelectItem>
              <SelectItem value="20">20 Data</SelectItem>
              <SelectItem value="ALL">Semua</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={currentFilter || "all"} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter Modul..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Modul</SelectItem>
              <SelectItem value="product">Manajemen Produk</SelectItem>
              <SelectItem value="category">Kategori Produk</SelectItem>
              <SelectItem value="order">Verifikasi Pesanan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Waktu</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
              <TableHead>Pesan Log</TableHead>
              <TableHead className="w-[100px] text-right">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Tidak ada riwayat yang ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const { mainMessage, changesStr } = parseLogMessage(log.message);
                const isExpanded = !!expandedRows[log.id];

                return (
                  <Fragment key={log.id}>
                    <TableRow className={isExpanded ? "border-b-0" : ""}>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: localeID })}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="text-sm font-medium leading-relaxed">{mainMessage}</TableCell>
                      <TableCell className="text-right">
                        {changesStr ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleRow(log.id)} 
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8 font-semibold"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                            {isExpanded ? "Tutup" : "Lihat"}
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                    {isExpanded && changesStr && (
                      <TableRow className="bg-transparent hover:bg-transparent">
                        <TableCell colSpan={4} className="p-0 border-b">
                          {formatChanges(changesStr)}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationBar
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", p.toString());
          router.push(`${pathname}?${params.toString()}`);
        }}
        startIndex={(currentPage - 1) * (pageSize === "ALL" ? totalItemCount : parseInt(pageSize, 10))}
        pageSize={pageSize === "ALL" ? totalItemCount : parseInt(pageSize, 10)}
        totalItems={totalItemCount}
        itemLabel="log"
      />
    </div>
  );
}
