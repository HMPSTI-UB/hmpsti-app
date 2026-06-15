"use client";

import Image from "next/image";
import { cn, getDepartmentThemeColors } from "@/lib/utils";
import type { Department } from "@/types/data";
import { motion } from "framer-motion";
import { CheckCircle2, Quote, X } from "lucide-react";
import { BigLeaderCard } from "./department-card";

export function DepartmentModal({
  department,
  onClose,
}: {
  department: Department;
  onClose: () => void;
}) {
  const tc = getDepartmentThemeColors(department.theme);

  return (
    <div className="fixed inset-0 z-[200] flex items-start sm:items-center justify-center px-4 py-6 sm:py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl my-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-50 p-2 bg-black/60 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors border border-white/10 group"
        >
          <X
            size={18}
            className="text-white group-hover:rotate-90 transition-transform"
          />
        </button>

        <div
          className={cn(
            "relative p-8 sm:p-10 pb-8 overflow-hidden",
            `bg-gradient-to-br ${tc.gradientFrom} to-[#0A0A0A]`,
          )}
        >
          <div
            className="absolute -top-20 -right-20 w-60 h-60 blur-[80px] rounded-full opacity-30 pointer-events-none"
            style={{ background: tc.accentGlow }}
          />
          <div className="relative z-10 flex items-start gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center p-3 bg-white/5 border border-white/10 backdrop-blur-md shrink-0">
              <Image
                src={department.logo}
                alt={department.nama}
                width={500}
                height={500}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-none text-white mb-1">
                {department.nama}
              </h2>
              <p
                className={cn(
                  "text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase mb-3",
                  tc.accent,
                )}
              >
                {department.panjang}
              </p>
              <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                {department.desc}
              </p>
            </div>
          </div>
          <div className="relative z-10 mt-6 flex items-center gap-3">
            <Quote size={14} className={cn("shrink-0 rotate-180", tc.accent)} />
            <span
              className={cn(
                "text-xs font-bold italic tracking-wide",
                tc.accent,
              )}
            >
              {department.motto}
            </span>
          </div>
        </div>

        <div className="p-8 sm:p-10 pt-6">
          <div className="flex items-center gap-3 mb-6">
            <span className={cn("w-1 h-6 rounded-full", tc.accentBg)} />
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">
              Board of Leaders
            </h3>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div
            className={cn(
              "grid gap-4",
              department.leaders.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-3",
            )}
          >
            {department.leaders.map((leader, idx) => (
              <BigLeaderCard
                key={leader.nama}
                leader={leader}
                theme={department.theme}
                index={idx}
              />
            ))}
          </div>
        </div>

        <div className="px-8 sm:px-10 pb-8 sm:pb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className={cn("w-1 h-6 rounded-full", tc.accentBg)} />
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">
              Focus & Program
            </h3>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="flex flex-wrap gap-2">
            {department.focus.map((item, idx) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10"
              >
                <CheckCircle2 size={14} className={cn(tc.accent, "shrink-0")} />
                <span className="text-sm font-medium text-gray-300">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
