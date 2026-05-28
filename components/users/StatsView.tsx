"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "use-intl";
import { getStatsRequest } from "@services/UserService";
import type { UserStats } from "@types";
import AppBar from "@components/AppBar";

function formatTimeActive(minutes: number): string {
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

  useEffect(() => {
    let cancelled = false;
    getStatsRequest()
      .then((data) => {
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError(t("loadError"));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  if (stats === undefined && !error) return null;

  return (
    <section className="app-screen p-0">
      <AppBar title={t("title")} showBack={false} />

      <div className="flex flex-col gap-4 px-5 py-5 pb-8">
        {error && (
          <div role="alert" className="status status-error">
            <span>{error}</span>
          </div>
        )}

        {stats === null && !error && (
          <div
            data-testid="stats-empty"
            className="card flex flex-col items-center gap-3 py-10 text-center"
          >
            <p className="text-xl font-semibold">{t("emptyTitle")}</p>
            <p className="text-sm">{t("emptySubtitle")}</p>
            <Link href={`/${locale}/connections`} className="btn no-underline">
              {t("exploreConnections")}
            </Link>
          </div>
        )}

        {stats && (
          <>
            <div className="card flex flex-col items-center gap-1 p-6" data-stat="connections">
              <span className="text-3xl font-bold">{stats.connections}</span>
              <span className="text-sm text-ink-500">{t("connections")}</span>
            </div>
            <div className="card flex flex-col items-center gap-1 p-6" data-stat="timeActive">
              <span className="text-3xl font-bold">{formatTimeActive(stats.timeActive)}</span>
              <span className="text-sm text-ink-500">{t("timeActive")}</span>
            </div>
            <div className="card flex flex-col items-center gap-1 p-6" data-stat="dataShared">
              <span className="text-3xl font-bold">{stats.dataShared}</span>
              <span className="text-sm text-ink-500">{t("dataShared")}</span>
            </div>
            <button
              type="button"
              className="btn-ghost"
              data-testid="stats-refresh"
              onClick={() => setTick((c) => c + 1)}
            >
              {t("refresh")}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
