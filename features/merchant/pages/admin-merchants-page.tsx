import { getMerchantApplications } from "../actions/admin-merchant-actions";
import { MerchantApplicationTable } from "../components/merchant-application-table";

export async function AdminMerchantsPage() {
  const { applications } = await getMerchantApplications({ status: "ALL" });

  return (
    <div className="p-8">
      <MerchantApplicationTable applications={applications} />
    </div>
  );
}
