"use client";

import { CldImage as Image } from "next-cloudinary";
import { Instagram } from "@/components/social-icons";
import { cn, getDepartmentThemeColors } from "@/lib/utils";
import type { Department } from "@/types/data";
import { motion } from "framer-motion";
import { ArrowUpRight, User } from "lucide-react";

export function DepartmentCard({
  data,
  index,
  onClick,
}: {
  data: Department;
  index: number;
  onClick: () => void;
}) {
  const tc = getDepartmentThemeColors(data.theme);

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={cn(
        "group relative h-[420px] w-full rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer",
        tc.accentBorderHover,
        tc.accentShadow,
      )}
    >
      <div
        className="absolute -right-20 -top-20 w-64 h-64 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: tc.accentGlow }}
      />

      <div className="relative z-10">
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center p-2.5 bg-white/5 border border-white/10 mb-5 transition-all duration-500 group-hover:scale-110 group-hover:bg-black/50 backdrop-blur-sm",
            tc.accent,
          )}
        >
          <Image
            src={data.logo}
            alt={`${data.nama} logo`}
            width={500}
            height={500}
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
          {data.nama}
        </h3>
        <p
          className={cn(
            "text-[10px] font-mono font-bold tracking-widest uppercase mb-3 opacity-70 group-hover:opacity-100 transition-opacity",
            tc.accent,
          )}
        >
          {data.panjang}
        </p>
        <p className="text-gray-400 text-sm leading-relaxed max-w-[90%] line-clamp-2 group-hover:text-gray-200 transition-colors">
          {data.desc}
        </p>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-4">
        <div className="flex items-center">
          <div className="flex -space-x-3">
            {data.leaders.slice(0, 3).map((leader, idx) => (
              <div
                key={`${data.id}-${leader.nama}`}
                className={cn(
                  "w-10 h-10 rounded-full border-2 border-[#0A0A0A] overflow-hidden bg-white/5 transition-transform duration-300 group-hover:translate-x-0",
                  idx === 1 && "group-hover:-translate-x-0.5",
                  idx === 2 && "group-hover:-translate-x-1",
                )}
                style={{ zIndex: 10 - idx }}
              >
                {leader.foto ? (
                  <Image
                    src={leader.foto}
                    alt={leader.nama}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden",
                      );
                    }}
                  />
                ) : null}
                <div
                  className={cn(
                    "w-full h-full flex items-center justify-center text-white/30 bg-white/5",
                    leader.foto ? "hidden" : "",
                  )}
                >
                  <User size={16} />
                </div>
              </div>
            ))}
          </div>
          <span className="ml-3 text-[10px] font-mono text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">
            {data.leaders.length} Leaders
          </span>
        </div>

        <div className="text-white/20 transition-all duration-500 group-hover:text-white group-hover:rotate-[-45deg] group-hover:scale-125">
          <ArrowUpRight size={28} />
        </div>
      </div>
    </motion.div>
  );
}

export function BigLeaderCard({
  leader,
  theme,
  index,
}: {
  leader: Department["leaders"][number];
  theme: Department["theme"];
  index: number;
}) {
  const tc = getDepartmentThemeColors(theme);
  const isKetua =
    leader.jabatan.toLowerCase().includes("ketua departemen") ||
    leader.jabatan.toLowerCase().includes("kepala departemen");

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.1 }}
      className={cn(
        "group relative flex flex-col items-center text-center p-6 rounded-3xl border transition-all duration-500 bg-white/[0.02] border-white/5",
        tc.accentBorderHover,
        tc.accentShadow,
        isKetua && tc.accentBorder,
        isKetua && "bg-white/[0.04]",
      )}
    >
      <div
        className={cn(
          "relative mb-5 rounded-2xl overflow-hidden border-2 transition-all duration-500",
          isKetua ? "w-28 h-28 sm:w-32 sm:h-32" : "w-24 h-24 sm:w-28 sm:h-28",
          "border-white/10 group-hover:border-white/30",
          tc.isAmber
            ? "group-hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)]"
            : "group-hover:shadow-[0_0_25px_-5px_rgba(14,165,233,0.4)]",
        )}
      >
        {leader.foto ? (
          <Image
            src={leader.foto}
            alt={leader.nama}
            width={500}
            height={500}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div
          className={cn(
            "w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02]",
            leader.foto ? "hidden" : "",
          )}
        >
          <User size={40} className="text-white/15" />
        </div>
        {isKetua && (
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 py-1 text-center text-[9px] font-black uppercase tracking-widest",
              tc.accentBg,
              "text-black",
            )}
          >
            Ketua
          </div>
        )}
      </div>

      <h4
        className={cn(
          "font-bold text-white leading-tight mb-1 transition-colors",
          isKetua ? "text-lg" : "text-base",
          tc.isAmber
            ? "group-hover:text-amber-400"
            : "group-hover:text-sky-400",
        )}
      >
        {leader.nama}
      </h4>
      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">
        {leader.jabatan}
      </p>

      {leader.ig && (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 bg-white/5 border border-white/5",
            tc.isAmber
              ? "text-amber-400/70 group-hover:bg-amber-500/10 group-hover:border-amber-500/20 group-hover:text-amber-400"
              : "text-sky-400/70 group-hover:bg-sky-500/10 group-hover:border-sky-500/20 group-hover:text-sky-400",
          )}
        >
          <Instagram size={12} />
          <span>@{leader.ig.replace("@", "")}</span>
        </div>
      )}
    </motion.div>
  );

  if (!leader.ig) return cardContent;

  return (
    <a
      href={`https://instagram.com/${leader.ig.replace("@", "")}`}
      target="_blank"
      rel="noreferrer"
      className="block"
    >
      {cardContent}
    </a>
  );
}
