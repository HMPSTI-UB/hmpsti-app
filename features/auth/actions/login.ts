"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { loginSchema, LoginSchema } from "../schemas"
import { redirect } from "next/navigation"
import { sanitizeCallbackUrl } from "../utils"

export async function loginAction(data: LoginSchema, callbackUrl?: string) {
  // Validate data on the server
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return { error: "Data yang dimasukkan tidak valid." };
  }

  const target = sanitizeCallbackUrl(callbackUrl) ?? "/auth/redirect";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: target,
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau password salah." };
        default:
          return { error: "Terjadi kesalahan pada sistem saat login." };
      }
    }
    // Catch NextAuth's buggy redirect to /undefined
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      // Instead of swallowing the error, throw a new valid redirect
      redirect(target);
    }
    throw error;
  }
}
