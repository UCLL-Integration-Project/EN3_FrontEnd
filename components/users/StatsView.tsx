"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "use-intl";
import { getStatsRequest } from "@services/UserService";
import type { UserStats } from "@types";
import BackButton from "@components/BackButton";

function formatTimeActive(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function StatsView() {
  const t = useTranslations("StatsPage");
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
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <section className="app-screen flex flex-col items-center justify-center gap-4 px-5">
        <div className="self-start pb-2"><BackButton /></div>
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  if (stats === undefined) {
    return null;
  }

  if (stats === null) {
    return (
      <section className="app-screen flex flex-col items-center justify-center gap-4 px-5" data-testid="stats-empty">
        <div className="self-start pb-2"><BackButton /></div>
        <p className="text-xl font-semibold">{t("emptyTitle")}</p>
        <p className="text-sm text-center">{t("emptySubtitle")}</p>
        <a href="/en/connections" className="btn btn-cta">
          {t("exploreConnections")}
        </a>
      </section>
    );
  }

  return (
    <section className="app-screen flex flex-col gap-6 px-5 pt-6">
      <div className="pb-2">
        <BackButton />
      </div>
      <div className="flex flex-col items-center gap-1 card p-4" data-stat="connections">
        <span className="text-3xl font-bold">{stats.connections}</span>
        <span className="text-sm">{t("connections")}</span>
      </div>
      <div className="flex flex-col items-center gap-1 card p-4" data-stat="timeActive">
        <span className="text-3xl font-bold">{formatTimeActive(stats.timeActive)}</span>
        <span className="text-sm">{t("timeActive")}</span>
      </div>
      <div className="flex flex-col items-center gap-1 card p-4" data-stat="dataShared">
        <span className="text-3xl font-bold">{stats.dataShared}</span>
        <span className="text-sm">{t("dataShared")}</span>
      </div>
      <button className="btn btn-ghost mt-auto" data-testid="stats-refresh" onClick={() => setTick((c) => c + 1)}>
        {t("refresh")}
      </button>
    </section>
  );
}
