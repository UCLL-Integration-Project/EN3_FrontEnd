"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "use-intl";
import { Activity, Clock, RefreshCw, Users } from "lucide-react";
import { getStatsRequest } from "@services/UserService";
import type { UserStats } from "@types";
import AppBar from "@components/AppBar";

function formatTimeActive(minutes: number): string {
  if (minutes === 0) return "—";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function StatsView() {
  const t = useTranslations("StatsPage");
  const locale = useLocale();
  const [stats, setStats] = useState<UserStats | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsRefreshing(true);
    getStatsRequest()
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError(t("loadError"));
      })
      .finally(() => {
        if (!cancelled) setIsRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return (
    <section className="app-screen p-0">
      <AppBar title={t("title")} showBack={false} />

      <div className="flex flex-col gap-4 px-5 py-5 pb-8">
        {error && (
          <div role="alert" className="status status-error">
            <span>{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {stats === undefined && !error && (
          <div data-testid="stats-loading" className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="card h-32 animate-pulse bg-ink-50" />
              <div className="card h-32 animate-pulse bg-ink-50" />
            </div>
            <div className="card h-32 animate-pulse bg-ink-50" />
          </div>
        )}

        {/* Empty state */}
        {stats === null && !error && (
          <div
            data-testid="stats-empty"
            className="card flex flex-col items-center gap-3 py-10 text-center"
          >
            <p className="text-xl font-semibold">{t("emptyTitle")}</p>
            <p className="text-sm text-ink-500">{t("emptySubtitle")}</p>
            <Link href={`/${locale}/connections`} className="btn no-underline">
              {t("exploreConnections")}
            </Link>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="card flex flex-col items-center gap-2 p-5" data-stat="connections">
                <Users size={22} className="text-brand-600" aria-hidden="true" />
                <span className="text-3xl font-bold text-ink-900">{stats.connections}</span>
                <span className="text-[11px] uppercase tracking-wider text-ink-500">{t("connections")}</span>
              </div>
              <div className="card flex flex-col items-center gap-2 p-5" data-stat="dataShared">
                <Activity size={22} className="text-brand-600" aria-hidden="true" />
                <span className="text-3xl font-bold text-ink-900">{stats.dataShared}</span>
                <span className="text-[11px] uppercase tracking-wider text-ink-500">{t("dataShared")}</span>
                <span className="text-[10px] text-ink-400 text-center">{t("dataSharedHint")}</span>
              </div>
            </div>
            <div className="card flex flex-col items-center gap-2 p-6" data-stat="timeActive">
              <Clock size={22} className="text-brand-600" aria-hidden="true" />
              <span className="text-3xl font-bold text-ink-900">{formatTimeActive(stats.timeActive)}</span>
              <span className="text-[11px] uppercase tracking-wider text-ink-500">{t("timeActive")}</span>
              <span className="text-[10px] text-ink-400">{t("timeActiveHint")}</span>
            </div>
            <button
              type="button"
              className="btn-ghost flex items-center justify-center gap-2"
              data-testid="stats-refresh"
              onClick={() => setTick((c) => c + 1)}
            >
              <RefreshCw
                size={15}
                aria-hidden="true"
                className={isRefreshing ? "animate-spin" : ""}
              />
              {t("refresh")}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
