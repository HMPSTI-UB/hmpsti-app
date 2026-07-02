import type { getAdminTeams } from "./actions/team-actions";
import type { getAdminSessions } from "./actions/session-actions";
import type { getVoteRankings, getTeamVotes } from "./actions/vote-monitor-actions";
import type { getActiveSession } from "./actions/get-teams";

/**
 * Tipe domain diturunkan langsung dari return type server action, supaya
 * selalu sinkron dengan bentuk query DB — tidak perlu maintain tipe manual,
 * dan tidak ada lagi `any` di boundary komponen.
 */
export type AdminTeam = Awaited<ReturnType<typeof getAdminTeams>>[number];
export type AdminSession = Awaited<ReturnType<typeof getAdminSessions>>[number];
export type VoteRanking = Awaited<ReturnType<typeof getVoteRankings>>[number];
export type TeamVote = Awaited<ReturnType<typeof getTeamVotes>>[number];
export type ActiveSession = Awaited<ReturnType<typeof getActiveSession>>;
