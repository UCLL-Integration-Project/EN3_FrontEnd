"use client";

import { ModerationStatus } from "@types";
import { useTranslations } from "next-intl";

export type StatusFilter = ModerationStatus | "ALL";

const OPTIONS: { value: StatusFilter; key: "all" | "active" | "flagged" | "suspended" }[] = [
  { value: "ALL", key: "all" },
  { value: "ACTIVE", key: "active" },
  { value: "FLAGGED", key: "flagged" },
  { value: "SUSPENDED", key: "suspended" },
];

export default function FilterChips({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (next: StatusFilter) => void;
}) {
  const t = useTranslations("admin.members.filter");
  return (
    <div role="radiogroup" aria-label={t("ariaLabel")} className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
              active
                ? "bg-ink-900 text-white ring-ink-900"
                : "bg-white text-ink-600 ring-ink-200 hover:ring-ink-400 active:ring-ink-500"
            }`}
          >
            {t(opt.key)}
          </button>
        );
      })}
    </div>
  );
}
