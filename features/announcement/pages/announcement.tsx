"use client";

import {
  announcementColors,
  announcementData,
  announcementLinks,
  failedAnnouncementNames,
} from "@/constant/data";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type ResultStatus = "LOLOS" | "TIDAK_LOLOS" | "NOT_FOUND";
type MatchedUser = { name: string; divisi?: string };

export default function Announcement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resultStatus, setResultStatus] = useState<ResultStatus | null>(null);
  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = () => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    setTimeout(() => {
      const formattedSearch = searchTerm.toLowerCase().trim();
      const foundLolos = announcementData.find(
        (item) => item.name.toLowerCase().trim() === formattedSearch,
      );

      if (foundLolos) {
        setMatchedUser(foundLolos);
        setResultStatus("LOLOS");
        setLoading(false);
        return;
      }

      const foundGagal = failedAnnouncementNames.find(
        (name) => name.toLowerCase().trim() === formattedSearch,
      );
      setMatchedUser(foundGagal ? { name: foundGagal } : null);
      setResultStatus(foundGagal ? "TIDAK_LOLOS" : "NOT_FOUND");
      setLoading(false);
    }, 1000);
  };

  const closePopup = () => {
    setResultStatus(null);
    setMatchedUser(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden">
      <div className="pt-32 sm:pt-40 pb-20 px-6 max-w-4xl mx-auto text-center relative z-10">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight mb-6"
        >
          PENGUMUMAN KELULUSAN
          <br />
          <span
            style={{
              backgroundImage: `linear-gradient(to right, ${announcementColors.gulfBlue}, white, ${announcementColors.gulfOrange})`,
            }}
            className="text-transparent bg-clip-text text-2xl sm:text-4xl md:text-5xl"
          >
            STAFF AHLI HMPSTI 2026
          </span>
        </motion.h1>

        <p className="text-gray-400 mb-10 text-base sm:text-lg">
          Silakan masukkan nama lengkap Anda untuk melihat hasil seleksi.
        </p>

        <div className="max-w-xl mx-auto space-y-6">
          <input
            type="text"
            placeholder="Ketik Nama Lengkap di sini..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            className="w-full px-6 sm:px-8 py-4 sm:py-5 rounded-2xl bg-white/5 border-2 border-white/10 text-white text-center text-lg sm:text-xl font-medium focus:border-[#9FD1ED] focus:bg-[#0F0F0F] outline-none transition-all placeholder:text-gray-500"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheck}
            style={{ backgroundColor: announcementColors.gulfBlue }}
            className="w-full py-4 rounded-2xl text-white font-black text-lg tracking-widest shadow-lg shadow-blue-500/20 transition-all"
          >
            {loading ? "MEMPROSES..." : "CEK HASIL SELEKSI"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {resultStatus === "LOLOS" && matchedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-[#050505]/95 backdrop-blur-xl z-[999] px-4 py-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                backgroundColor: announcementColors.gulfDarkBg,
                borderColor: announcementColors.gulfBlue,
              }}
              className="p-6 sm:p-8 md:p-12 rounded-[30px] sm:rounded-[40px] border-[3px] text-center max-w-[550px] w-full max-h-[95vh] overflow-y-auto overflow-x-hidden shadow-2xl shadow-blue-500/10 relative"
            >
              <div
                style={{ backgroundColor: announcementColors.gulfBlue }}
                className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[120px] opacity-20 pointer-events-none"
              />
              <div className="mb-6 sm:mb-8 relative z-10">
                <h2
                  style={{ color: announcementColors.gulfBlue }}
                  className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter mb-2"
                >
                  CONGRATS!
                </h2>
                <div
                  style={{ backgroundColor: announcementColors.gulfBlue }}
                  className="h-1.5 w-20 sm:w-24 mx-auto rounded-full"
                />
              </div>
              <p className="text-gray-300 text-lg sm:text-xl leading-relaxed mb-8 sm:mb-10 relative z-10">
                Selamat{" "}
                <span className="font-bold text-white text-xl sm:text-2xl md:text-3xl block my-3">
                  {matchedUser.name}
                </span>
                Anda dinyatakan{" "}
                <span
                  className="font-black italic text-xl sm:text-2xl"
                  style={{ color: announcementColors.gulfBlue }}
                >
                  LOLOS.
                </span>
              </p>
              <div
                style={{
                  backgroundColor: `${announcementColors.gulfOrange}15`,
                  borderColor: `${announcementColors.gulfOrange}50`,
                }}
                className="border-l-4 rounded-r-xl p-4 sm:p-5 mb-8 text-left relative z-10"
              >
                <p
                  style={{ color: announcementColors.gulfOrange }}
                  className="font-bold text-sm sm:text-base mb-1 sm:mb-2 flex items-center gap-2"
                >
                  INSTRUKSI WAJIB:
                </p>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                  Grup WhatsApp saat ini bersifat privat. Hubungi admin terlebih
                  dahulu untuk verifikasi identitas sebelum bergabung ke grup
                  resmi.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:gap-4 font-bold relative z-10">
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  href={announcementLinks.group}
                  target="_blank"
                  rel="noreferrer"
                  style={{ backgroundColor: announcementColors.gulfBlue }}
                  className="w-full py-4 rounded-2xl text-[#050505] flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  JOIN GRUP
                </motion.a>
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  href={announcementLinks.admin}
                  target="_blank"
                  rel="noreferrer"
                  style={{ backgroundColor: announcementColors.gulfOrange }}
                  className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  CHAT ADMIN
                </motion.a>
              </div>
              <button
                onClick={closePopup}
                className="mt-6 sm:mt-10 text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold py-2 px-4 relative z-10"
              >
                [ Tutup Pengumuman ]
              </button>
            </motion.div>
          </motion.div>
        )}

        {resultStatus === "TIDAK_LOLOS" && matchedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-[#050505]/95 backdrop-blur-xl z-[999] px-4 py-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                backgroundColor: announcementColors.gulfDarkBg,
                borderColor: announcementColors.redError,
              }}
              className="p-6 sm:p-8 md:p-12 rounded-[30px] sm:rounded-[40px] border-[3px] text-center max-w-[500px] w-full max-h-[95vh] overflow-y-auto overflow-x-hidden shadow-2xl shadow-red-900/20 relative"
            >
              <h2
                style={{ color: announcementColors.redError }}
                className="text-3xl sm:text-4xl md:text-5xl font-black italic mb-4 sm:mb-6 relative z-10"
              >
                TETAP SEMANGAT!
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 relative z-10">
                Halo,{" "}
                <span className="font-bold text-white">{matchedUser.name}</span>
                . Terima kasih atas partisipasimu.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left relative z-10">
                <p className="text-gray-200 text-sm sm:text-base leading-relaxed text-center">
                  Mohon maaf, saat ini kamu <b>belum berhasil lolos</b> sebagai
                  Staff Ahli HMPSTI 2026. Jadikan ini pengalaman untuk terus
                  berkembang!
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closePopup}
                style={{ backgroundColor: announcementColors.redError }}
                className="px-8 sm:px-10 py-3 rounded-full font-bold text-white text-sm sm:text-lg transition-all uppercase tracking-wider relative z-10 shadow-lg"
              >
                Tutup Papan
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {resultStatus === "NOT_FOUND" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-[#050505]/95 backdrop-blur-xl z-[999] px-4 py-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                backgroundColor: announcementColors.gulfDarkBg,
                borderColor: announcementColors.redError,
              }}
              className="p-6 sm:p-8 md:p-12 rounded-[30px] sm:rounded-[40px] border-[3px] text-center max-w-[500px] w-full max-h-[95vh] overflow-y-auto overflow-x-hidden shadow-2xl shadow-red-900/20 relative"
            >
              <h2
                style={{ color: announcementColors.redError }}
                className="text-3xl sm:text-4xl md:text-5xl font-black italic mb-4 sm:mb-6 relative z-10"
              >
                MOHON MAAF.
              </h2>
              <p className="text-white text-lg sm:text-xl md:text-2xl font-bold leading-relaxed mb-6 sm:mb-8 relative z-10">
                "Maaf, nama kamu tidak terdaftar."
              </p>
              <p className="text-gray-400 text-sm sm:text-base mb-8 sm:mb-10 leading-relaxed relative z-10">
                Pastikan penulisan nama sudah benar sesuai data pendaftaran.
              </p>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: `${announcementColors.redError}20`,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={closePopup}
                style={{
                  borderColor: announcementColors.redError,
                  color: announcementColors.redError,
                }}
                className="px-8 sm:px-10 py-3 rounded-full border-2 font-bold text-sm sm:text-lg transition-all uppercase tracking-wider relative z-10"
              >
                Coba Cari Lagi
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
