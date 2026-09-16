"use server"

import { db } from "@/db"
import { iot_teams, vote_sessions, votes } from "@/db/schema"
import { eq, sql, ilike, and, count } from "drizzle-orm"
import { requireUser, revalidateAll } from "./_guards"

export type TeamQueryParams = {
  page?: number;
  pageSize?: number | "ALL";
  search?: string;
  className?: string;
  sessionId?: number;
};

export async function getAdminTeams({
  page = 1,
  pageSize = 10,
  search = "",
  className,
  sessionId,
}: TeamQueryParams = {}) {
  // Build WHERE conditions
  const conditions = [];

  if (search) {
    conditions.push(
      sql`(${ilike(iot_teams.title, `%${search}%`)} OR ${ilike(iot_teams.code, `%${search}%`)} OR ${ilike(iot_teams.className, `%${search}%`)})`
    );
  }
  if (className && className !== "ALL") {
    conditions.push(eq(iot_teams.className, className));
  }
  if (sessionId) {
    conditions.push(eq(iot_teams.sessionId, sessionId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Build base query shared by both data + count
  const baseQuery = db
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
      voteCount: sql<number>`count(${votes.id})::int`,
    })
    .from(iot_teams)
    .leftJoin(vote_sessions, eq(iot_teams.sessionId, vote_sessions.id))
    .leftJoin(votes, eq(votes.teamId, iot_teams.id))
    .where(where)
    .groupBy(iot_teams.id, vote_sessions.name)
    .orderBy(iot_teams.code);

  const countQuery = db
    .select({ total: count(iot_teams.id) })
    .from(iot_teams)
    .where(where);

  // Run both queries in parallel
  if (pageSize === "ALL") {
    const [teams, [{ total }]] = await Promise.all([
      baseQuery,
      countQuery,
    ]);
    return { teams, total };
  }

  const offset = (page - 1) * pageSize;
  const [teams, [{ total }]] = await Promise.all([
    baseQuery.limit(pageSize).offset(offset),
    countQuery,
  ]);

  return { teams, total };
}

export async function getDistinctClasses(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ className: iot_teams.className })
    .from(iot_teams)
    .orderBy(iot_teams.className);
  return rows.map((r) => r.className);
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
