"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { loginAction } from "../actions/login";
import { loginWithGoogleAction } from "../actions/login-google";
import { loginSchema, type LoginSchema } from "../schemas";
import { Eye, EyeOff, ArrowRight, AlertTriangle } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function LoginForm({ expired = false, callbackUrl }: { expired?: boolean; callbackUrl?: string }) {
  const [error, setError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginSchema) => {
    setError(undefined);
    startTransition(async () => {
      const response = await loginAction(data, callbackUrl);
      if (response?.error) {
        setError(response.error);
      }
    });
  };

  const onGoogleLogin = () => {
    setError(undefined);
    startGoogleTransition(async () => {
      const response = await loginWithGoogleAction(callbackUrl);
      if (response?.error) {
        setError(response.error);
      }
    });
  };

  const busy = isPending || isGooglePending;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Masuk</h2>
        {/* <p className="mt-1 text-sm text-gray-500">Selamat datang kembali </p> */}
      </div>

      {expired && (
        <div className="flex items-start gap-2.5 p-3 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle
            className="h-4 w-4 mt-0.5 shrink-0"
            strokeWidth={1.75}
          />
          <span>Sesi Anda berakhir. Silakan login kembali.</span>
        </div>
      )}

      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className={`mt-1.5 block w-full h-11 rounded-xl bg-white/[0.05] border px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#33A5D3]/60 focus:border-transparent transition-all ${
                errors.email
                  ? "border-red-500/60"
                  : "border-white/10 hover:border-white/20"
              }`}
              placeholder="admin@hmpsti.ub.ac.id"
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                className={`block w-full h-11 rounded-xl bg-white/[0.05] border px-4 pr-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#33A5D3]/60 focus:border-transparent transition-all ${
                  errors.password
                    ? "border-red-500/60"
                    : "border-white/10 hover:border-white/20"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} />
                ) : (
                  <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="group relative w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[#33A5D3] text-[#050505] text-sm font-semibold hover:bg-[#4bb8e6] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Memproses..." : "Masuk"}
          {!isPending && (
            <ArrowRight
              className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2}
            />
          )}
        </button>
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-600">
            atau
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={busy}
          className="group w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-white text-[#1f1f1f] text-sm font-semibold hover:bg-white/90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          {isGooglePending ? "Menghubungkan..." : "Masuk dengan Google"}
        </button>
      </form>
    </motion.div>
  );
}
