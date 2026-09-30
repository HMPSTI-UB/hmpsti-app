import Merch from "@/features/merch/pages/merch";
import { getPublicCategories, getPublicProducts } from "@/features/merch/actions/public-actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MerchPage() {
  const categories = await getPublicCategories();
  const products = await getPublicProducts();

  return <Merch categories={categories} products={products} />;
}
