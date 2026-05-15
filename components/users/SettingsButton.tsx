"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function SettingsButton() {
  const router = useRouter();
  const t = useTranslations("header");

  return (
    <>
      <button
        onClick={() => {
          router.push(`/settings`);
        }}
        aria-label="Settings"
        className="btn"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          settings
        </span>
        <span>{t("nav.settings")}</span>
      </button>
    </>
  );
}
