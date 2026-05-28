"use client";

import DeviceSetup from "@components/device/DeviceSetup";
import { AuthGuard, SetupGuard } from "@components/auth/RouteGuard";

export default function DeviceSetupPage() {
  return (
    <AuthGuard>
      <SetupGuard>
        <DeviceSetup />
      </SetupGuard>
    </AuthGuard>
  );
}
