"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdminMemberSummary, Page } from "@types";
import { listMembersRequest } from "@services/AdminService";
import MemberRow from "@components/admin/members/MemberRow";
import FilterChips, { StatusFilter } from "@components/admin/members/FilterChips";
import MembersSearch from "@components/admin/members/MembersSearch";

const PAGE_SIZE = 20;

export default function AdminMembersPage() {
  const t = useTranslations("admin.members");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<AdminMemberSummary> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset to first page whenever the filters change.
  useEffect(() => setPage(0), [search, status]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    listMembersRequest({ search, status, page, size: PAGE_SIZE })
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
  }, [search, status, page]);

  const total = data?.totalElements ?? 0;
  const isEmpty = !isLoading && data && data.empty;

  return (
    <section className="app-screen">
      <header className="space-y-3">
        <h2>{t("title")}</h2>
        <MembersSearch value={search} onChange={setSearch} />
        <FilterChips value={status} onChange={setStatus} />
        {!isLoading && data && (
          <p className="text-xs text-ink-500">
            {t("results.count", { count: total })}
          </p>
        )}
      </header>

      {error && (
        <p role="alert" className="status-error mt-4">
          {t.has(`errors.${error}`) ? t(`errors.${error}` as never) : t("errors.UNKNOWN_ERROR")}
        </p>
      )}

      {isEmpty && (
        <div className="mt-8 text-center">
          <h3>{t("empty.title")}</h3>
          <p className="mt-1 text-sm text-ink-500">{t("empty.subtitle")}</p>
        </div>
      )}

      {data && !data.empty && (
        <ul className="mt-4 space-y-2">
          {data.content.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <nav
          className="action-dock flex items-center justify-between"
          aria-label={t("pagination.ariaLabel")}
        >
          <button
            className="btn-ghost flex items-center gap-1"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={data.first}
            aria-label={t("pagination.previous")}
          >
            <ChevronLeft size={16} strokeWidth={2.25} aria-hidden />
            {t("pagination.previous")}
          </button>
          <span className="text-xs text-ink-500">
            {t("pagination.page", { current: data.number + 1, total: data.totalPages })}
          </span>
          <button
            className="btn-ghost flex items-center gap-1"
            onClick={() => setPage((p) => p + 1)}
            disabled={data.last}
            aria-label={t("pagination.next")}
          >
            {t("pagination.next")}
            <ChevronRight size={16} strokeWidth={2.25} aria-hidden />
          </button>
        </nav>
      )}
    </section>
  );
}
