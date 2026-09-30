import { TrackOrderPage } from "@/features/account/pages/track-order-page";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const sp = await searchParams;
  return <TrackOrderPage initialCode={sp.code} />;
}
