import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSiteSettingsPage from "@/features/site-settings/pages/admin-site-settings-page";

export default async function SiteSettingsRoute() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return <AdminSiteSettingsPage />;
}