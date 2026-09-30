import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isApprovedMerchant } from "@/lib/auth-guards";
import { MyProductsPage } from "@/features/merchant/pages/my-products-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (!(await isApprovedMerchant(session.user.id!))) redirect("/account/merchant");

  return <MyProductsPage />;
}
