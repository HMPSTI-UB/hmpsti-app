import { notFound } from "next/navigation";
import { ProductFormPage } from "@/features/merch/components/product-form-page";
import { getAdminCategories } from "@/features/merch/actions/category-actions";
import { getAdminProductById } from "@/features/merch/actions/product-actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: Props) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id, 10);

  if (isNaN(productId)) {
    notFound();
  }

  const [product, categories] = await Promise.all([
    getAdminProductById(productId),
    getAdminCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductFormPage
      mode="edit"
      initialProduct={product}
      categories={categories}
    />
  );
}
