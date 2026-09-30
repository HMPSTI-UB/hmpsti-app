import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import { sanitizeCallbackUrl } from "@/features/auth/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string; callbackUrl?: string }>;
}) {
  const { expired, callbackUrl } = await searchParams;
  const safeCallback = sanitizeCallbackUrl(callbackUrl) ?? undefined;

  return (
    <main className="relative min-h-[100dvh] bg-[#0a0a0b] text-white overflow-hidden">
      <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-sky-500/[0.07] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#33A5D3] font-medium">
              Himpunan Mahasiswa Teknologi Informasi
            </p>

            {/* <div className="mt-5 flex items-center justify-center gap-3">
              <Image
                src="/icon.png"
                alt="Logo HMPSTI UB"
                width={40}
                height={40}
                priority
                className="h-10 w-10 object-contain"
              />
              <h1 className="font-black tracking-tight uppercase text-sm sm:text-base bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Kabinet Innovara
              </h1>
            </div> */}
          </div>

          <div className="mt-8 bg-[#0D0E11] border border-white/10 rounded-2xl p-7 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <LoginForm expired={expired === "1"} callbackUrl={safeCallback} />
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors"
            >
              <ChevronLeft size={15} />
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
          Kabinet Innovara &middot; 2026
        </p>
      </div>
    </main>
  );
}
