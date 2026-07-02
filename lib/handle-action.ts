/**
 * Ambil pesan error yang aman ditampilkan dari nilai `unknown` (hasil `catch`).
 * Helper global — dipakai lintas fitur untuk menghindari `catch (err: any)`.
 */
export function getErrorMessage(error: unknown, fallback = "Terjadi kesalahan"): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}
