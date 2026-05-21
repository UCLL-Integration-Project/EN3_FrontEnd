"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, Vibrate } from "lucide-react";
import { BatteryGlyph } from "./DeviceUI";

interface BatteryCardProps {
  battery: number;
  charging: boolean;
  flash: (msg: string) => void;
  onSyncDone: () => void;
}

export function BatteryCard({ battery, charging, flash, onSyncDone }: BatteryCardProps) {
  const t = useTranslations("device");
  const [syncing, setSyncing] = useState(false);
  const [identifying, setIdentifying] = useState(false);

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
    setTimeout(() => {
      setIdentifying(false);
      flash(t("manage.noteBuzzed"));
    }, 2600);
  }

  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h5>{t("manage.battery")}</h5>
          <p className="mt-1 text-[22px] font-semibold text-ink-900">
            {battery}
            <span className="text-[14px] text-ink-400">%</span>
          </p>
          <p className="text-[12px] text-ink-500">
            {charging ? t("manage.charging") : t("manage.batteryRemaining")}
          </p>
        </div>
        <BatteryGlyph percent={battery} charging={charging} />
      </div>

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
