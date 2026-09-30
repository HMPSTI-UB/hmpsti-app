import { TrackOrder } from "../components/track-order";

export function TrackOrderPage({ initialCode }: { initialCode?: string }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Lacak Pesanan</h1>
        <p className="mt-1 text-sm text-gray-400">
          Pantau status pesananmu secara real-time dengan kode pesanan.
        </p>
      </header>

      <TrackOrder initialCode={initialCode} />
    </div>
  );
}
