"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useAuth from "@hooks/useAuth";
import { updatePrivacyRequest } from "@services/UserService";

type ToggleRowProps = {
  testId: string;
  label: string;
  hint: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleRow({ testId, label, hint, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <label className="field-row cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        data-testid={testId}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 rounded accent-brand-600"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] font-medium text-ink-900">{label}</span>
        <span className="text-[12px] text-ink-500">{hint}</span>
      </span>
    </label>
  );
}

export default function PrivacySettingsCard() {
  const t = useTranslations("privacy");
  const { user, updateUser } = useAuth();

  const [saving, setSaving] = useState(false);
  const [shareActivity, setShareActivity] = useState(() => user?.shareActivity ?? false);
  const [shareConnectionCount, setShareConnectionCount] = useState(
    () => user?.shareConnectionCount ?? false
  );

  const handleChange = async (
    field: "shareActivity" | "shareConnectionCount",
    value: boolean
  ) => {
    const newShareActivity = field === "shareActivity" ? value : shareActivity;
    const newShareConnectionCount =
      field === "shareConnectionCount" ? value : shareConnectionCount;

    if (field === "shareActivity") setShareActivity(value);
    else setShareConnectionCount(value);

    setSaving(true);
    try {
      await updatePrivacyRequest({
        shareActivity: newShareActivity,
        shareConnectionCount: newShareConnectionCount,
      });
      updateUser({ shareActivity: newShareActivity, shareConnectionCount: newShareConnectionCount });
    } catch {
      if (field === "shareActivity") setShareActivity(!value);
      else setShareConnectionCount(!value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card flex flex-col gap-4" data-testid="privacy-settings-card">
      <h5 className="text-[15px] font-semibold text-ink-900">{t("title")}</h5>
      <ToggleRow
        testId="share-activity-toggle"
        label={t("shareActivity.label")}
        hint={t("shareActivity.hint")}
        checked={shareActivity}
        disabled={saving}
        onChange={(v) => handleChange("shareActivity", v)}
      />
      <ToggleRow
        testId="share-connection-count-toggle"
        label={t("shareConnectionCount.label")}
        hint={t("shareConnectionCount.hint")}
        checked={shareConnectionCount}
        disabled={saving}
        onChange={(v) => handleChange("shareConnectionCount", v)}
      />
    </div>
  );
}
