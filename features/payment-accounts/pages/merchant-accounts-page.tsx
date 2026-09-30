import { getMyAccounts } from "../actions/payment-account-actions";
import { PaymentAccountManager } from "../components/payment-account-manager";

export async function MerchantAccountsPage() {
  const accounts = await getMyAccounts();

  return (
    <div className="mx-auto max-w-5xl">
      <PaymentAccountManager mode="owner" accounts={accounts} />
    </div>
  );
}
