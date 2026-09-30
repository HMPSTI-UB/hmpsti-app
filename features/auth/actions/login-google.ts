"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { sanitizeCallbackUrl } from "../utils"

function isRedirectError(error: unknown): boolean {
  const digest = (error as { digest?: string })?.digest
  const message = (error as { message?: string })?.message
  return (
    message === "NEXT_REDIRECT" ||
    (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT"))
  )
}

export async function loginWithGoogleAction(callbackUrl?: string) {
  const target = sanitizeCallbackUrl(callbackUrl) ?? "/auth/redirect"

  try {
    await signIn("google", { redirectTo: target })
  } catch (error) {
    // NextAuth throws a redirect (to Google, then to redirectTo). Let it bubble.
    if (isRedirectError(error)) throw error

    if (error instanceof AuthError) {
      return { error: "Gagal masuk dengan Google. Silakan coba lagi." }
    }
    throw error
  }
}
