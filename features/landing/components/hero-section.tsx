"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 90, damping: 14 },
  },
};

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-32 overflow-hidden border-b border-white/[0.04]">
      <div className="absolute top-0 right-[-10%] w-[60vw] h-[60vw] bg-sky-500/[0.03] blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl w-full mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-[#33A5D3] font-bold">
            Himpunan Mahasiswa Teknologi Informasi
          </span>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h1 className="font-black tracking-tighter leading-[0.85] text-left text-[14vw] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] uppercase select-none">
            INNO
            <br />
            <span className="text-transparent" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.8)" }}>
              VARA
            </span>
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-8 mt-12 items-end">
          <motion.div variants={itemVariants} className="md:col-span-6 lg:col-span-5">
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              Platform gerakan progresif mahasiswa Teknologi Informasi Universitas Brawijaya. Kami percaya inovasi lahir dari kolaborasi yang transparan, setara, dan tak terbatas.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-6 lg:col-span-5 lg:col-start-8 flex flex-wrap gap-4 justify-start md:justify-end">
            <Link
              href="/departemen"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-[#33A5D3] hover:text-white rounded-full font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300"
            >
              Jelajahi Divisi
              <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
            </Link>

            <a
              href="#tentang"
              className="px-8 py-4 bg-transparent hover:bg-white/5 text-white rounded-full font-mono text-xs font-bold uppercase tracking-widest border border-white/10 transition-all duration-300"
            >
              Tentang Kabinet
            </a>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 right-8 sm:right-12 md:right-20 lg:right-32 flex items-center gap-3 select-none">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Scroll down</span>
        <ChevronDown size={14} className="text-white/30 animate-bounce" />
      </div>
    </section>
  );
}
