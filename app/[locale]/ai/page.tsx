"use client";

import { AuthGuard } from "@components/auth/RouteGuard";
import AiChat from "@components/ai/AiChat";

export default function AiPage() {
  return (
    <AuthGuard>
      <AiChat />
    </AuthGuard>
  );
}
