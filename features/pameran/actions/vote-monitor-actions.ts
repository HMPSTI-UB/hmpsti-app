"use server"

import { db } from "@/db"
import { teams, vote_sessions, votes } from "@/db/schema"
import { eq, sql, desc } from "drizzle-orm"
import { requireAdmin, revalidateAll } from "./_guards"

export async function getVoteRankings(sessionId?: number) {
  const where = sessionId ? eq(teams.sessionId, sessionId) : undefined;

  const results = await db
    .select({
      id: teams.id,
      code: teams.code,
      title: teams.title,
      className: teams.className,
      teamMembers: teams.teamMembers,
      groupNumber: teams.groupNumber,
      sessionName: vote_sessions.name,
      voteCount: sql<number>`count(${votes.id})::int`
    })
    .from(teams)
    .leftJoin(votes, eq(teams.id, votes.teamId))
    .leftJoin(vote_sessions, eq(teams.sessionId, vote_sessions.id))
    .where(where)
    .groupBy(teams.id, vote_sessions.name)
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
  await requireAdmin();

  await db.delete(votes).where(eq(votes.id, voteId));

  revalidateAll();
}
