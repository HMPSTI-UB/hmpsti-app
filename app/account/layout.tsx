import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CartProvider } from "@/features/merch/context/cart-context";
import { AccountShell } from "@/features/account/components/account-shell";
import { getMyMerchantInfo } from "@/features/merchant/actions/merchant-actions";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=%2Faccount");
  }

  const merchantInfo = await getMyMerchantInfo();

  return (
    <CartProvider>
      <AccountShell
        userName={session.user.name}
        merchantStatus={merchantInfo?.status ?? null}
      >
        {children}
      </AccountShell>
    </CartProvider>
  );
}