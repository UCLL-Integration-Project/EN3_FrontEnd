import StatsView from "@components/users/StatsView";
import { AuthGuard } from "@components/auth/RouteGuard";

export default function StatsPage() {
  return (
    <AuthGuard>
      <StatsView />
    </AuthGuard>
  );
}
