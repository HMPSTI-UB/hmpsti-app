"use client";

import { useState } from "react";

export type PerPage = number | "ALL";

export interface UsePaginationResult<T> {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  pageItems: T[];
  /** ukuran halaman efektif (jumlah item saat "ALL") */
  pageSize: number;
  /** indeks item pertama halaman ini (0-based), untuk teks "Menampilkan x - y" */
  startIndex: number;
}

/**
 * Pagination client-side generik. Meng-clamp halaman ke rentang valid sehingga
 * tidak pernah menampilkan halaman kosong ketika filter mengecilkan daftar.
 * Dipakai TeamManager dan bisa dipakai ulang oleh tabel lain (mis. SessionManager).
 */
export function usePagination<T>(items: T[], perPage: PerPage): UsePaginationResult<T> {
  const [page, setPage] = useState(1);

  const pageSize = perPage === "ALL" ? Math.max(items.length, 1) : perPage;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  return { page: currentPage, setPage, totalPages, pageItems, pageSize, startIndex };
}
