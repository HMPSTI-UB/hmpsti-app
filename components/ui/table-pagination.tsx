"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:flex-row">
      <p className="text-xs text-gray-500">
        Menampilkan{" "}
        <span className="font-medium text-gray-300">
          {from}–{to}
        </span>{" "}
        dari <span className="font-medium text-gray-300">{total}</span> data
      </p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Baris</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              onPageSizeChange(Number(v));
              onPageChange(1);
            }}
          >
            <SelectTrigger className="h-8 w-[80px] border-white/10 bg-white/5 text-xs text-white focus:ring-[#33A5D3]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#111] text-white">
              {[5, 10, 20, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-1 text-xs text-gray-400">
            {pageCount === 0 ? 0 : page} / {pageCount}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className="h-8 w-8 text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
