import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isApprovedMerchant } from "@/lib/auth-guards";
import { ProductFormPage } from "@/features/merch/components/product-form-page";
import { getSelectableCategories } from "@/features/merch/actions/category-actions";
import { getMyProductById } from "@/features/merchant/actions/my-product-actions";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (!(await isApprovedMerchant(session.user.id!))) redirect("/account/merchant");

  const { id } = await params;
  const productId = Number(id);
  if (Number.isNaN(productId)) notFound();

  const [product, categories] = await Promise.all([
    getMyProductById(productId),
    getSelectableCategories(),
  ]);

  if (!product) notFound();

  return (
    <ProductFormPage
      mode="edit"
      initialProduct={product}
      categories={categories}
      scope="merchant"
    />
  );
}
