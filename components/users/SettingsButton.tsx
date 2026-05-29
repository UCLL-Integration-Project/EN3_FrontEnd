"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

export default function SettingsButton() {
  const router = useRouter();
  const t = useTranslations("header");

  return (
    <button onClick={() => router.push("/settings")} aria-label={t("nav.settings")} className="icon-btn">
      <Settings size={22} aria-hidden="true" />
    </button>
  );
}
