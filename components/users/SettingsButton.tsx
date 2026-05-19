"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

export default function SettingsButton() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("header");

  return (
    <button
      onClick={() => router.push(`/${locale}/settings`)}
      aria-label={t("nav.settings")}
      className="icon-btn"
    >
      <Settings size={22} aria-hidden="true" />
    </button>
  );
}
