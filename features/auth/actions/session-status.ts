"use server"

import { auth } from "@/auth"

/**
 * Server action publik — status login minim untuk komponen client (Navbar,
 * tombol keranjang/checkout). Tidak mengekspos data sensitif, hanya flag.
 */
export async function getSessionStatus(): Promise<{
  authenticated: boolean;
  role?: string;
  userId?: string;
}> {
  const session = await auth();
  if (!session?.user) return { authenticated: false };
  return {
    authenticated: true,
    role: session.user.role,
    userId: session.user.id,
  };
}