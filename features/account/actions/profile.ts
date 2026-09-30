"use server"

import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireUser } from "@/lib/auth-guards"

export type CheckoutProfile = {
  name: string
  phone: string
  address: string
}

/**
 * Profil minimal untuk mengisi otomatis form checkout. Hanya mengembalikan
 * data milik user yang sedang login.
 */
export async function getCheckoutProfile(): Promise<CheckoutProfile> {
  const sessionUser = await requireUser()

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, sessionUser.id),
    columns: { name: true, phone: true, address: true },
  })

  return {
    name: dbUser?.name ?? sessionUser.name ?? "",
    phone: dbUser?.phone ?? "",
    address: dbUser?.address ?? "",
  }
}