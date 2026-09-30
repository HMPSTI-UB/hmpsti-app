import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsForm } from "@/features/auth/components/settings-form";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { password: true },
  });

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#33A5D3]/10 rounded-lg">
            <Settings className="h-6 w-6 text-[#33A5D3]" />
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
        <SettingsForm user={session.user} hasPassword={!!dbUser?.password} />
      </div>
    </div>
  );
}
