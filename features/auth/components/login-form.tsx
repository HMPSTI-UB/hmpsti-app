"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "../actions/login";
import { loginSchema, type LoginSchema } from "../schemas";
import { Lock, Mail, ArrowRight } from "lucide-react";

export function LoginForm() {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

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
      const response = await loginAction(data);
      if (response?.error) {
        setError(response.error);
      }
    });
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email Address
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={`block w-full pl-10 bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:text-sm`}
              placeholder="admin@hmpsti.ub.ac.id"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              {...register("password")}
              className={`block w-full pl-10 bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-lg py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors sm:text-sm`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Signing in..." : "Sign in"}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>
  );
}
