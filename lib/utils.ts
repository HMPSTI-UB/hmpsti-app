import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DepartmentTheme } from "@/types/data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDepartmentThemeColors(theme: DepartmentTheme) {
  const isAmber = theme === "amber";

  return {
    isAmber,
    accent: isAmber ? "text-amber-500" : "text-sky-500",
    accentBg: isAmber ? "bg-amber-500" : "bg-sky-500",
    accentBgSoft: isAmber ? "bg-amber-500/10" : "bg-sky-500/10",
    accentBorder: isAmber ? "border-amber-500/30" : "border-sky-500/30",
    accentBorderHover: isAmber
      ? "hover:border-amber-500/50"
      : "hover:border-sky-500/50",
    accentGlow: isAmber ? "rgba(245,158,11,0.4)" : "rgba(14,165,233,0.4)",
    accentShadow: isAmber
      ? "hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]"
      : "hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)]",
    gradientFrom: isAmber ? "from-amber-950/40" : "from-sky-950/40",
  };
}
