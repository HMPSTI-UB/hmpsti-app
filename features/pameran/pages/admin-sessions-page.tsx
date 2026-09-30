import { getAdminSessions } from "../actions/session-actions";
import { SessionManager } from "../components/session-manager";

export default async function AdminSessionsPage() {
  const sessions = await getAdminSessions();

  return (
    <div className="p-8">
      <SessionManager initialSessions={sessions} />
    </div>
  );
}
