"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, Vibrate } from "lucide-react";
import { BatteryGlyph } from "./DeviceUI";

interface BatteryProps {
  battery: number | null;  // 0-100, null = unavailable
  vcc: number;             // supply voltage in volts, 0 = unavailable
  isStale: boolean;
  lastReadingAt: number | null;
  charging?: boolean;
  flash: (msg: string) => void;
  onSyncDone: () => void;
  onIdentify?: () => void;
}

export function BatteryCard({ battery, vcc, isStale, lastReadingAt, charging = false, flash, onSyncDone, onIdentify }: BatteryProps) {
  const t = useTranslations("device");
  const [syncing, setSyncing] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [elapsed, setElapsed] = useState<string | null>(null);
  useEffect(() => {
    if (lastReadingAt === null) { setElapsed(null); return; }
    const update = () => setElapsed(formatElapsed(lastReadingAt));
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastReadingAt]);

  function syncNow() {
    if (syncing) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      onSyncDone();
      flash(t("manage.noteSyncComplete"));
    }, 1800);
  }

  function identify() {
    if (identifying) return;
    setIdentifying(true);
    onIdentify?.();
    setTimeout(() => {
      setIdentifying(false);
      flash(t("manage.noteBuzzed"));
    }, 2600);
  }

  const hasBattery = battery != null && battery >= 0;
  const hasVcc = !hasBattery && vcc > 0;

  const batteryColor = hasBattery
    ? battery! < 10
      ? "text-red-600"
      : battery! < 20
        ? "text-orange-500"
        : "text-ink-900"
    : "text-ink-900";

  function formatElapsed(ts: number): string {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 10) return t("manage.lastSyncJustNow");
    if (sec < 60) return t("manage.lastSyncSecondsAgo", { n: sec });
    const min = Math.floor(sec / 60);
    if (min < 60) return t("manage.lastSyncMinutesAgo", { n: min });
    return `${Math.floor(min / 60)}h`;
  }

  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h5>{t("manage.battery")}</h5>
          <p className={`mt-1 text-[22px] font-semibold ${batteryColor}`}>
            {hasBattery ? (
              <>
                {battery}
                <span className="text-[14px] text-ink-400">%</span>
              </>
            ) : hasVcc ? (
              <>
                {vcc.toFixed(2)}
                <span className="text-[14px] text-ink-400"> V</span>
              </>
            ) : (
              <span className="text-ink-400">—</span>
            )}
          </p>
          <p className="text-[12px] text-ink-500">
            {hasBattery
              ? battery! < 10
                ? t("manage.batteryVeryLow")
                : battery! < 20
                  ? t("manage.batteryLow")
                  : charging
                    ? t("manage.charging")
                    : t("manage.batteryRemaining")
              : t("manage.batteryUsb")}
          </p>
        </div>
        {hasBattery && <BatteryGlyph percent={battery!} charging={charging} />}
      </div>

      {isStale && lastReadingAt && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
          <p className="text-[12px] text-amber-700">
            {t("manage.staleTooltip", { elapsed: elapsed ?? "—" })}
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2.5">
        <button className="chip flex-1 justify-center" onClick={syncNow} disabled={syncing}>
          <RefreshCw size={15} className={syncing ? "animate-spin" : ""} strokeWidth={2.5} />
          {syncing ? t("manage.syncing") : t("manage.syncNow")}
        </button>
        <button className="chip flex-1 justify-center" onClick={identify} disabled={identifying}>
          <Vibrate size={15} className={identifying ? "animate-pulse" : ""} strokeWidth={2.5} />
          {identifying ? t("manage.identifying") : t("manage.identify")}
        </button>
      </div>
    </div>
  );
}
