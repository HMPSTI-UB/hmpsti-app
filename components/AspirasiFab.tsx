import { type ChangeEvent, type FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareText,
  X,
  Send,
  User,
  Hash,
  Tag,
  ChevronDown,
  Check,
} from "lucide-react";
import { aspirasiPhone, aspirasiTopics } from "@/constant/data";
import type { AspirasiTopic } from "@/types/data";

type AspirasiFormData = {
  nama: string;
  angkatan: string;
  topikLabel: string;
  topikValue: string;
  pesan: string;
};

export const AspirasiFab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState<AspirasiFormData>({
    nama: "",
    angkatan: "",
    topikLabel: aspirasiTopics[0].label, // Untuk tampilan UI
    topikValue: aspirasiTopics[0].value, // Untuk dikirim ke WA
    pesan: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle pilih topik
  const handleSelectTopic = (topic: AspirasiTopic) => {
    setFormData({
      ...formData,
      topikLabel: topic.label,
      topikValue: topic.value,
    });
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // --- FORMAT PESAN WA (VERSI BERSIH / CLEAN TEXT) ---
    // Menggunakan simbol '>' atau '-' pengganti emoji agar tidak error
    const text = `
Halo Advokesma HMPSTI, saya ingin menyampaikan aspirasi:

> *Nama:* ${formData.nama}
> *Angkatan:* ${formData.angkatan}
> *Topik:* ${formData.topikValue}

> *Isi Aspirasi:*
${formData.pesan}

Terima kasih.
    `.trim();

    // Buka WhatsApp ke Nomor Admin
    window.open(
      `https://wa.me/${aspirasiPhone}?text=${encodeURIComponent(text)}`,
      "_blank",
    );
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. TOMBOL MELAYANG (FAB) */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-[#33A5D3] to-[#2563EB] rounded-full shadow-[0_0_20px_rgba(51,165,211,0.5)] text-white hover:shadow-[0_0_30px_rgba(51,165,211,0.8)] transition-shadow group"
      >
        <MessageSquareText size={28} className="fill-white/20" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-sky-400">
          Suarakan Aspirasimu!
        </span>
      </motion.button>

      {/* 2. MODAL FORMULIR */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Content */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                <div>
                  <h3 className="text-xl font-black text-white">
                    Kotak Aspirasi
                  </h3>
                  <p className="text-xs text-gray-400">
                    Suaramu didengar, privasimu dijaga.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Input Nama & Angkatan */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        type="text"
                        name="nama"
                        required
                        placeholder="Nama Kamu"
                        value={formData.nama}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors placeholder:text-gray-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">
                      Angkatan
                    </label>
                    <div className="relative">
                      <Hash
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      {/* FIX: CSS Class di bawah ini menghilangkan panah spinner putih jelek */}
                      <input
                        type="number"
                        name="angkatan"
                        required
                        placeholder="24"
                        value={formData.angkatan}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors placeholder:text-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                {/* --- CUSTOM DROPDOWN --- */}
                <div className="space-y-2 relative">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">
                    Topik Bahasan
                  </label>

                  {/* Trigger Button */}
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`relative w-full bg-black/40 border rounded-xl py-3 pl-10 pr-4 text-sm text-white cursor-pointer flex items-center justify-between transition-colors ${isDropdownOpen ? "border-sky-500 ring-1 ring-sky-500" : "border-white/10 hover:border-white/30"}`}
                  >
                    <Tag size={16} className="absolute left-3 text-gray-500" />
                    <span className="truncate">{formData.topikLabel}</span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </div>

                  {/* Dropdown List */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        {aspirasiTopics.map((topic) => (
                          <div
                            key={topic.id}
                            onClick={() => handleSelectTopic(topic)}
                            className="px-4 py-3 text-sm text-gray-300 hover:bg-[#33A5D3] hover:text-white cursor-pointer transition-colors flex items-center justify-between group"
                          >
                            <span>{topic.label}</span>
                            {formData.topikLabel === topic.label && (
                              <Check
                                size={14}
                                className="text-sky-500 group-hover:text-white"
                              />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Textarea Pesan */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 ml-1">
                    Isi Aspirasi
                  </label>
                  <textarea
                    name="pesan"
                    required
                    rows={4}
                    placeholder="Tuliskan keluhan, kritik, atau saranmu di sini..."
                    value={formData.pesan}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors placeholder:text-gray-700 resize-none custom-scrollbar"
                  ></textarea>
                </div>

                {/* Tombol Kirim */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#33A5D3] hover:bg-[#2563EB] text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-sky-500/20"
                >
                  <Send size={18} />
                  KIRIM KE ADVOKESMA
                </button>

                {/* Disclaimer */}
                <p className="text-center text-[10px] text-gray-600 leading-tight">
                  *Dengan mengklik kirim, Anda akan diarahkan ke WhatsApp.
                  <br />
                  Nomor Anda akan terlihat oleh Admin sebagai pengirim.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CSS KHUSUS (SCROLLBAR GELAP & SPINNER HILANG) */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #0F0F0F; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #333; 
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555; 
        }
      `}</style>
    </>
  );
};
