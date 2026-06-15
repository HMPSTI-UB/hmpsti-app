"use client";

import { motion } from "framer-motion";

export function AboutSection() {
  return (
    <section id="tentang" className="relative z-10 py-24 px-6 sm:px-12 md:px-20 lg:px-32 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-mono text-xs uppercase tracking-[0.3em] text-[#33A5D3] font-bold mb-6">
            Jargon Kebanggaan
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6.5xl font-black text-white leading-[0.95] tracking-tighter uppercase"
          >
            Satu Hati,
            <br />
            Satu Gerak,
            <br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1.5px #33A5D3" }}>
              TI JAYA.
            </span>
          </motion.h2>
          <div className="mt-8 h-px bg-white/10 w-24" />
        </div>

        <div className="lg:col-span-7 space-y-8">
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-400 text-lg md:text-xl leading-relaxed font-light">
            Nama <strong className="text-white font-bold">INNOVARA</strong> berasal dari gabungan kata <em>Innova</em> yang berarti inovasi dan <em>Ra</em> yang berarti era atau zaman. Kami mendefinisikan kabinet ini bukan sebagai struktur hierarki yang kaku, melainkan ruang kolektif yang dinamis untuk bertukar ide secara terbuka.
          </motion.p>

          <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t border-white/5">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-white font-bold mb-3 block">01 / INNOVA (Inovasi)</span>
              <p className="text-xs text-gray-500 leading-relaxed">Semangat untuk melahirkan terobosan, gagasan, serta metode baru yang solutif bagi seluruh kebutuhan pelayanan mahasiswa.</p>
            </div>
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#33A5D3] font-bold mb-3 block">02 / RA (Era / Zaman)</span>
              <p className="text-xs text-gray-500 leading-relaxed">Menandakan dimulainya era atau zaman baru kepengurusan yang terbuka, adaptif, dan inklusif bagi seluruh mahasiswa Teknologi Informasi.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
