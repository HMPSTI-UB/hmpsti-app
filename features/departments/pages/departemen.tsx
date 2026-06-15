"use client";

import { DepartmentCard } from "../components/department-card";
import { DepartmentModal } from "../components/department-modal";
import { DEPARTMENT_NOISE_TEXTURE, departments } from "@/constant/data";
import type { Department } from "@/types/data";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function Departemen() {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-sky-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04] brightness-100 contrast-150 mix-blend-overlay"
          style={{ backgroundImage: DEPARTMENT_NOISE_TEXTURE }}
        />
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-sky-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-amber-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow delay-1000" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-[1px] w-8 md:w-12 bg-sky-500/50" />
              <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-sky-400 font-bold">
                Our Divisions
              </span>
              <div className="h-[1px] w-8 md:w-12 bg-amber-500/50" />
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
              Depar
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-white to-amber-500">
                temen
              </span>
            </h1>

            <p className="mt-6 text-gray-400 text-sm md:text-xl max-w-3xl mx-auto leading-relaxed px-4">
              Kenali lebih dekat bidang gerak dan fokus setiap Departemen{" "}
              <span className="text-white font-bold inline-block">
                HMPSTI UB
              </span>
              .
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {departments.map((dept, idx) => (
            <DepartmentCard
              key={dept.id}
              data={dept}
              index={idx}
              onClick={() => setSelectedDept(dept)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedDept && (
          <DepartmentModal
            department={selectedDept}
            onClose={() => setSelectedDept(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
