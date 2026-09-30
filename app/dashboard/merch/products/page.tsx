import { ProductPage } from "@/features/merch/pages/product-page";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  return <ProductPage searchParams={sp} />;
}