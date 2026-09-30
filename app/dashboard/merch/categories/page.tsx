import { permanentRedirect } from "next/navigation";

export default function AdminCategoriesRoute() {
  permanentRedirect("/dashboard/merch/products?tab=kategori");
}