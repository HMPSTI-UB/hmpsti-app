"use client";

import { motion } from "framer-motion";
import { landingStats } from "@/constant/data";

export function StatsSection() {
  return (
    <section className="relative z-10 py-16 px-6 sm:px-12 md:px-20 lg:px-32 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 md:gap-x-12 border-b border-white/5 pb-16">
        {landingStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className="flex flex-col"
          >
            <h3 className="text-4xl sm:text-5xl font-black text-white mb-2 font-mono">
              {stat.num}
            </h3>
            <div className="w-6 h-[2px] bg-[#33A5D3] mb-3" />
            <span className="font-mono text-xs uppercase tracking-wider text-gray-200 font-bold mb-1">
              {stat.label}
            </span>
            <p className="text-xs text-gray-500 leading-relaxed">{stat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
