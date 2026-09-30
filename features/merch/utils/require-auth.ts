import { getSessionStatus } from "@/features/auth/actions/session-status";

/**
 * Client helper — memastikan user login sebelum aksi keranjang/checkout.
 * Balikkan true jika boleh lanjut. Jika belum login, redirect ke halaman
 * login dengan callbackUrl agar user kembali setelah login.
 */
export async function requireClientAuth(redirectTo?: string): Promise<boolean> {
  const status = await getSessionStatus();
  if (status.authenticated) return true;

  const callbackUrl = redirectTo || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/checkout");
  const encoded = encodeURIComponent(callbackUrl);
  window.location.href = `/auth/login?callbackUrl=${encoded}`;
  return false;
}