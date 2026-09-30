"use server"

import { db } from "@/db"
import { teams, vote_sessions, votes } from "@/db/schema"
import { eq, sql, ilike, and, count } from "drizzle-orm"
import { requireAdmin, revalidateAll } from "./_guards"

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
      sql`(${ilike(teams.title, `%${search}%`)} OR ${ilike(teams.code, `%${search}%`)} OR ${ilike(teams.className, `%${search}%`)})`
    );
  }
  if (className && className !== "ALL") {
    conditions.push(eq(teams.className, className));
  }
  if (sessionId) {
    conditions.push(eq(teams.sessionId, sessionId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Build base query shared by both data + count
  const baseQuery = db
    .select({
      id: teams.id,
      code: teams.code,
      className: teams.className,
      groupNumber: teams.groupNumber,
      title: teams.title,
      teamMembers: teams.teamMembers,
      bannerImageUrl: teams.bannerImageUrl,
      projectImageUrl: teams.projectImageUrl,
      sessionId: teams.sessionId,
      sessionName: vote_sessions.name,
      voteCount: sql<number>`count(${votes.id})::int`,
    })
    .from(teams)
    .leftJoin(vote_sessions, eq(teams.sessionId, vote_sessions.id))
    .leftJoin(votes, eq(votes.teamId, teams.id))
    .where(where)
    .groupBy(teams.id, vote_sessions.name)
    .orderBy(teams.code);

  const countQuery = db
    .select({ total: count(teams.id) })
    .from(teams)
    .where(where);

  // Run both queries in parallel
  if (pageSize === "ALL") {
    const [teamRows, [{ total }]] = await Promise.all([
      baseQuery,
      countQuery,
    ]);
    return { teams: teamRows, total };
  }

  const offset = (page - 1) * pageSize;
  const [teamRows, [{ total }]] = await Promise.all([
    baseQuery.limit(pageSize).offset(offset),
    countQuery,
  ]);

  return { teams: teamRows, total };
}

export async function getDistinctClasses(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ className: teams.className })
    .from(teams)
    .orderBy(teams.className);
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
  await requireAdmin();

  await db.insert(teams).values({
    ...data,
  });

  revalidateAll();
}

export async function updateTeam(id: number, data: TeamFormData) {
  await requireAdmin();

  await db.update(teams)
    .set({
      ...data,
    })
    .where(eq(teams.id, id));

  revalidateAll();
}

export async function deleteTeam(id: number) {
  await requireAdmin();

  // First delete all votes related to this team to satisfy foreign key constraint
  await db.delete(votes).where(eq(votes.teamId, id));
  // Then delete the team
  await db.delete(teams).where(eq(teams.id, id));

  revalidateAll();
}
