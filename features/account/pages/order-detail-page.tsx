import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, MapPin, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { getUserOrder } from "../actions/orders";
import { OrderStatusBadge } from "../components/order-status-badge";

function rupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export async function AccountOrderDetailPage({
  orderId,
}: {
  orderId: number;
}) {
  const result = await getUserOrder(orderId);

  if ("error" in result) {
    notFound();
  }

  const { order, items } = result;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-[#33A5D3]"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Pesanan
      </Link>

      <header className="rounded-2xl border border-white/10 bg-[#0D0E11] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Kode Pesanan
            </p>
            <h1 className="mt-1 font-mono text-lg font-bold text-white">
              {order.orderCode}
            </h1>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-gray-500">
              Dibuat
            </dt>
            <dd className="text-sm text-gray-200">
              {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-gray-500">
              Diverifikasi
            </dt>
            <dd className="text-sm text-gray-200">
              {order.verifiedAt
                ? format(new Date(order.verifiedAt), "dd MMM yyyy, HH:mm")
                : "-"}
            </dd>
          </div>
        </dl>

        {order.status === "DITOLAK" && order.rejectionReason && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-red-400">
              Alasan Penolakan
            </p>
            <p className="mt-1 text-sm text-red-200">{order.rejectionReason}</p>
          </div>
        )}
      </header>

      <section className="rounded-2xl border border-white/10 bg-[#0D0E11] p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
          <FileText className="h-4 w-4 text-[#33A5D3]" strokeWidth={1.75} />
          Rincian Produk
        </h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {item.productNameSnapshot}
                </p>
                {(item.sizeNameSnapshot || item.variantNameSnapshot) && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {item.sizeNameSnapshot ? `Ukuran: ${item.sizeNameSnapshot}` : ""}
                    {item.sizeNameSnapshot && item.variantNameSnapshot ? " · " : ""}
                    {item.variantNameSnapshot ? `Varian: ${item.variantNameSnapshot}` : ""}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {item.quantity} × {rupiah(item.productPriceSnapshot)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-gray-200">
                {rupiah(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="font-bold text-white">Total</span>
          <span className="text-xl font-black text-[#33A5D3]">
            {rupiah(order.totalAmount)}
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0D0E11] p-6">
          <h2 className="mb-4 font-bold text-white">Info Pengiriman</h2>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
              <span>{order.buyerName}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
              <span>{order.buyerContact}</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
              <span>{order.buyerAddress}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0D0E11] p-6">
          <h2 className="mb-4 font-bold text-white">Bukti Pembayaran</h2>
          <a
            href={order.paymentProofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-white/10"
          >
            <Image
              src={order.paymentProofUrl}
              alt="Bukti pembayaran"
              width={600}
              height={400}
              className="h-40 w-full object-cover transition-opacity hover:opacity-90"
            />
          </a>
        </div>
      </section>
    </div>
  );
}