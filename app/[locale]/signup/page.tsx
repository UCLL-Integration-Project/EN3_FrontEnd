import UserSignupForm from "@components/users/UserSignupForm";
import { GuestGuard } from "@components/auth/RouteGuard";

export default function SignupPage() {
  return (
    <GuestGuard>
      <UserSignupForm />
    </GuestGuard>
  );
}
