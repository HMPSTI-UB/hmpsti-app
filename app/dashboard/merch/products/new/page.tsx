import { ProductFormPage } from "@/features/merch/components/product-form-page";
import { getAdminCategories } from "@/features/merch/actions/category-actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return <ProductFormPage mode="create" categories={categories} />;
}
