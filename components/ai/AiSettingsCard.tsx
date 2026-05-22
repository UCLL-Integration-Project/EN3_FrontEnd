"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { safeStorage } from "@context/safeStorage";

type ToggleKey = "cw_ai_share_profile" | "cw_ai_share_stats" | "cw_ai_share_connections";

type ToggleRowProps = {
  storageKey: ToggleKey;
  label: string;
  hint: string;
};

function ToggleRow({ storageKey, label, hint }: ToggleRowProps) {
  const [checked, setChecked] = useState(() => safeStorage.get(storageKey) === "true");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setChecked(val);
    safeStorage.set(storageKey, String(val));
  };

  return (
    <label className="field-row cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="mt-0.5 h-5 w-5 shrink-0 rounded accent-brand-600"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] font-medium text-ink-900">{label}</span>
        <span className="text-[12px] text-ink-500">{hint}</span>
      </span>
    </label>
  );
}

export default function AiSettingsCard() {
  const t = useTranslations("ai");

  return (
    <div className="card flex flex-col gap-4">
      <h5 className="text-[15px] font-semibold text-ink-900">{t("settings.title")}</h5>
      <ToggleRow
        storageKey="cw_ai_share_profile"
        label={t("settings.profile.label")}
        hint={t("settings.profile.hint")}
      />
      <ToggleRow
        storageKey="cw_ai_share_stats"
        label={t("settings.stats.label")}
        hint={t("settings.stats.hint")}
      />
      <ToggleRow
        storageKey="cw_ai_share_connections"
        label={t("settings.connections.label")}
        hint={t("settings.connections.hint")}
      />
    </div>
  );
}
