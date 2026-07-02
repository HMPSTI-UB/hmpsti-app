import { getTeamById } from "@/features/pameran-iot/actions/get-teams";
import { notFound } from "next/navigation";
import DetailPage from "@/features/pameran-iot/pages/detail-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = Number(id);
  
  if (isNaN(parsedId)) {
    notFound();
  }

  const team = await getTeamById(parsedId);

  if (!team) {
    notFound();
  }

  return <DetailPage team={team} />;
}
