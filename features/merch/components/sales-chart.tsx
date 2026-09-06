"use client";

import { motion } from "framer-motion";

// Define inline if it's not exported. Let's just define it inline to be safe.
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface SalesData {
  monthName: string;
  total: number;
}

export function MerchSalesChart({ data }: { data: SalesData[] }) {
  const maxSales = Math.max(...data.map(d => d.total), 1); // Avoid division by zero
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full">
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white">Grafik Penjualan Merchandise ({currentYear})</h3>
        <p className="text-sm text-gray-400">Total pendapatan dari pesanan yang sudah diverifikasi</p>
      </div>

      {/* Chart Container */}
      <div className="h-64 flex items-end justify-between gap-2 mt-4 relative">
        {/* Y-Axis Guides (Background Lines) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[1, 0.75, 0.5, 0.25, 0].map((step, i) => (
            <div key={i} className="flex items-center w-full">
              <span className="text-[10px] text-gray-500 w-12 hidden sm:block">
                {step === 0 ? "Rp 0" : formatIDR(maxSales * step).replace(",00", "")}
              </span>
              <div className="flex-1 border-t border-white/5 ml-2" />
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="relative z-10 flex items-end justify-between w-full h-full sm:ml-14 pt-6 pb-6">
          {data.map((item, index) => {
            const heightPercent = maxSales > 0 ? (item.total / maxSales) * 100 : 0;
            
            return (
              <div key={index} className="flex flex-col items-center group relative w-full h-full px-1">
                {/* Tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded-md shadow-lg pointer-events-none z-20 whitespace-nowrap">
                  <span className="font-bold block mb-0.5">{item.monthName}</span>
                  {formatIDR(item.total)}
                  <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900"></div>
                </div>
                
                {/* Bar */}
                <div className="w-full max-w-[40px] h-full flex items-end justify-center">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                    className="w-full bg-emerald-500/80 hover:bg-emerald-400 rounded-t-sm transition-colors cursor-pointer"
                  />
                </div>
                
                {/* X-Axis Label */}
                <span className="text-xs text-gray-400 mt-3 absolute -bottom-6">
                  {item.monthName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
