import { getMyProducts } from "../actions/my-product-actions";
import { MyProductManager } from "../components/my-product-manager";

export async function MyProductsPage() {
  const products = await getMyProducts();

  return <MyProductManager products={products} />;
}
