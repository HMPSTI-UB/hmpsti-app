import AdminTeamsPage from "@/features/pameran-iot/pages/admin-teams-page";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <AdminTeamsPage searchParams={params} />;
}
