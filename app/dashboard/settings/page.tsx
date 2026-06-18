import { auth } from "@/auth";
import { SettingsForm } from "@/features/auth/components/settings-form";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 rounded-lg">
            <Settings className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Pengaturan Akun</h2>
            <p className="text-gray-400 text-sm mt-1">
              Perbarui informasi profil dan keamanan akun Anda
            </p>
          </div>
        </div>
      </header>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <SettingsForm user={session.user} />
      </div>
    </div>
  );
}
