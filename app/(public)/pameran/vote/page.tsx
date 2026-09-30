import VotePage from "@/features/pameran/pages/vote-page";
import { getLiveVoteData, getActiveSession } from "@/features/pameran/actions/get-teams";
import { NoActiveSession } from "@/features/pameran/components/no-active-session";
import { getSiteSettings } from "@/features/site-settings/actions/get-settings";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Vote Karya - Pameran | HMPSTI UB",
  description: "Halaman voting untuk pengunjung Pameran Karya Internet of Things.",
  openGraph: {
    title: "Vote Karya - Pameran | HMPSTI UB",
    description: "Eksplorasi inovasi terbaru di bidang Internet of Things karya mahasiswa Teknik Komputer.",
    url: "https://hmpstiub.vercel.app/pameran/vote",
    siteName: "HMPSTI UB",
    locale: "id_ID",
    type: "website",
  },
};

export default async function Page() {
  if (!(await getSiteSettings())) {
    notFound();
  }

  const activeSession = await getActiveSession();
  
  if (!activeSession) {
    return <NoActiveSession />;
  }

  const teams = await getLiveVoteData(activeSession.id);
  
  return <VotePage initialTeams={teams} activeSession={activeSession} />;
}
