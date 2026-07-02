"use server"

import { db } from "@/db"
import { iot_teams, vote_sessions, votes } from "@/db/schema"
import { eq, sql, desc } from "drizzle-orm"

export async function getLiveVoteData(sessionId?: number) {
  const where = sessionId !== undefined ? eq(iot_teams.sessionId, sessionId) : undefined;

  const results = await db
    .select({
      id: iot_teams.id,
      code: iot_teams.code,
      title: iot_teams.title,
      team: iot_teams.className,
      groupNumber: iot_teams.groupNumber,
      teamMembers: iot_teams.teamMembers,
      bannerImageUrl: iot_teams.bannerImageUrl,
      projectImageUrl: iot_teams.projectImageUrl,
      sessionId: iot_teams.sessionId,
      votes: sql<number>`count(${votes.id})::int`
    })
    .from(iot_teams)
    .leftJoin(votes, eq(iot_teams.id, votes.teamId))
    .where(where)
    .groupBy(iot_teams.id)
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
    .from(iot_teams)
    .where(eq(iot_teams.id, id))
    .limit(1);
    
  return result[0] || null;
}
