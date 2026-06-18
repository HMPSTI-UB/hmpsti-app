import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(1, { message: "Password harus diisi" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const settingsSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }),
  currentPassword: z.string().optional().or(z.literal("")),
  newPassword: z.string().min(6, { message: "Password minimal 6 karakter" }).optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Password saat ini diperlukan untuk membuat password baru",
  path: ["currentPassword"],
}).refine((data) => {
  if (data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export type SettingsSchema = z.infer<typeof settingsSchema>;
