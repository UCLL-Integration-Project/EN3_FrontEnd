import UserLoginForm from "@components/users/UserLoginForm";
import { GuestGuard } from "@components/auth/RouteGuard";

export default function LoginPage() {
  return (
    <GuestGuard>
      <UserLoginForm />
    </GuestGuard>
  );
}
