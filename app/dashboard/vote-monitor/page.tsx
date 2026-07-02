import AdminVoteMonitorPage from "@/features/pameran-iot/pages/admin-vote-monitor-page";

export const dynamic = "force-dynamic";

export default function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <AdminVoteMonitorPage searchParams={searchParams} />;
}
