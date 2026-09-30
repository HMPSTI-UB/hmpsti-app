import { notFound } from "next/navigation";
import { AccountOrderDetailPage } from "@/features/account/pages/order-detail-page";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  return <AccountOrderDetailPage orderId={orderId} />;
}