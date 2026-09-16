import { ProductPage } from "@/features/merch/pages/product-page";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    availability?: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  // Await the searchParams as per Next.js 16 requirements mentioned in rules
  const sp = await searchParams;
  
  return <ProductPage searchParams={sp} />;
}
