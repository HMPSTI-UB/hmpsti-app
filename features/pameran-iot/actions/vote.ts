"use server"

import { db } from "@/db"
import { vote_sessions, votes } from "@/db/schema"
import { and, eq, gte, lte, sql } from "drizzle-orm"
import { revalidateAll } from "./_guards"

export async function submitVote(teamId: number, sessionId: number, voterName: string | undefined, message: string | undefined) {
  try {
    // Validasi waktu sesi pakai jam server DB (CURRENT_TIMESTAMP), bukan `new Date()` JS,
    // supaya tidak ada mismatch timezone antara app server dan Neon.
    const activeSession = await db
      .select({ id: vote_sessions.id })
      .from(vote_sessions)
      .where(
        and(
          eq(vote_sessions.id, sessionId),
          lte(vote_sessions.startTime, sql`CURRENT_TIMESTAMP`),
          gte(vote_sessions.endTime, sql`CURRENT_TIMESTAMP`),
        )
      )
      .limit(1);

    if (activeSession.length === 0) {
      // Bedakan pesan: sesi tidak ada vs sesi ada tapi di luar jendela waktu.
      const exists = await db
        .select({ id: vote_sessions.id })
        .from(vote_sessions)
        .where(eq(vote_sessions.id, sessionId))
        .limit(1);

      return {
        success: false,
        error: exists.length === 0
          ? "Sesi voting tidak ditemukan."
          : "Mohon maaf, sesi voting ini belum dimulai atau sudah berakhir.",
      };
    }

    await db.insert(votes).values({
      teamId,
      sessionId,
      voterName: voterName || null,
      message: message || null,
    });

    revalidateAll();

    return { success: true };
  } catch (error) {
    console.error("Failed to submit vote:", error);
    return { success: false, error: "Gagal menyimpan vote." };
  }
}
