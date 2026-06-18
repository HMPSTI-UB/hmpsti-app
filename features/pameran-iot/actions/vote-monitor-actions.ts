"use server"

import { db } from "@/db"
import { iot_teams, vote_sessions, votes } from "@/db/schema"
import { eq, sql, desc } from "drizzle-orm"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getVoteRankings(sessionId?: number) {
  let query = db
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
    .leftJoin(vote_sessions, eq(iot_teams.sessionId, vote_sessions.id));

  if (sessionId) {
    query = query.where(eq(iot_teams.sessionId, sessionId)) as any;
  }

  const results = await query
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
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.delete(votes).where(eq(votes.id, voteId));

  revalidatePath("/", "layout");
}
