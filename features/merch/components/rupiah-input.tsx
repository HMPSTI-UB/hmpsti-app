"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function RupiahInput({
  value,
  onChange,
  className,
  ...props
}: {
  value: number | "";
  onChange: (value: number | "") => void;
  className?: string;
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "type">) {
  const formatted = value === "" ? "" : value ? value.toLocaleString("id-ID") : "";

  return (
    <div className={cn("relative", className)}>
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 pointer-events-none select-none">
        Rp
      </span>
      <Input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        {...props}
        value={formatted}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
          onChange(digits ? parseInt(digits, 10) : "");
        }}
        className={cn("pl-12 bg-white/5 border-white/10 text-white focus-visible:ring-[#33A5D3]", className)}
      />
    </div>
  );
}