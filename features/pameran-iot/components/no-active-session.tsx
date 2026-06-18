"use client";

import { CalendarClock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NoActiveSession() {
  return (
    <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 max-w-lg w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
          <CalendarClock className="w-12 h-12 text-blue-400" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Sesi Voting <span className="text-blue-400">Tutup</span>
        </h2>
        
        <p className="text-gray-400 text-lg mb-8">
          Mohon maaf, saat ini sedang tidak ada sesi voting yang aktif. Silakan tunggu informasi lebih lanjut dari panitia pameran.
        </p>

        <div className="flex items-center gap-3 bg-yellow-500/10 text-yellow-500 text-sm font-medium px-4 py-3 rounded-xl border border-yellow-500/20 mb-8 w-full text-left">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>Jika Anda merasa ini adalah kesalahan, pastikan Anda telah me-refresh halaman.</p>
        </div>

        <Link href="/pameran-iot" passHref>
          <Button className="bg-white text-black hover:bg-gray-200 font-bold px-6 py-2 h-11 rounded-xl">
            Kembali ke Pameran
          </Button>
        </Link>
      </div>
    </div>
  );
}
