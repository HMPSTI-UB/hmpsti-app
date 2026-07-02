import PameranIotPage from "@/features/pameran-iot/pages/pameran-iot-page";
import { getLiveVoteData } from "@/features/pameran-iot/actions/get-teams";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Pameran Karya IoT | HMPSTI UB",
  description: "Eksplorasi inovasi terbaru di bidang Internet of Things karya mahasiswa Teknik Komputer.",
};

export default async function Page() {
  const teams = await getLiveVoteData();
  return <PameranIotPage teams={teams} />;
}
