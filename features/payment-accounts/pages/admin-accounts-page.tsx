import { getAllAccounts } from "../actions/payment-account-actions";
import { PaymentAccountManager } from "../components/payment-account-manager";

export async function AdminAccountsPage() {
  const accounts = await getAllAccounts();

  return (
    <div className="p-8">
      <PaymentAccountManager mode="admin" accounts={accounts} />
    </div>
  );
}
