"use client";

import { Trash2, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onFileSelect: (file: File) => void;
  uploading: boolean;
  /** "video" = 16:9 lebar penuh (gambar alat), "portrait" = 3:4 kecil (poster/banner) */
  aspect?: "video" | "portrait";
  uploadLabel: string;
  urlPlaceholder: string;
}

/**
 * Field upload gambar reusable (preview + tombol upload + input URL manual).
 * Menggantikan dua blok yang sebelumnya di-copy-paste di TeamManager.
 */
export function ImageUploadField({
  label,
  value,
  onChange,
  onFileSelect,
  uploading,
  aspect = "video",
  uploadLabel,
  urlPlaceholder,
}: ImageUploadFieldProps) {
  const previewClass =
    aspect === "portrait"
      ? "relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 w-full max-w-[150px] mx-auto"
      : "relative aspect-video rounded-lg overflow-hidden border border-white/10";

  return (
    <div className="space-y-3">
      <Label className="text-gray-300 flex items-center gap-2">
        <ImageIcon className="w-4 h-4" /> {label}
      </Label>
      <div className="flex flex-col gap-2">
        {value ? (
          <div className={previewClass}>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-black/20 hover:bg-white/5 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                ) : (
                  <Upload className="w-6 h-6 mb-2" />
                )}
                <p className="text-xs">{uploadLabel}</p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileSelect(file);
                }}
              />
            </label>
          </div>
        )}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-black/20 border-white/10 text-xs text-gray-400 h-8"
          placeholder={urlPlaceholder}
        />
      </div>
    </div>
  );
}
