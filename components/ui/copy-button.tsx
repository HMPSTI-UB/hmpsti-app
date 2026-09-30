"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Salin",
  copiedLabel = "Tersalin",
  className,
  variant = "icon",
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: "icon" | "text";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Kode disalin ke clipboard.");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Gagal menyalin. Salin manual ya.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-gray-300 transition-colors hover:border-[#33A5D3]/40 hover:bg-[#33A5D3]/10 hover:text-[#33A5D3]",
        variant === "icon" ? "h-8 w-8" : "px-3 py-1.5",
        className,
      )}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {variant === "text" && <span>{copied ? copiedLabel : label}</span>}
    </button>
  );
}
