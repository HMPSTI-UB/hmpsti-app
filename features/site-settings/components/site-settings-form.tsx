"use client"

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { updateSiteSetting } from "../actions/site-settings-actions";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function SiteSettingsForm({ showPameran }: { showPameran: boolean }) {
  const [checked, setChecked] = useState(showPameran);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (value: boolean) => {
    setChecked(value);
    startTransition(async () => {
      try {
        await updateSiteSetting(value);
        toast.success(value ? "Pameran kini terlihat di publik." : "Pameran disembunyikan dari publik.");
      } catch {
        setChecked(!value);
        toast.error("Gagal menyimpan pengaturan.");
      }
    });
  };

  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          {checked ? (
            <Eye className="h-5 w-5 text-[#33A5D3]" />
          ) : (
            <EyeOff className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Tampilkan Pameran</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-md">
            Saat dimatikan, halaman publik Pameran (katalog, detail, voting, dan
            leaderboard live) tidak dapat diakses oleh pengunjung — modul admin
            tetap bisa digunakan.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        <Switch
          checked={checked}
          disabled={isPending}
          onCheckedChange={handleToggle}
          aria-label="Tampilkan Pameran"
        />
      </div>
    </div>
  );
}