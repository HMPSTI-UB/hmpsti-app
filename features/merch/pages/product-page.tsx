import { getAdminProducts } from "../actions/product-actions";
import { getAdminCategories } from "../actions/category-actions";
import { ProductManager } from "../components/product-manager";

type Props = {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    availability?: string;
  };
};

export async function ProductPage({ searchParams }: Props) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams.limit === "ALL" ? "ALL" : searchParams.limit ? parseInt(searchParams.limit, 10) : 10;
  const search = searchParams.search || "";
  const categoryId = searchParams.category ? parseInt(searchParams.category, 10) : undefined;
  const availability = (searchParams.availability as "ready" | "out_of_stock" | "preorder") || undefined;

  // Fetch initial data concurrently
  const [productsData, categories] = await Promise.all([
    getAdminProducts({
      page,
      pageSize: limit,
      search,
      categoryId,
      availability,
    }),
    getAdminCategories(),
  ]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-8">
      <ProductManager 
        initialProducts={productsData.products} 
        totalProducts={productsData.total}
        categories={categories}
        currentPage={page}
        currentLimit={limit}
        currentSearch={search}
        currentCategoryId={categoryId}
        currentAvailability={availability}
      />
    </div>
  );
}
