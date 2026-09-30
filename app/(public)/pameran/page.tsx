import PameranPage from "@/features/pameran/pages/pameran-page";
import { getLiveVoteData } from "@/features/pameran/actions/get-teams";
import { getSiteSettings } from "@/features/site-settings/actions/get-settings";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Pameran Karya | HMPSTI UB",
  description: "Eksplorasi inovasi terbaru di bidang Internet of Things karya mahasiswa Teknik Komputer.",
};

export default async function Page() {
  if (!(await getSiteSettings())) {
    notFound();
  }

  const teams = await getLiveVoteData();
  return <PameranPage teams={teams} />;
}
