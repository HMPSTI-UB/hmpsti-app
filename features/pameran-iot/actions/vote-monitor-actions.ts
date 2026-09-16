"use server"

import { db } from "@/db"
import { iot_teams, vote_sessions, votes } from "@/db/schema"
import { eq, sql, desc } from "drizzle-orm"
import { requireUser, revalidateAll } from "./_guards"

export async function getVoteRankings(sessionId?: number) {
  const where = sessionId ? eq(iot_teams.sessionId, sessionId) : undefined;

  const results = await db
    .select({
      id: iot_teams.id,
      code: iot_teams.code,
      title: iot_teams.title,
      className: iot_teams.className,
      teamMembers: iot_teams.teamMembers,
      groupNumber: iot_teams.groupNumber,
      sessionName: vote_sessions.name,
      voteCount: sql<number>`count(${votes.id})::int`
    })
    .from(iot_teams)
    .leftJoin(votes, eq(iot_teams.id, votes.teamId))
    .leftJoin(vote_sessions, eq(iot_teams.sessionId, vote_sessions.id))
    .where(where)
    .groupBy(iot_teams.id, vote_sessions.name)
    .orderBy(desc(sql`count(${votes.id})`));

  return results;
}

export async function getTeamVotes(teamId: number) {
  const result = await db
    .select({
      id: votes.id,
      voterName: votes.voterName,
      message: votes.message,
      votedAt: votes.votedAt,
    })
    .from(votes)
    .where(eq(votes.teamId, teamId))
    .orderBy(desc(votes.votedAt));

  return result;
}

export async function deleteVote(voteId: number) {
  await requireUser();

  await db.delete(votes).where(eq(votes.id, voteId));

  revalidateAll();
}
