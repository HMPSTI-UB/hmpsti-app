import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isApprovedMerchant } from "@/lib/auth-guards";
import { ProductFormPage } from "@/features/merch/components/product-form-page";
import { getSelectableCategories } from "@/features/merch/actions/category-actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (!(await isApprovedMerchant(session.user.id!))) redirect("/account/merchant");

  const categories = await getSelectableCategories();

  return <ProductFormPage mode="create" categories={categories} scope="merchant" />;
}
