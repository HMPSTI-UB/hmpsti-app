import { getMyMerchantInfo } from "../actions/merchant-actions";
import { MerchantApplicationForm } from "../components/merchant-application-form";
import { MerchantStatusCard } from "../components/merchant-status-card";

export async function MerchantPage() {
  const info = await getMyMerchantInfo();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#33A5D3]">
          Merchant
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
          Toko Saya
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Kelola pengajuan dan status merchant kamu.
        </p>
      </header>

      {info ? (
        <MerchantStatusCard info={info} />
      ) : (
        <MerchantApplicationForm />
      )}

      {info?.status === "REJECTED" && (
        <MerchantApplicationForm
          defaults={{
            storeName: info.storeName,
            description: info.description,
            phone: info.phone,
            address: info.address,
          }}
        />
      )}
    </div>
  );
}
