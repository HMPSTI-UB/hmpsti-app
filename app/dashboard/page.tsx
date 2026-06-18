import { Users, LayoutDashboard, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/features/auth/actions/logout";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white/5 border-r border-white/10 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">HMPSTI<span className="text-blue-500">.</span></h1>
          <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-blue-600/10 text-blue-500 rounded-lg transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Overview</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Users className="h-5 w-5" />
            <span className="font-medium">Pengguna</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Pengaturan</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Overview</h2>
            <p className="text-gray-400 text-sm mt-1">Selamat datang kembali, Admin!</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
            A
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
            <h3 className="text-gray-400 text-sm font-medium">Total Pengguna</h3>
            <p className="text-3xl font-bold mt-2">1,234</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
            <h3 className="text-gray-400 text-sm font-medium">Pengguna Aktif</h3>
            <p className="text-3xl font-bold mt-2">892</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
            <h3 className="text-gray-400 text-sm font-medium">Pendaftaran Baru</h3>
            <p className="text-3xl font-bold mt-2">48</p>
          </div>
        </div>

        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-medium mb-4">Aktivitas Terakhir</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-lg px-2 transition-colors">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Pengguna baru mendaftar</p>
                  <p className="text-xs text-gray-400">2 jam yang lalu</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
