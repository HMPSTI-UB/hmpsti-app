"use server"

import { db } from "@/db"
import { iot_teams, vote_sessions, votes } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { requireUser, revalidateAll } from "./_guards"

export async function getAdminTeams() {
  const result = await db
    .select({
      id: iot_teams.id,
      code: iot_teams.code,
      className: iot_teams.className,
      groupNumber: iot_teams.groupNumber,
      title: iot_teams.title,
      teamMembers: iot_teams.teamMembers,
      bannerImageUrl: iot_teams.bannerImageUrl,
      projectImageUrl: iot_teams.projectImageUrl,
      sessionId: iot_teams.sessionId,
      sessionName: vote_sessions.name,
      voteCount: sql<number>`(SELECT count(*) FROM ${votes} WHERE ${votes.teamId} = ${iot_teams.id})::int`,
    })
    .from(iot_teams)
    .leftJoin(vote_sessions, eq(iot_teams.sessionId, vote_sessions.id))
    .orderBy(iot_teams.code);
    
  return result;
}

export type TeamFormData = {
  code: string;
  className: string;
  groupNumber: number;
  title: string;
  teamMembers: string;
  bannerImageUrl: string | null;
  projectImageUrl: string | null;
  sessionId: number;
};

export async function createTeam(data: TeamFormData) {
  await requireUser();

  await db.insert(iot_teams).values({
    ...data,
  });

  revalidateAll();
}

export async function updateTeam(id: number, data: TeamFormData) {
  await requireUser();

  await db.update(iot_teams)
    .set({
      ...data,
    })
    .where(eq(iot_teams.id, id));

  revalidateAll();
}

export async function deleteTeam(id: number) {
  await requireUser();

  // First delete all votes related to this team to satisfy foreign key constraint
  await db.delete(votes).where(eq(votes.teamId, id));
  // Then delete the team
  await db.delete(iot_teams).where(eq(iot_teams.id, id));

  revalidateAll();
}
