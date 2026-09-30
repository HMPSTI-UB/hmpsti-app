import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?expired=1");
  }

  if (session.user.role !== "admin") {
    redirect("/account");
  }

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
  };

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
