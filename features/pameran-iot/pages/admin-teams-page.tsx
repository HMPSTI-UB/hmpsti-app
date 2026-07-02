import { getAdminTeams } from "../actions/team-actions";
import { getAdminSessions } from "../actions/session-actions";
import { TeamManager } from "../components/team-manager";

export default async function AdminTeamsPage() {
  const teams = await getAdminTeams();
  const sessions = await getAdminSessions();

  return (
    <div className="p-4 md:p-8">
      <TeamManager initialTeams={teams} sessions={sessions} />
    </div>
  );
}
