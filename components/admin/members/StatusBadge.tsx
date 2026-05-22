"use client";

import { Status } from "@types";
import { useTranslations } from "next-intl";

/* Pill matching the mockup's status colours:
   ACTIVE   = brand green        FLAGGED  = secondary orange
   SUSPENDED = ink-error red */
const STYLES: Record<Status, string> = {
  ACTIVE: "bg-brand-100 text-brand-700 ring-1 ring-brand-200",
  FLAGGED: "bg-secondary-100 text-secondary-700 ring-1 ring-secondary-200",
  SUSPENDED: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

export default function StatusBadge({ status }: { status: Status }) {
  const t = useTranslations("admin.members.filter");
  const label =
    status === "ACTIVE" ? t("active") : status === "FLAGGED" ? t("flagged") : t("suspended");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STYLES[status]}`}
    >
      {label}
    </span>
  );
}
