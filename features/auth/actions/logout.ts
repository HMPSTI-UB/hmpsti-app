"use server"

import { signOut } from "@/auth"
import { redirect } from "next/navigation"

export async function logoutAction() {
  try {
    await signOut();
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      redirect("/auth/login");
    }
    throw error;
  }
}
