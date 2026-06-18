"use client";

import { Search, MapPin, Calendar, Clock, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Team {
  id: number;
  code: string;
  className: string;
  groupNumber: number;
  title: string;
  teamMembers: string;
  bannerImageUrl: string | null;
  projectImageUrl: string | null;
  sessionId: number | null;
}

export default function PameranIoTPage({ teams }: { teams: Team[] }) {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedSession, setSelectedSession] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("ASC");

  const classes = Array.from(new Set(teams?.map(t => t.className).filter(Boolean))).sort();
  const sessions = Array.from(new Set(teams?.map(t => t.sessionId).filter(Boolean))).sort();

  const filteredProducts = teams?.filter((p) => {
    const matchSearch =
      (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.teamMembers || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.code || "").toLowerCase().includes(search.toLowerCase());
    
    const matchClass = selectedClass === "ALL" || p.className === selectedClass;
    const matchSession = selectedSession === "ALL" || (p.sessionId && p.sessionId.toString() === selectedSession);

    return matchSearch && matchClass && matchSession;
  }).sort((a, b) => {
    const classCompare = (a.className || "").localeCompare(b.className || "");
    if (classCompare !== 0) {
      return sortOrder === "ASC" ? classCompare : -classCompare;
    }
    const groupA = Number(a.groupNumber) || 0;
    const groupB = Number(b.groupNumber) || 0;
    return sortOrder === "ASC" ? groupA - groupB : groupB - groupA;
  }) || [];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-400">
          <Trophy className="w-4 h-4" />
          INOTEK X PROVOKS
        </div>
        
        <h1 className="flex flex-col items-center gap-1">
          <span className="text-3xl md:text-5xl font-black tracking-tighter text-white">
            PAMERAN KARYA
          </span>
          <span className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-200 to-amber-400">
            INTERNET OF THINGS
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
          Inovasi Tanpa Batas, Terhubung Untuk Masa Depan
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-400 mt-8 bg-white/5 w-fit mx-auto p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Sabtu, 20 Juni 2026
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 bg-white/20 rounded-full" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            08.30 - 15.00
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 bg-white/20 rounded-full" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            Gedung KP Vokasi Veteran
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto mt-16 space-y-8">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari karya atau nama anggota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 bg-white/5 border border-white/10 rounded-xl py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-full md:w-[150px] bg-white/5 border border-white/10 text-white rounded-xl py-3 h-auto focus:ring-2 focus:ring-blue-500 focus:ring-offset-0">
                <SelectValue placeholder="Semua Sesi" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white">
                <SelectItem value="ALL" className="focus:bg-white/10 focus:text-white cursor-pointer">Semua Sesi</SelectItem>
                {sessions.map((s) => (
                  <SelectItem key={String(s)} value={String(s)} className="focus:bg-white/10 focus:text-white cursor-pointer">
                    Sesi {String(s)}
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <Link href={`/pameran-iot/${product.id}`} key={product.id} className="block">
              <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:border-white/20 hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20 flex items-center justify-center">
                    <Image
                      src={product.projectImageUrl || product.bannerImageUrl || "https://res.cloudinary.com/dz1irxeio/image/upload/v1740669299/assets/hmpsti/hmpsti_logo_wb_yvtt4t.png"}
                      alt={product.title}
                      fill
                      unoptimized={true}
                      className="object-contain hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                {/* Team Code Badge */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold px-2.5 py-1 rounded-lg text-white">
                  {product.code}
                </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Kelas {product.className} - Kelompok {product.groupNumber}
                </p>
              </div>

            </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
