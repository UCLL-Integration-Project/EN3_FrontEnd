import ConnectionsView from "@components/users/ConnectionsView";
import { AuthGuard } from "@components/auth/RouteGuard";

export default function ConnectionsPage() {
  return (
    <AuthGuard>
      <ConnectionsView />
    </AuthGuard>
  );
}
