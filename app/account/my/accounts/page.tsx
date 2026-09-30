import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isApprovedMerchant } from "@/lib/auth-guards";
import { MerchantAccountsPage } from "@/features/payment-accounts/pages/merchant-accounts-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (!(await isApprovedMerchant(session.user.id!))) redirect("/account/merchant");

  return <MerchantAccountsPage />;
}
