import { getVoteRankings } from "../actions/vote-monitor-actions";
import { getAdminSessions } from "../actions/session-actions";
import { VoteMonitor } from "../components/vote-monitor";

export default async function AdminVoteMonitorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const sessionIdStr = params.session as string;
  const sessionId = sessionIdStr && sessionIdStr !== "ALL" ? Number(sessionIdStr) : undefined;
  
  const rankings = await getVoteRankings(sessionId);
  const sessions = await getAdminSessions();

  return (
    <div className="p-4 md:p-8">
      <VoteMonitor rankings={rankings} sessions={sessions} />
    </div>
  );
}
