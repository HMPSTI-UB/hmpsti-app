"use server"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { 
  name: string; 
  email: string; 
  currentPassword?: string; 
  newPassword?: string; 
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Fetch current user from DB to verify password
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  // If trying to change password or email, require current password
  if (data.newPassword || data.email !== currentUser.email) {
    if (!data.currentPassword) {
      throw new Error("Password saat ini diperlukan untuk mengubah email atau password.");
    }
    
    // Simple plain text check as per current auth.ts implementation
    if (currentUser.password !== data.currentPassword) {
      throw new Error("Password saat ini salah.");
    }
  }

  const updateData: any = {
    name: data.name,
    email: data.email,
    updatedAt: new Date(),
  };

  if (data.newPassword) {
    updateData.password = data.newPassword;
  }

  try {
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));
    
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    if (error.code === '23505') { // Postgres unique constraint error code
      throw new Error("Email sudah digunakan oleh pengguna lain.");
    }
    throw new Error(error.message || "Gagal memperbarui profil.");
  }
}
