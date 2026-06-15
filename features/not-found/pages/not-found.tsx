"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/Header";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname,
    );
  }, [pathname]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-7xl md:text-8xl font-black mb-4 text-primary">
            404
          </h1>
          <p className="text-2xl font-bold mb-4 text-white">
            Oops! Halaman tidak ditemukan
          </p>
          <p className="text-white/70 mb-8">
            Sepertinya halaman yang Anda cari tidak ada. Kembali ke beranda
            untuk melanjutkan.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-4 bg-primary text-black font-bold rounded-full hover:bg-yellow-400 transition transform hover:scale-105"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
