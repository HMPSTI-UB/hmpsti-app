import { getTeamById } from "@/features/pameran/actions/get-teams";
import { getSiteSettings } from "@/features/site-settings/actions/get-settings";
import { notFound } from "next/navigation";
import DetailPage from "@/features/pameran/pages/detail-page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getSiteSettings())) {
    notFound();
  }

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
