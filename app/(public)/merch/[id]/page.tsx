import ProductDetail from "@/features/merch/pages/product-detail";
import { notFound } from "next/navigation";
import { getPublicProductById, getPublicProducts } from "@/features/merch/actions/public-actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const idNum = parseInt(resolvedParams.id, 10);
  if (isNaN(idNum)) {
    notFound();
  }

  const product = await getPublicProductById(idNum);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
