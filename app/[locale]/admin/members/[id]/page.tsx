"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminMemberDetail } from "@types";
import { getMemberRequest } from "@services/AdminService";
import MemberDetailHero from "@components/admin/members/MemberDetailHero";
import ReadOnlyField from "@components/admin/members/ReadOnlyField";

function formatLong(iso: string | null | undefined, locale: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(d);
}

export default function AdminMemberDetailPage() {
  const t = useTranslations("admin.members.detail");
  const locale = useLocale();
  const params = useParams();
  const sp = useSearchParams();

  const idParam = params?.id;
  const id = typeof idParam === "string" ? Number(idParam) : NaN;
  const ret = sp.get("ret") ?? "";
  const backHref = `/${locale}/admin/members${ret ? `?${ret}` : ""}`;

  const [data, setData] = useState<AdminMemberDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setError("USER_NOT_FOUND");
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getMemberRequest(id)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "UNKNOWN_ERROR");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <section className="app-screen">
      <header className="flex items-center gap-2">
        <Link
          href={backHref}
          className="btn-ghost inline-flex items-center gap-1"
          aria-label={t("back")}
        >
          <ChevronLeft size={16} strokeWidth={2.25} aria-hidden />
          {t("back")}
        </Link>
        <h2 className="ml-auto">{t("title")}</h2>
      </header>

      {error && (
        <p role="alert" className="status-error mt-4">
          {t.has(`errors.${error}`) ? t(`errors.${error}` as never) : t("errors.UNKNOWN_ERROR")}
        </p>
      )}

      {!error && data && (
        <>
          <div className="mt-4">
            <MemberDetailHero member={data} />
          </div>
          <dl className="card mt-4 px-4 py-2">
            <ReadOnlyField label={t("fields.display")} value={data.displayName} />
            <ReadOnlyField label={t("fields.username")} value={`@${data.username}`} />
            <ReadOnlyField label={t("fields.bio")} value={data.bio} />
            <ReadOnlyField label={t("fields.joined")} value={formatLong(data.joinedAt, locale)} />
            <ReadOnlyField
              label={t("fields.lastSeen")}
              value={formatLong(data.lastSeenAt, locale) ?? t("lastSeenNever")}
            />
          </dl>
        </>
      )}

      {isLoading && !data && !error && (
        <p className="mt-4 text-sm text-ink-500">…</p>
      )}
    </section>
  );
}
