import { Users, Vote, Calendar, Clock, ArrowRight, Star, LayoutDashboard, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/features/pameran-iot/actions/dashboard-actions";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-gray-400 text-sm mt-1">Status sistem voting Pameran IoT saat ini</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          A
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Total Tim IoT</h3>
              <p className="text-4xl font-bold mt-2 text-white">{stats.totalTeams}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <Link href="/dashboard/iot-teams" className="inline-flex items-center text-xs text-blue-400 mt-4 hover:underline">
            Kelola tim <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Total Vote Masuk</h3>
              <p className="text-4xl font-bold mt-2 text-white">{stats.totalVotes.toLocaleString('id-ID')}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
              <Vote className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <Link href="/dashboard/vote-monitor" className="inline-flex items-center text-xs text-green-400 mt-4 hover:underline">
            Lihat perolehan <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Sesi Aktif</h3>
              <div className="mt-2 flex flex-col">
                {stats.activeSession ? (
                  <>
                    <p className="text-xl font-bold text-white line-clamp-1">{stats.activeSession.name}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-green-400">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      Sedang Berjalan
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-bold text-gray-500">Tidak Ada</p>
                    <p className="text-xs text-gray-400 mt-1">Menunggu jadwal berikutnya</p>
                  </>
                )}
              </div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
              <Calendar className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <Link href="/dashboard/vote-sessions" className="inline-flex items-center text-xs text-purple-400 mt-4 hover:underline">
            Atur jadwal <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl opacity-75 grayscale hover:grayscale-0 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Total Produk</h3>
              <div className="mt-2 flex flex-col">
                <p className="text-xl font-bold text-gray-500 italic">Coming Soon</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-orange-400">
                  Fitur Merch
                </div>
              </div>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
              <ShoppingBag className="h-6 w-6 text-orange-400" />
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-orange-500/10 text-orange-400 border-orange-500/20">
              Future
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-white">Vote Terbaru</h3>
            <Link href="/dashboard/vote-monitor">
              <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
                Lihat Semua
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentVotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 italic text-sm">
                Belum ada aktivitas vote masuk.
              </div>
            ) : (
              stats.recentVotes.map((vote) => (
                <div key={vote.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-lg px-2 transition-colors group">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                    <Star className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      <span className="text-blue-400 font-semibold">{vote.voterName || "Anonim"}</span> memberikan suara
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      Tim: <span className="text-gray-300">[{vote.teamCode}] {vote.teamTitle}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-500 font-mono">
                      {format(vote.votedAt, "HH:mm:ss", { locale: id })}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {format(vote.votedAt, "dd MMM", { locale: id })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Status / Quick Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-lg font-medium text-white mb-2">Live Monitor</h3>
                <p className="text-gray-300 text-sm mb-6">
                  Pantau perolehan suara secara real-time dan ekspor data laporan hasil voting tim IoT.
                </p>
                <Link href="/dashboard/vote-monitor">
                  <Button className="bg-white text-black hover:bg-gray-200 transition-colors">
                    Buka Monitoring
                  </Button>
                </Link>
             </div>
             {/* Decorative element */}
             <div className="absolute -right-8 -bottom-8 opacity-10">
                <LayoutDashboard className="h-40 w-40 text-white" />
             </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Informasi Sesi
            </h3>
            {stats.activeSession ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Dimulai</span>
                  <span className="text-white font-medium">{format(stats.activeSession.startTime, "HH:mm", { locale: id })} WIB</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Berakhir</span>
                  <span className="text-white font-medium">{format(stats.activeSession.endTime, "HH:mm", { locale: id })} WIB</span>
                </div>
                <div className="pt-2">
                  <Badge className="w-full justify-center bg-green-500/20 text-green-400 border-green-500/30">
                    Sesi Sedang Aktif
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm italic">Tidak ada sesi yang berjalan saat ini.</p>
                <Link href="/dashboard/vote-sessions">
                  <Button variant="link" className="text-xs text-blue-400 h-auto p-0 mt-2">
                    Mulai Sesi Sekarang
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
