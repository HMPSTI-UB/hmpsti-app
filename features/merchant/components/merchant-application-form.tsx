"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { applyAsMerchant } from "../actions/merchant-actions";
import type { MerchantApplicationInput } from "../types";

export function MerchantApplicationForm({
  defaults,
}: {
  defaults?: Partial<MerchantApplicationInput>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [storeName, setStoreName] = useState(defaults?.storeName ?? "");
  const [description, setDescription] = useState(defaults?.description ?? "");
  const [phone, setPhone] = useState(defaults?.phone ?? "");
  const [address, setAddress] = useState(defaults?.address ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      toast.error("Nama toko wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = await applyAsMerchant({
        storeName,
        description: description || null,
        phone: phone || null,
        address: address || null,
      });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Pengajuan terkirim! Tunggu verifikasi admin.");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-white/10 bg-[#0D0E11] p-6"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#33A5D3]/10 text-[#33A5D3]">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Daftar Jadi Merchant</h2>
          <p className="text-xs text-gray-400">
            Isi data toko kamu. Pengajuan akan diverifikasi oleh admin.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-300">
          Nama Toko <span className="text-red-400">*</span>
        </Label>
        <Input
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Contoh: Innovara Merch Store"
          className="border-white/10 bg-white/5 text-white"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-300">Deskripsi Toko</Label>
        <textarea
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Ceritakan singkat produk yang kamu jual..."
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#33A5D3]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-300">No. HP / WhatsApp</Label>
          <Input
            value={phone ?? ""}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            className="border-white/10 bg-white/5 text-white"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-300">Alamat</Label>
          <Input
            value={address ?? ""}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Kota / alamat operasional"
            className="border-white/10 bg-white/5 text-white"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="gap-2 bg-[#33A5D3] font-bold text-black hover:bg-[#33A5D3]/90"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Kirim Pengajuan
        </Button>
      </div>
    </form>
  );
}
