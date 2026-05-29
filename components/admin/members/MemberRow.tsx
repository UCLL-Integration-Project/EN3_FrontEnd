"use client";

import { AdminMemberSummary } from "@types";
import { useLocale, useTranslations } from "next-intl";
import StatusBadge from "./StatusBadge";

function initials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatJoined(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(d);
}

export default function MemberRow({ member }: { member: AdminMemberSummary }) {
  const t = useTranslations("admin.members");
  const locale = useLocale();
  return (
    <article className="card flex items-center gap-3 px-3 py-3">
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700"
      >
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          initials(member.displayName)
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-ink-800">{member.displayName}</p>
          <StatusBadge status={member.status} />
        </div>
        <p className="truncate text-xs text-ink-500">{member.email}</p>
      </div>
      <p className="shrink-0 text-right text-[11px] uppercase tracking-wide text-ink-400">
        {t("joined")}
        <br />
        <span className="text-xs font-semibold text-ink-600">{formatJoined(member.joinedAt, locale)}</span>
      </p>
    </article>
  );
}
