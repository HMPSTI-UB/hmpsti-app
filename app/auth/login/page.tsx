import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Selamat Datang
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Silakan login untuk mengakses dashboard HMPSTI UB
          </p>
        </div>
        
        <LoginForm />

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
