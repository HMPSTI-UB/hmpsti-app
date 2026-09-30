import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsForm } from "@/features/auth/components/settings-form";

export async function AccountSettingsPage() {
  const session = await auth();
  const sessionUser = session!.user;

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, sessionUser.id),
    columns: {
      password: true,
      name: true,
      email: true,
      phone: true,
      address: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-gray-400">
          Perbarui informasi profil, kontak, dan keamanan akun Anda.
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-[#0D0E11] p-6 sm:p-8">
        <SettingsForm
          user={{
            name: dbUser?.name ?? sessionUser.name,
            email: dbUser?.email ?? sessionUser.email,
            phone: dbUser?.phone,
            address: dbUser?.address,
          }}
          hasPassword={!!dbUser?.password}
        />
      </div>
    </div>
  );
}