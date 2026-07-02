"use server"

import { db } from "@/db"
import { vote_sessions, iot_teams, votes } from "@/db/schema"
import { eq, sql, and, lt, gt, lte, gte, or, ne, countDistinct } from "drizzle-orm"
import { requireUser, revalidateAll } from "./_guards"

// Helper to check if any session is active now or will overlap with given times
async function checkOverlap(startTime: Date, endTime: Date, excludeId?: number) {
  const overlaps = or(
    // 1. New session starts during an existing session
    and(
      lt(vote_sessions.startTime, startTime),
      gt(vote_sessions.endTime, startTime)
    ),
    // 2. New session ends during an existing session
    and(
      lt(vote_sessions.startTime, endTime),
      gt(vote_sessions.endTime, endTime)
    ),
    // 3. New session completely envelops an existing session
    and(
      gt(vote_sessions.startTime, startTime),
      lt(vote_sessions.endTime, endTime)
    ),
    // 4. Exact match
    and(
      eq(vote_sessions.startTime, startTime),
      eq(vote_sessions.endTime, endTime)
    )
  );

  const conditions = excludeId
    ? and(overlaps, ne(vote_sessions.id, excludeId))
    : overlaps;

  const overlappingSessions = await db
    .select({ id: vote_sessions.id, name: vote_sessions.name })
    .from(vote_sessions)
    .where(conditions);

  return overlappingSessions;
}

export async function getAdminSessions() {
  const result = await db
    .select({
      id: vote_sessions.id,
      name: vote_sessions.name,
      startTime: vote_sessions.startTime,
      endTime: vote_sessions.endTime,
      teamCount: countDistinct(iot_teams.id),
      voteCount: countDistinct(votes.id),
    })
    .from(vote_sessions)
    .leftJoin(iot_teams, eq(vote_sessions.id, iot_teams.sessionId))
    .leftJoin(votes, eq(vote_sessions.id, votes.sessionId))
    .groupBy(vote_sessions.id)
    .orderBy(vote_sessions.startTime);
    
  return result;
}

export async function createSession(data: { name: string, startTime: Date, endTime: Date }) {
  await requireUser();

  const overlap = await checkOverlap(data.startTime, data.endTime);
  if (overlap.length > 0) {
     throw new Error(`Waktu bentrok dengan sesi: ${overlap.map(s => s.name).join(', ')}. Hanya boleh 1 sesi berjalan dalam satu waktu.`);
  }

  await db.insert(vote_sessions).values({
    name: data.name,
    startTime: data.startTime,
    endTime: data.endTime,
  });

  revalidateAll();
}

export async function updateSession(id: number, data: { name: string, startTime: Date, endTime: Date }) {
  await requireUser();

  const overlap = await checkOverlap(data.startTime, data.endTime, id);
  if (overlap.length > 0) {
     throw new Error(`Waktu bentrok dengan sesi: ${overlap.map(s => s.name).join(', ')}. Hanya boleh 1 sesi berjalan dalam satu waktu.`);
  }

  await db.update(vote_sessions)
    .set({
      name: data.name,
      startTime: data.startTime,
      endTime: data.endTime,
    })
    .where(eq(vote_sessions.id, id));

  revalidateAll();
}

export async function deleteSession(id: number) {
  await requireUser();

  // Check if session has teams
  const teams = await db.select().from(iot_teams).where(eq(iot_teams.sessionId, id));
  if (teams.length > 0) {
    throw new Error("Sesi tidak bisa dihapus karena masih ada tim yang terhubung. Hapus atau pindahkan tim terlebih dahulu.");
  }

  await db.delete(vote_sessions).where(eq(vote_sessions.id, id));

  revalidateAll();
}

export async function startSessionNow(id: number) {
  await requireUser();

  // Cek apakah ADA sesi lain yang sedang aktif — pakai jam server DB
  // (CURRENT_TIMESTAMP), bukan `new Date()` JS, untuk hindari mismatch timezone.
  const currentlyActive = await db
    .select({ name: vote_sessions.name })
    .from(vote_sessions)
    .where(
      and(
        lte(vote_sessions.startTime, sql`CURRENT_TIMESTAMP`),
        gte(vote_sessions.endTime, sql`CURRENT_TIMESTAMP`),
        ne(vote_sessions.id, id)
      )
    );

  if (currentlyActive.length > 0) {
    throw new Error(`Tidak bisa memulai. Sesi "${currentlyActive[0].name}" sedang aktif. Akhiri sesi tersebut terlebih dahulu.`);
  }

  const sessionRecord = await db.select().from(vote_sessions).where(eq(vote_sessions.id, id)).limit(1);
  if (!sessionRecord || sessionRecord.length === 0) throw new Error("Sesi tidak ditemukan");

  const currentSession = sessionRecord[0];

  // Calculate original duration in ms, default to 2 hours if invalid
  let duration = currentSession.endTime.getTime() - currentSession.startTime.getTime();
  if (duration <= 0) duration = 2 * 60 * 60 * 1000;

  // Minimal durasi sesi adalah 30 menit (30 * 60 * 1000 ms)
  const MIN_DURATION = 30 * 60 * 1000;
  if (duration < MIN_DURATION) {
    duration = MIN_DURATION;
  }

  // startTime=sekarang (jam server DB), endTime=sekarang+durasi.
  await db.update(vote_sessions)
    .set({
      startTime: sql`CURRENT_TIMESTAMP`,
      endTime: sql`CURRENT_TIMESTAMP + (${duration} * INTERVAL '1 millisecond')`,
    })
    .where(eq(vote_sessions.id, id));

  revalidateAll();
}

export async function endSessionNow(id: number) {
  await requireUser();

  await db.update(vote_sessions)
    .set({ endTime: sql`CURRENT_TIMESTAMP` })
    .where(eq(vote_sessions.id, id));

  revalidateAll();
}

export async function resetSessionVotes(id: number) {
  await requireUser();

  await db.delete(votes).where(eq(votes.sessionId, id));

  revalidateAll();
}
