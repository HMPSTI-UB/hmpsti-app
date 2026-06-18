"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { loginSchema, LoginSchema } from "../schemas"
import { redirect } from "next/navigation"

export async function loginAction(data: LoginSchema) {
  // Validate data on the server
  const parsed = loginSchema.safeParse(data);
  
  if (!parsed.success) {
    return { error: "Data yang dimasukkan tidak valid." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
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
      redirect("/dashboard");
    }
    throw error;
  }
}
