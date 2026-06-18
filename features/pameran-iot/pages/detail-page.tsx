import Link from "next/link";
import { ArrowLeft, Users, Hash, Monitor, MapPin } from "lucide-react";
import { ImageGallery } from "@/features/pameran-iot/components/image-gallery";

interface DetailPageProps {
  team: {
    id: number;
    code: string;
    className: string;
    groupNumber: number;
    title: string;
    teamMembers: string;
    bannerImageUrl: string | null;
    projectImageUrl: string | null;
    sessionId: number;
  };
}

export default function DetailPage({ team }: DetailPageProps) {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back Button */}
        <Link 
          href="/pameran-iot" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Pameran
        </Link>

        {/* Interactive Image Gallery */}
        <ImageGallery 
          projectImageUrl={team.projectImageUrl} 
          bannerImageUrl={team.bannerImageUrl} 
          title={team.title} 
        />

        {/* Header Section */}
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Monitor className="w-48 h-48" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              Tim {team.code}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {team.title}
            </h1>
            
            <div className="flex flex-wrap gap-3 pt-2 text-sm text-gray-300">
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                <Hash className="w-4 h-4 text-blue-400" />
                <span>Kelas {team.className}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Kelompok {team.groupNumber}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Sesi {team.sessionId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Anggota Tim
          </h2>
          <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-gray-300 leading-relaxed whitespace-pre-wrap">
            {team.teamMembers}
          </div>
        </div>

      </div>
    </div>
  );
}
