"use client";

import { useState } from "react";
import { Search, Trophy, Heart, X, CheckCircle2, Clock } from "lucide-react";
import { submitVote } from "../actions/vote";
import { toast } from "sonner";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActiveSession } from "../types";

export interface Team {
  id: number;
  title: string;
  className: string;
  groupNumber: number;
  code: string;
  bannerImageUrl?: string | null;
  projectImageUrl?: string | null;
  teamMembers: string | null;
  sessionId: number;
}

export default function VotePage({ initialTeams, activeSession }: { initialTeams: Team[], activeSession: ActiveSession }) {
  const [selectedProduct, setSelectedProduct] = useState<Team | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [nama, setNama] = useState("");
  const [kesan, setKesan] = useState("");
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("ASC");

  const classes = Array.from(new Set(initialTeams?.map(t => t.className).filter(Boolean))).sort();
  const sessions = Array.from(new Set(initialTeams?.map(t => t.sessionId).filter(Boolean))).sort();

  const filteredProducts = initialTeams?.filter((p) => {
    const matchSearch =
      (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.teamMembers || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.code || "").toLowerCase().includes(search.toLowerCase());
    
    const matchClass = selectedClass === "ALL" || p.className === selectedClass;

    return matchSearch && matchClass;
  }).sort((a, b) => {
    const classCompare = (a.className || "").localeCompare(b.className || "");
    if (classCompare !== 0) {
      return sortOrder === "ASC" ? classCompare : -classCompare;
    }
    const groupA = Number(a.groupNumber) || 0;
    const groupB = Number(b.groupNumber) || 0;
    return sortOrder === "ASC" ? groupA - groupB : groupB - groupA;
  }) || [];

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !activeSession || isSubmitting) return;
    
    setIsSubmitting(true);
    const result = await submitVote(selectedProduct.id, activeSession.id, nama, kesan);
    setIsSubmitting(false);

    if (result.success) {
      // Close modal & reset
      setSelectedProduct(null);
      setNama("");
      setKesan("");
      
      // Show success toast
      toast.success("Vote berhasil dicatat!", {
        position: "top-right",
      });
    } else {
      toast.error("Gagal mencatat vote. Silakan coba lagi.", {
        position: "top-right",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm font-bold text-blue-400">
          <Clock className="w-4 h-4" /> {activeSession?.name || "Sesi 1 dari 2"}
        </div>
        
        <h1 className="flex flex-col items-center gap-1">
          <span className="text-3xl md:text-5xl font-black tracking-tighter text-white">
            VOTE KARYA FAVORIT
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
          Pilih inovasi favorit yang paling solutif dan menarik! <br/>
          <span className="text-sm font-normal text-gray-400 mt-2 block">
            Pilih tim dari daftar di bawah, isikan nama pengunjung serta kesan pesan (opsional), lalu submit vote Anda.
          </span>
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-12 space-y-8">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm max-w-4xl mx-auto">
          <div className="relative w-full md:flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari karya atau nama anggota..."
              className="block w-full pl-12 bg-white/5 border border-white/10 rounded-xl py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto items-center gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full md:w-[150px] bg-white/5 border border-white/10 text-white rounded-xl py-3 h-auto focus:ring-2 focus:ring-blue-500 focus:ring-offset-0">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white">
                <SelectItem value="ALL" className="focus:bg-white/10 focus:text-white cursor-pointer">Semua Kelas</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={String(c)} value={String(c)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                    Kelas {String(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full md:w-[140px] bg-white/5 border border-white/10 text-white rounded-xl py-3 h-auto focus:ring-2 focus:ring-blue-500 focus:ring-offset-0">
                <SelectValue placeholder="Urutan" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white">
                <SelectItem value="ASC" className="focus:bg-white/10 focus:text-white cursor-pointer">A-Z (Naik)</SelectItem>
                <SelectItem value="DESC" className="focus:bg-white/10 focus:text-white cursor-pointer">Z-A (Turun)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Grid / Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm">
            <Trophy className="w-16 h-16 text-gray-500 mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">Tidak ada karya ditemukan</h3>
            <p className="text-gray-400 max-w-md">
              Cobalah gunakan kata kunci lain atau ubah filter pencarian untuk melihat karya yang lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className="cursor-pointer group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20 flex items-center justify-center">
                  <Image
                    src={product.projectImageUrl || product.bannerImageUrl || "https://res.cloudinary.com/dz1irxeio/image/upload/v1740669299/assets/hmpsti/hmpsti_logo_wb_yvtt4t.png"}
                    alt={product.title}
                    fill
                    unoptimized={true}
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Team Code Badge */}
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold px-2.5 py-1 rounded-lg text-white">
                    {product.code}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Kelas {product.className} - Kelompok {product.groupNumber}
                  </p>
                </div>

                {/* Vote Overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-blue-500/25 scale-95 group-hover:scale-100 transition-transform">
                    <Heart className="w-4 h-4 fill-current" />
                    Pilih Tim
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voting Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedProduct(null)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-[#111] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-400 fill-blue-400" />
                Konfirmasi Vote
              </h3>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleVote} className="p-6 space-y-6">
              {/* Selected Item Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="text-xs text-blue-400 font-bold mb-1">{selectedProduct.code} - KELOMPOK {selectedProduct.groupNumber}</div>
                <div className="text-white font-medium">{selectedProduct.title}</div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">
                    Nama Pengunjung <span className="text-gray-500">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama pengunjung"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">
                    Kesan & Pesan <span className="text-gray-500">(Opsional)</span>
                  </label>
                  <textarea
                    value={kesan}
                    onChange={(e) => setKesan(e.target.value)}
                    placeholder="Tulis kesan dan pesan pengunjung terhadap karya ini..."
                    rows={3}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-300 font-medium hover:bg-white/5 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all shadow-lg ${
                    isSubmitting 
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed shadow-none" 
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                  }`}
                >
                  {isSubmitting ? "Menyimpan..." : "Submit Vote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
