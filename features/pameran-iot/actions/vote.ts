"use server"

import { db } from "@/db"
import { vote_sessions, votes } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function submitVote(teamId: number, sessionId: number, voterName: string | undefined, message: string | undefined) {
  try {
    // Validasi apakah sesi yang dituju masih aktif (berdasarkan waktu server)
    const sessionRecord = await db
      .select()
      .from(vote_sessions)
      .where(eq(vote_sessions.id, sessionId))
      .limit(1);

    if (!sessionRecord || sessionRecord.length === 0) {
      return { success: false, error: "Sesi voting tidak ditemukan." };
    }

    const now = new Date();
    const activeSession = sessionRecord[0];

    if (now < activeSession.startTime || now > activeSession.endTime) {
      return { success: false, error: "Mohon maaf, sesi voting ini belum dimulai atau sudah berakhir." };
    }

    await db.insert(votes).values({
      teamId,
      sessionId,
      voterName: voterName || null,
      message: message || null,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to submit vote:", error);
    return { success: false, error: "Gagal menyimpan vote." };
  }
}
