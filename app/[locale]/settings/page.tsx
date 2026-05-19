import UserSettingsForm from "@components/users/UserSettingsForm";
import { AuthGuard } from "@components/auth/RouteGuard";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <UserSettingsForm />
    </AuthGuard>
  );
}
