"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, type SettingsSchema } from "../schemas";
import { updateProfile } from "../actions/update-profile";
import { Lock, Mail, User, ShieldCheck, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SettingsFormProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsSchema>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SettingsSchema) => {
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await updateProfile({
          name: data.name,
          email: data.email,
          currentPassword: data.currentPassword || undefined,
          newPassword: data.newPassword || undefined,
        });

        if (result.success) {
          toast.success("Profil berhasil diperbarui!");
          reset({
            ...data,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message || "Gagal memperbarui profil");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Section */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Informasi Dasar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-400">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    id="name"
                    {...register("name")}
                    className={`block w-full pl-10 bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm`}
                    placeholder="Nama Anda"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-400">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={`block w-full pl-10 bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm`}
                    placeholder="email@contoh.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5 md:col-span-2 my-2" />

          {/* Security Section */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-yellow-400" />
              Keamanan & Password
            </h3>
            <p className="text-xs text-gray-500 italic">
              *Kosongkan password baru jika tidak ingin mengubah password. 
              Password saat ini diperlukan jika Anda mengubah email atau password.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium text-gray-400">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    id="currentPassword"
                    type="password"
                    {...register("currentPassword")}
                    className={`block w-full pl-10 bg-white/5 border ${errors.currentPassword ? 'border-red-500' : 'border-white/10'} rounded-xl py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-gray-400">
                    Password Baru
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      id="newPassword"
                      type="password"
                      {...register("newPassword")}
                      className={`block w-full pl-10 bg-white/5 border ${errors.newPassword ? 'border-red-500' : 'border-white/10'} rounded-xl py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm`}
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-400">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword")}
                      className={`block w-full pl-10 bg-white/5 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-xl py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm`}
                      placeholder="Ulangi password baru"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
