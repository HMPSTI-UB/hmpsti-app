"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Package, FolderTree, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductManager } from "./product-manager";
import { CategoryManager } from "./category-manager";
import type { AdminProduct, CategoryOption } from "../types";

export type MerchTab = "produk" | "kategori";

export function MerchManager({
  initialTab,
  initialProducts,
  categories,
}: {
  initialTab: MerchTab;
  initialProducts: AdminProduct[];
  categories: (CategoryOption & { createdAt: Date })[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active: MerchTab = searchParams.get("tab") === "kategori" ? "kategori" : initialTab;

  const go = (tab: MerchTab) => {
    router.push(`/dashboard/merch/products?tab=${tab}`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-[#33A5D3]" /> Manajemen Produk
          </h2>
          <p className="text-gray-400 text-sm mt-1">Kelola produk &amp; kategori merchandise HMPSTI</p>
        </div>
      </header>

      <div className="flex items-center gap-1 border-b border-white/10">
        <TabButton active={active === "produk"} onClick={() => go("produk")} icon={Package} label="Produk" />
        <TabButton active={active === "kategori"} onClick={() => go("kategori")} icon={FolderTree} label="Kategori" />
      </div>

      {active === "produk" ? (
        <ProductManager initialProducts={initialProducts} categories={categories} />
      ) : (
        <CategoryManager initialCategories={categories} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors -mb-px",
        active ? "text-[#33A5D3]" : "text-gray-400 hover:text-white",
      )}
    >
      <Icon className="w-4 h-4" strokeWidth={1.75} />
      {label}
      <span
        className={cn(
          "absolute left-0 right-0 bottom-0 h-0.5 rounded-full bg-[#33A5D3]",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}