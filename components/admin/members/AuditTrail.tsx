"use client";

import { AdminAuditEntry } from "@types";
import { useLocale, useTranslations } from "next-intl";

function formatWhen(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

/* The inline audit log on the detail page — the last few moderation
   entries for this member, newest first (#9529). */
export default function AuditTrail({ entries }: { entries: AdminAuditEntry[] }) {
  const t = useTranslations("admin.members.moderation");
  const locale = useLocale();

  return (
    <section className="card mt-4 px-3 py-3">
      <h3 className="px-1 pb-2 text-xs uppercase tracking-wide text-ink-400">
        {t("audit.title")}
      </h3>

      {entries.length === 0 ? (
        <p className="px-1 text-sm text-ink-400">{t("audit.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => (
            <li key={e.id} className="border-b border-ink-100 pb-2 last:border-b-0">
              <p className="text-sm text-ink-700">
                <span className="font-semibold">{e.actorDisplayName}</span>{" "}
                {t(`audit.action.${e.action}`)}
              </p>
              {e.note && <p className="text-xs italic text-ink-500">“{e.note}”</p>}
              <p className="text-[11px] uppercase tracking-wide text-ink-400">
                {formatWhen(e.createdAt, locale)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
