import DeviceSetup from "@components/device/DeviceSetup";
import { AuthGuard } from "@components/auth/RouteGuard";

export default function DeviceSetupPage() {
  return (
    <AuthGuard>
      <DeviceSetup />
    </AuthGuard>
  );
}
