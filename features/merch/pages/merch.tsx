"use client";

// src/pages/Merch.tsx
import { motion } from "framer-motion";
import { Instagram } from "@/components/social-icons";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { DEPARTMENT_NOISE_TEXTURE, merchInstagramUrl } from "@/constant/data";

// --- ANIMATION HELPER ---
const FadeIn = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default function Merch() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden flex flex-col items-center justify-center px-6">
      {/* --- BACKGROUND FX --- */}
      {/* Blob Biru (Kiri Atas) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#33A5D3]/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-60"></div>
      {/* Blob Oranye (Kanan Bawah) */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#F59E0B]/15 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-60"></div>
      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: DEPARTMENT_NOISE_TEXTURE }}
      ></div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* ICON & BADGE */}
        <FadeIn delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <ShoppingBag size={16} className="text-[#33A5D3]" />
            <span className="text-xs font-mono uppercase tracking-widest text-gray-300">
              HMPSTI Store
            </span>
          </div>
        </FadeIn>

        {/* MAIN TITLE */}
        <FadeIn delay={0.3}>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none mb-6">
            COMING
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33A5D3] via-white to-[#F59E0B]">
              SOON
            </span>
          </h1>
        </FadeIn>

        {/* DESCRIPTION */}
        <FadeIn delay={0.5}>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-12">
            Siapkan dirimu untuk koleksi merchandise eksklusif{" "}
            <span className="text-white font-bold">Kabinet Innovara</span>.
            Tampil kece, bangga jadi anak TI.
          </p>
        </FadeIn>

        {/* CTA BUTTONS */}
        <FadeIn delay={0.7}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Tombol ke Instagram */}
            <a
              href={merchInstagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 bg-[#33A5D3] rounded-full text-black font-bold uppercase tracking-widest overflow-hidden hover:scale-105 transition-transform"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center gap-2">
                <Instagram size={18} />
                Pantau Instagram
              </span>
            </a>

            {/* Tombol Kembali */}
            <Link
              href="/"
              className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 text-gray-300 font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </FadeIn>
      </div>

      {/* DECORATION LINES */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#33A5D3]/50 to-transparent"></div>
    </div>
  );
}
