"use client";

import Image from "next/image";
import { Instagram } from "@/components/social-icons";
import { cn } from "@/lib/utils";
import { organizationPlaceholderImage } from "@/constant/data";
import type { OrganizationMember } from "@/types/data";
import { motion, type Variants } from "framer-motion";

export const organizationItemVar: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export function BPHCard({
  item,
  className,
}: {
  item: OrganizationMember;
  className?: string;
}) {
  const isLeader = item.role === "leader" || item.role === "vice";

  return (
    <motion.a
      href={item.instagram}
      target="_blank"
      rel="noopener noreferrer"
      variants={organizationItemVar}
      className={cn(
        "group block relative w-full cursor-pointer will-change-transform",
        className,
      )}
    >
      <div
        className={cn(
          "relative rounded-2xl bg-[#0A0A0A] overflow-hidden border transition-all duration-500",
          isLeader
            ? "h-[400px] border-white/10 group-hover:border-[#33A5D3]/40"
            : "h-[320px] border-white/5 group-hover:border-[#33A5D3]/30",
        )}
      >
        <div className="absolute inset-0 pt-10 px-6 flex justify-center items-end bg-gradient-to-t from-black via-[#0A0A0A]/20 to-transparent z-10 transition-transform duration-700 group-hover:scale-105">
          <Image
            src={item.foto}
            alt={item.nama}
            width={500}
            height={500}
            className={cn(
              "w-auto object-contain filter contrast-110 grayscale-[15%] group-hover:grayscale-0 transition-all duration-500",
              isLeader ? "h-[320px]" : "h-[240px]",
            )}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono text-[#33A5D3] uppercase tracking-widest mb-1">
                {item.jabatan}
              </p>
              <h3
                className={cn(
                  "font-black text-white leading-tight",
                  isLeader
                    ? "text-2xl"
                    : "text-xl group-hover:text-[#33A5D3]/90 transition-colors",
                )}
              >
                {item.nama}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#33A5D3] group-hover:text-black transition-all">
              <Instagram
                size={14}
                className="text-white group-hover:text-black"
              />
            </div>
          </div>
          {isLeader && item.quote && (
            <div className="overflow-hidden">
              <p className="text-gray-400 text-xs italic mt-3 pr-8 leading-relaxed translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                "{item.quote}"
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.a>
  );
}

export function KompasLeaderCard({ item }: { item: OrganizationMember }) {
  return (
    <motion.a
      href={item.instagram}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="group block relative w-full cursor-pointer will-change-transform h-[450px]"
    >
      <div className="absolute inset-0 rounded-2xl bg-[#0A0A0A] overflow-hidden border border-white/10 group-hover:border-[#F59E0B]/40 transition-all duration-500">
        <div className="absolute inset-0 pt-10 flex justify-center items-end bg-gradient-to-t from-black via-[#0A0A0A]/50 to-transparent z-10 transition-transform duration-700 group-hover:scale-105">
          <Image
            src={item.foto}
            alt={item.nama}
            width={500}
            height={500}
            className="h-[380px] w-auto object-contain filter contrast-110 grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-8 z-20 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono text-[#F59E0B] uppercase tracking-widest mb-1.5">
                {item.jabatan}
              </p>
              <h3 className="font-black text-white text-3xl leading-tight">
                {item.nama}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#F59E0B] group-hover:text-black transition-all">
              <Instagram
                size={16}
                className="text-white group-hover:text-black"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

export function KompasMemberCard({
  nama,
  jabatan,
  instagram,
  foto,
}: Omit<OrganizationMember, "role" | "quote">) {
  return (
    <motion.a
      href={instagram}
      target="_blank"
      rel="noopener noreferrer"
      variants={organizationItemVar}
      className="group block relative w-full cursor-pointer will-change-transform h-[280px]"
    >
      <div className="absolute inset-0 rounded-2xl bg-[#080808] overflow-hidden border border-white/5 group-hover:border-[#F59E0B]/30 group-hover:bg-[#0A0A0A] transition-all duration-300">
        <div className="absolute inset-0 pt-8 flex justify-center items-end z-10 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
          <Image
            src={foto || organizationPlaceholderImage}
            alt={nama}
            width={500}
            height={500}
            className="h-[220px] w-auto object-contain filter contrast-110 grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
          <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#F59E0B] transition-colors">
            {nama}
          </h4>
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              {jabatan}
            </p>
            <Instagram
              size={12}
              className="text-gray-600 group-hover:text-[#F59E0B] transition-colors"
            />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
