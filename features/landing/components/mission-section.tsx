import { landingMissions } from "@/constant/data";

export function MissionSection() {
  return (
    <section className="relative z-10 py-24 border-t border-white/[0.04] bg-[#020202]">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-20 lg:px-32">
        <div className="mb-24">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#33A5D3] font-bold mb-4 block">
                Visi Kami
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none tracking-tighter">
                Rumah Besar
                <br />
                Kolaborasi.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <blockquote className="pl-6 border-l-2 border-[#33A5D3]">
                <p className="text-xl sm:text-2xl text-gray-300 font-light leading-relaxed italic">
                  "Mewujudkan HMPSTI sebagai Rumah Kolaborasi yang adaptif dan
                  inklusif demi melahirkan Inovasi unggul untuk mengantar
                  pencapaian Prestasi bersama."
                </p>
              </blockquote>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-16">
          <div className="mb-12">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/30 block mb-2">
              Pilar Gerak
            </span>
            <h3 className="text-3xl font-black text-white tracking-tight">
              Lima Misi Strategis
            </h3>
          </div>

          <div className="space-y-1">
            {landingMissions.map((mission) => (
              <div
                key={mission.n}
                className="group grid grid-cols-12 gap-4 items-baseline py-8 border-b border-white/5 hover:bg-white/[0.01] transition-colors duration-300 px-4 -mx-4 rounded-xl"
              >
                <div className="col-span-2 sm:col-span-1">
                  <span className="font-mono text-sm font-bold text-gray-500 group-hover:text-white transition-colors">
                    {mission.n}
                  </span>
                </div>
                <div className="col-span-10 sm:col-span-4 md:col-span-3 flex items-center gap-3">
                  <mission.icon
                    size={16}
                    className="text-gray-500 group-hover:text-[#33A5D3] transition-colors"
                  />
                  <h4 className="text-white font-black text-lg group-hover:text-white transition-colors">
                    {mission.title}
                  </h4>
                </div>
                <div className="col-span-12 sm:col-span-7 md:col-span-8 sm:pl-6 mt-2 sm:mt-0">
                  <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
                    {mission.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
