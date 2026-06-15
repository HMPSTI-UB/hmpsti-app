"use client";

import {
  BPHCard,
  KompasLeaderCard,
  KompasMemberCard,
} from "../components/organization-cards";
import { bphInti, dataKompas } from "@/constant/data";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const containerVar: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function Struktur() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#33A5D3]/30 overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#33A5D3]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#F59E0B]/5 blur-[150px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 pt-32 pb-10 px-6 max-w-7xl mx-auto w-full">
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-[#33A5D3] font-medium mb-4 block">
              Organization Chart
            </span>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white leading-[0.85] mb-6">
              STRUK<span className="text-[#33A5D3]">TUR</span>
            </h1>
            <p className="text-gray-400 max-w-lg text-base md:text-lg leading-relaxed">
              Susunan punggawa{" "}
              <strong className="text-white font-semibold">INNOVARA</strong>{" "}
              yang menjadi otak dan penggerak di balik setiap inovasi HMPSTI UB
              Periode 2026/2027.
            </p>
          </motion.div>
        </div>

        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-white mb-3">
              Badan Pengurus Inti
            </h2>
            <div className="w-12 h-1 bg-[#33A5D3] rounded-full" />
          </motion.div>

          <motion.div
            variants={containerVar}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="md:col-span-1">
              <BPHCard item={bphInti[0]} />
            </div>
            <div className="md:col-span-1">
              <BPHCard item={bphInti[1]} />
            </div>
            <div className="md:col-span-2 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {bphInti.slice(2).map((item) => (
                  <BPHCard key={item.nama} item={item} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative pt-24 border-t border-white/[0.04]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-widest text-white mb-2">
              KOMPAS
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Komisi Pengawas dan Standarisasi
            </p>
            <div className="w-12 h-1 bg-[#F59E0B] rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <KompasLeaderCard item={dataKompas.ketua} />
            </div>
            <motion.div
              variants={containerVar}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {dataKompas.anggota.map((item) => (
                <KompasMemberCard key={item.nama} {...item} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <section className="relative z-10 py-24 px-6 border-t border-white/[0.04] bg-[#030303] mt-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <p className="text-gray-500 text-sm md:text-base mb-3">
              Penasaran dengan bidang gerak kami?
            </p>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-10 leading-tight">
              Cek Divisi <span className="text-[#F59E0B]">HMPSTI.</span>
            </h3>
            <Link
              href="/departemen"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-[#050505] rounded-full font-bold text-sm uppercase tracking-wider hover:bg-[#F59E0B] hover:text-white transition-all duration-300"
            >
              Explore Departemen
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
