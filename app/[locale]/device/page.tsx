import DeviceManager from "@components/device/DeviceManager";
import { AuthGuard, DeviceGuard } from "@components/auth/RouteGuard";

export default function DevicePage() {
  return (
    <AuthGuard>
      <DeviceGuard>
        <DeviceManager />
      </DeviceGuard>
    </AuthGuard>
  );
}
