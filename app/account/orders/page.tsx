import { AccountOrdersPage } from "@/features/account/pages/orders-page";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sp = await searchParams;
  return <AccountOrdersPage searchParams={sp} />;
}