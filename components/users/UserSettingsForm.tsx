"use client";

import { useTranslations } from "use-intl";
import AppBar from "@components/AppBar";
import ChangePasswordForm from "@components/users/ChangePasswordForm";
import PrivacySettingsCard from "@components/users/PrivacySettingsCard";
import AiSettingsCard from "@components/ai/AiSettingsCard";
import LogoutSection from "@components/users/LogoutSection";
import LanguageChip from "@components/language";

/* Settings = preferences + security + sign-out. Profile editing lives on
 * /profile (use the "Edit profile" chip there). Previously this screen
 * also embedded ProfileForm, creating two places to edit the same data —
 * see audit #8. */
export default function UserSettingsForm() {
  const t = useTranslations("UserSettingsForm");
  const ts = useTranslations("settings");

  return (
    <section className="app-screen p-0">
      <AppBar title={t("title")} />

      <div className="flex flex-col gap-4 px-5 py-5 pb-8">
        <div className="card">
          <h5 className="mb-3">{ts("languageTitle")}</h5>
          <p className="mb-4 text-[13px] text-ink-500">{ts("languageBody")}</p>
          <LanguageChip />
        </div>

        <ChangePasswordForm />

        <PrivacySettingsCard />

        <AiSettingsCard />

        <LogoutSection />
      </div>
    </section>
  );
}
