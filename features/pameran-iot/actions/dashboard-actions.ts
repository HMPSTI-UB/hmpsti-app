"use server"

import { db } from "@/db"
import { iot_teams, vote_sessions, votes } from "@/db/schema"
import { sql, desc, eq } from "drizzle-orm"
import { getActiveSession } from "./get-teams"

export async function getDashboardStats() {
  const [activeSession, totalTeamsCount, totalVotesCount] = await Promise.all([
    getActiveSession(),
    db.select({ count: sql<number>`count(*)::int` }).from(iot_teams),
    db.select({ count: sql<number>`count(*)::int` }).from(votes)
  ]);

  const recentVotes = await db
    .select({
      id: votes.id,
      voterName: votes.voterName,
      votedAt: votes.votedAt,
      teamTitle: iot_teams.title,
      teamCode: iot_teams.code
    })
    .from(votes)
    .leftJoin(iot_teams, eq(votes.teamId, iot_teams.id))
    .orderBy(desc(votes.votedAt))
    .limit(5);

  return {
    activeSession,
    totalTeams: totalTeamsCount[0].count,
    totalVotes: totalVotesCount[0].count,
    totalProducts: 0, // Placeholder for future merch feature
    recentVotes
  };
}
