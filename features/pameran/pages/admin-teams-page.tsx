import { getAdminTeams, getDistinctClasses } from "../actions/team-actions";
import { getAdminSessions } from "../actions/session-actions";
import { TeamManager } from "../components/team-manager";

type SearchParams = Record<string, string | string[] | undefined>;

function getString(params: SearchParams, key: string): string {
  const val = params[key];
  return typeof val === "string" ? val : "";
}

export default async function AdminTeamsPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const page = Math.max(1, parseInt(getString(searchParams, "page") || "1", 10));
  const pageSizeRaw = getString(searchParams, "pageSize") || "10";
  const pageSize = pageSizeRaw === "ALL" ? "ALL" : Math.max(1, parseInt(pageSizeRaw, 10));
  const search = getString(searchParams, "search");
  const className = getString(searchParams, "className") || "ALL";
  const sessionIdRaw = getString(searchParams, "sessionId");
  const sessionId = sessionIdRaw ? parseInt(sessionIdRaw, 10) : undefined;

  const [{ teams, total }, sessions, classes] = await Promise.all([
    getAdminTeams({ page, pageSize, search, className, sessionId }),
    getAdminSessions(),
    getDistinctClasses(),
  ]);

  const resolvedPageSize = pageSize === "ALL" ? total : pageSize;
  const totalPages = Math.max(1, Math.ceil(total / (resolvedPageSize || 1)));

  return (
    <div className="p-4 md:p-8">
      <TeamManager
        teams={teams}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSizeRaw}
        sessions={sessions}
        classes={classes}
        currentSearch={search}
        currentClass={className}
        currentSession={sessionIdRaw}
      />
    </div>
  );
}
