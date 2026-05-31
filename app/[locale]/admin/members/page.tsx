"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminMemberSummary, Page } from "@types";
import { listMembersRequest } from "@services/AdminService";
import AppBar from "@components/AppBar";
import MemberRow from "@components/admin/members/MemberRow";
import FilterChips, {
  StatusFilter,
} from "@components/admin/members/FilterChips";
import MembersSearch from "@components/admin/members/MembersSearch";

const PAGE_SIZE = 20;

/* State (search / status / page) lives in the URL so the detail view can
   send the user back here with the same filters preserved — see #9528. */
export default function AdminMembersPage() {
  const t = useTranslations("admin.members");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const search = sp.get("search") ?? "";
  const status = (sp.get("status") as StatusFilter | null) ?? "ALL";
  const page = Math.max(0, Number(sp.get("page") ?? "0"));

  const [data, setData] = useState<Page<AdminMemberSummary> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = data?.totalElements ?? 0;
  const isEmpty = !isLoading && data && data.empty;
  const ret = sp.toString(); // forwarded to the detail page so Back can restore the list

  // Update URL params; resets `page` to 0 when filters change unless the
  // caller explicitly keeps it (used by Prev/Next).
  const setParams = useCallback(
    (
      next: { search?: string; status?: StatusFilter; page?: number },
      keepPage = false,
    ) => {
      const params = new URLSearchParams(sp.toString());
      const apply = (
        key: string,
        value: string | undefined | null,
        omit: (v: string) => boolean,
      ) => {
        if (value === undefined) return;
        if (value === null || omit(value)) params.delete(key);
        else params.set(key, value);
      };
      apply("search", next.search, (v) => v === "");
      apply("status", next.status, (v) => v === "ALL");
      apply(
        "page",
        next.page !== undefined ? String(next.page) : undefined,
        (v) => v === "0",
      );
      if (
        !keepPage &&
        (next.search !== undefined || next.status !== undefined)
      ) {
        params.delete("page");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, sp],
  );

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

  return (
    <section className="app-screen p-0">
      <AppBar title={t("title")} backHref={`/admin`} />

      <div className="px-5 pt-4 space-y-3">
        <MembersSearch
          value={search}
          onChange={(v) => setParams({ search: v })}
        />
        <FilterChips
          value={status}
          onChange={(v) => setParams({ status: v })}
        />
        {!isLoading && data && (
          <p className="text-xs text-ink-500">
            {t("results.count", { count: total })}
          </p>
        )}
      </div>

      <div className="px-5 pb-8">
        {error && (
          <p role="alert" className="status-error mt-4">
            {t.has(`errors.${error}`)
              ? t(`errors.${error}` as never)
              : t("errors.UNKNOWN_ERROR")}
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
              <li key={m.id}>
                <Link
                  href={`/admin/members/${m.id}${ret ? `?ret=${encodeURIComponent(ret)}` : ""}`}
                  className="block no-underline"
                >
                  <MemberRow member={m} />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {data && !data.empty && data.totalPages > 1 && (
          <p className="mt-4 text-xs text-ink-400 text-center">
            {t("pagination.hint", {
              current: data.number + 1,
              total: data.totalPages,
            })}
          </p>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <nav
          className="action-dock flex items-center justify-between px-5"
          aria-label={t("pagination.ariaLabel")}
        >
          <button
            className="btn-ghost flex items-center gap-1"
            onClick={() => setParams({ page: Math.max(0, page - 1) }, true)}
            disabled={data.first}
            aria-label={t("pagination.previous")}
          >
            <ChevronLeft size={16} strokeWidth={2.25} aria-hidden />
            {t("pagination.previous")}
          </button>
          <span className="text-xs text-ink-500">
            {t("pagination.page", {
              current: data.number + 1,
              total: data.totalPages,
            })}
          </span>
          <button
            className="btn-ghost flex items-center gap-1"
            onClick={() => setParams({ page: page + 1 }, true)}
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
