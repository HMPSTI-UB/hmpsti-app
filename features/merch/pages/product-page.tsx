import { getAdminProducts } from "../actions/product-actions";
import { getAdminCategories } from "../actions/category-actions";
import { MerchManager, type MerchTab } from "../components/merch-manager";

type Props = {
  searchParams: {
    tab?: string;
  };
};

export async function ProductPage({ searchParams }: Props) {
  const initialTab: MerchTab = searchParams.tab === "kategori" ? "kategori" : "produk";

  const [productsData, categories] = await Promise.all([
    getAdminProducts({ pageSize: "ALL" }),
    getAdminCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-8">
      <MerchManager
        initialTab={initialTab}
        initialProducts={productsData.products}
        categories={categories}
      />
    </div>
  );
}