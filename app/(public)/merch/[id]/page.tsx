import { merchProducts } from "@/constant/data";
import ProductDetail from "@/features/merch/pages/product-detail";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return merchProducts.map((product) => ({
    id: product.id,
  }));
}

export const dynamic = 'force-static';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = merchProducts.find((p) => p.id === resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
