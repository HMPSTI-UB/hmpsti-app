import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const ORDER_STATUS_LABEL: Record<string, string> = {
  MENUNGGU_VERIFIKASI: "Menunggu Verifikasi",
  TERVERIFIKASI: "Terverifikasi",
  DITOLAK: "Ditolak",
};

const STATUS_STYLES: Record<string, string> = {
  MENUNGGU_VERIFIKASI: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  TERVERIFIKASI: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  DITOLAK: "bg-red-500/10 text-red-400 border-red-500/30",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        STATUS_STYLES[status] ?? "bg-white/5 text-gray-300 border-white/10",
        className,
      )}
    >
      {ORDER_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}