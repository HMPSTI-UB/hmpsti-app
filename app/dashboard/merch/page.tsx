import { ShoppingBag, Tags, ClipboardList, Clock, CheckCircle, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getMerchDashboardStats } from "@/features/merch/actions/dashboard-actions";

export default async function MerchDashboardPage() {
  const stats = await getMerchDashboardStats();

  // Format currency
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Merchandise Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">Ringkasan performa dan status operasional toko merchandise</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Total Produk */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Total Produk</h3>
              <p className="text-4xl font-bold mt-2 text-white">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
              <ShoppingBag className="h-6 w-6 text-orange-400" />
            </div>
          </div>
          <Link href="/dashboard/merch/products" className="inline-flex items-center text-xs text-orange-400 mt-4 hover:underline">
            Kelola produk <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        {/* Card 2: Total Kategori */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Total Kategori</h3>
              <p className="text-4xl font-bold mt-2 text-white">{stats.totalCategories}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
              <Tags className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <Link href="/dashboard/merch/categories" className="inline-flex items-center text-xs text-blue-400 mt-4 hover:underline">
            Kelola kategori <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        {/* Card 3: Total Pesanan */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Total Pesanan (Valid)</h3>
              <p className="text-4xl font-bold mt-2 text-white">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
              <ClipboardList className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <Link href="/dashboard/merch/orders" className="inline-flex items-center text-xs text-purple-400 mt-4 hover:underline">
            Lihat pesanan <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        {/* Card 4: Pesanan Menunggu Verifikasi */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Menunggu Verifikasi</h3>
              <p className="text-4xl font-bold mt-2 text-white">{stats.pendingOrders}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <Link href="/dashboard/merch/orders?status=MENUNGGU_VERIFIKASI" className="inline-flex items-center text-xs text-yellow-400 mt-4 hover:underline">
            Proses pesanan <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        {/* Card 5: Pesanan Terverifikasi */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Pesanan Terverifikasi</h3>
              <p className="text-4xl font-bold mt-2 text-white">{stats.verifiedOrders}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <Link href="/dashboard/merch/orders?status=TERVERIFIKASI" className="inline-flex items-center text-xs text-green-400 mt-4 hover:underline">
            Lihat pesanan <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        {/* Card 6: Total Keuangan Verifikasi */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Total Pendapatan</h3>
              <p className="text-3xl font-bold mt-2 text-white truncate max-w-[200px]" title={formatRupiah(stats.totalRevenue)}>
                {formatRupiah(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors shrink-0">
              <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            Hanya menghitung pesanan terverifikasi
          </div>
        </div>

      </div>
    </div>
  );
}
