import Link from "next/link";
import { quickMenuItems } from "@/constant/data";

export function QuickMenu() {
  return (
    <div className="md:hidden w-full px-6 -mt-6 relative z-20 mb-16">
      <div className="grid grid-cols-4 gap-2">
        {quickMenuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex flex-col items-center gap-2 py-4 rounded-xl bg-white/[0.03] border border-white/[0.04] active:scale-95 transition-transform"
          >
            <item.icon size={20} className="text-gray-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
