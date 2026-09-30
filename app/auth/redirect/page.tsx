import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { sanitizeCallbackUrl } from "@/features/auth/utils"

export const dynamic = "force-dynamic"

export default async function AuthRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const { callbackUrl } = await searchParams
  const safeCallback = sanitizeCallbackUrl(callbackUrl)

  if (safeCallback) {
    redirect(safeCallback)
  }

  redirect(session.user.role === "admin" ? "/dashboard" : "/account")
}