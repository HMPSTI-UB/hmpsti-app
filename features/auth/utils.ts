/**
 * Validasi callback URL agar hanya menerima path internal aplikasi.
 * Menolak URL absolut / protocol-relative untuk mencegah open redirect.
 */
export function sanitizeCallbackUrl(value?: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}
