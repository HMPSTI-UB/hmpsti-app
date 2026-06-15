"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function LandingCtaSection() {
  return (
    <section className="relative z-10 py-32 px-6 sm:px-12 md:px-20 lg:px-32 border-t border-white/[0.04]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#33A5D3] mb-6">Directory</span>
          <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-none">Di Balik Layar Innovara.</h3>
          <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed mb-10">Temukan profil lengkap Badan Pengurus Harian (BPH) dan struktur pelaksana organisasi kabinet.</p>

          <Link href="/struktur" className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-[#33A5D3] hover:text-white rounded-full font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300">
            Struktur Organisasi
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
