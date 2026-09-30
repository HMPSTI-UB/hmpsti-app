"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** indeks item pertama halaman ini (0-based) */
  startIndex: number;
  pageSize: number;
  totalItems: number;
  /** kata benda untuk teks info, mis. "tim" */
  itemLabel?: string;
}

/**
 * Bar pagination reusable: teks "Menampilkan x - y dari N" + tombol nomor halaman
 * dengan ellipsis. Menyembunyikan diri jika hanya ada 1 halaman.
 */
export function PaginationBar({
  page,
  totalPages,
  onPageChange,
  startIndex,
  pageSize,
  totalItems,
  itemLabel = "data",
}: PaginationBarProps) {
  // Cek mobile secara hydration-safe untuk mempersempit rentang nomor halaman.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (totalPages <= 1) return null;

  const range = isMobile ? 0 : 1;
  const from = startIndex + 1;
  const to = Math.min(startIndex + pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-white/10 bg-black/20">
      <span className="text-sm text-gray-400 order-2 sm:order-1">
        <span className="hidden xs:inline">Menampilkan </span>
        {from} - {to}
        <span className="hidden xs:inline"> dari {totalItems} {itemLabel}</span>
        <span className="xs:hidden"> / {totalItems}</span>
      </span>
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="bg-transparent border-white/10 hover:bg-white/5 text-white h-8 w-8 p-0 sm:w-auto sm:px-3"
        >
          <ChevronLeft className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            if (p === 1 || p === totalPages || (p >= page - range && p <= page + range)) {
              return (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 p-0 text-xs sm:text-sm ${
                    page === p
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      : "bg-transparent border-white/10 hover:bg-white/5 text-gray-300"
                  }`}
                >
                  {p}
                </Button>
              );
            } else if (p === page - (range + 1) || p === page + (range + 1)) {
              return <span key={p} className="text-gray-500 px-0.5 text-xs">..</span>;
            }
            return null;
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="bg-transparent border-white/10 hover:bg-white/5 text-white h-8 w-8 p-0 sm:w-auto sm:px-3"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4 sm:ml-1" />
        </Button>
      </div>
    </div>
  );
}
