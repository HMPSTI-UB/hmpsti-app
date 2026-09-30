import LivePage from "@/features/pameran/pages/live-page";
import { getSiteSettings } from "@/features/site-settings/actions/get-settings";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Live Vote - Pameran | HMPSTI UB",
  description: "Klasemen sementara perolehan suara Pameran Karya Internet of Things.",
};

export default async function Page() {
  if (!(await getSiteSettings())) {
    notFound();
  }

  return <LivePage />;
}
