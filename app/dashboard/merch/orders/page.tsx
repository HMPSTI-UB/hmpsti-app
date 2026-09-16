import { OrderPage } from "@/features/merch/pages/order-page";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  return <OrderPage searchParams={sp} />;
}