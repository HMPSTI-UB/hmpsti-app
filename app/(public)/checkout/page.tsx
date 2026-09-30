import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Checkout from "@/features/merch/pages/checkout";

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=%2Fcheckout");
  }

  return <Checkout />;
}