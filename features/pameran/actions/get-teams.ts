"use server"

import { db } from "@/db"
import { teams, vote_sessions, votes } from "@/db/schema"
import { eq, sql, desc } from "drizzle-orm"

export async function getLiveVoteData(sessionId?: number) {
  const where = sessionId !== undefined ? eq(teams.sessionId, sessionId) : undefined;

  const results = await db
    .select({
      id: teams.id,
      code: teams.code,
      title: teams.title,
      team: teams.className,
      groupNumber: teams.groupNumber,
      teamMembers: teams.teamMembers,
      bannerImageUrl: teams.bannerImageUrl,
      projectImageUrl: teams.projectImageUrl,
      sessionId: teams.sessionId,
      votes: sql<number>`count(${votes.id})::int`
    })
    .from(teams)
    .leftJoin(votes, eq(teams.id, votes.teamId))
    .where(where)
    .groupBy(teams.id)
    .orderBy(desc(sql`count(${votes.id})`));

  return results.map(row => ({
    id: row.id,
    code: row.code,
    title: row.title,
    team: `${row.team} Kelompok ${row.groupNumber}`,
    className: row.team,
    groupNumber: row.groupNumber,
    teamMembers: row.teamMembers,
    sessionId: row.sessionId,
    votes: row.votes,
    bannerImageUrl: row.bannerImageUrl,
    projectImageUrl: row.projectImageUrl,
  }));
}

export async function getVoteSessions() {
  return await db.select().from(vote_sessions);
}

export async function getActiveSession() {
  const activeSessions = await db
    .select()
    .from(vote_sessions)
    .where(
      sql`${vote_sessions.startTime} <= CURRENT_TIMESTAMP AND ${vote_sessions.endTime} >= CURRENT_TIMESTAMP`
    )
    .limit(1);
    
  return activeSessions.length > 0 ? activeSessions[0] : null;
}

export async function getTeamById(id: number) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.id, id))
    .limit(1);
    
  return result[0] || null;
}
