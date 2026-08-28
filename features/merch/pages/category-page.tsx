import { getAdminCategories } from "../actions/category-actions";
import { CategoryManager } from "../components/category-manager";

export async function CategoryPage() {
  const categories = await getAdminCategories();
  
  return (
    <div className="container py-10 max-w-6xl mx-auto space-y-6">
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
