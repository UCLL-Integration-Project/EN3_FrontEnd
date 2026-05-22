"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BellRing, BluetoothConnected, Moon, RefreshCw, Vibrate, Watch } from "lucide-react";
import { Toggle } from "./DeviceUI";
import { useDevice } from "@context/DeviceContext";

type PrefKey =
  | "autoConnect"
  | "backgroundSync"
  | "notifications"
  | "haptics"
  | "doNotDisturb";

const PREFERENCES: { key: PrefKey; icon: typeof Watch }[] = [
  { key: "autoConnect", icon: BluetoothConnected },
  { key: "backgroundSync", icon: RefreshCw },
  { key: "notifications", icon: BellRing },
  { key: "haptics", icon: Vibrate },
  { key: "doNotDisturb", icon: Moon },
];

export function PreferencesCard() {
  const t = useTranslations("device");
  const { hapticsEnabled, setHapticsEnabled } = useDevice();
  const [prefs, setPrefs] = useState<Record<Exclude<PrefKey, "haptics">, boolean>>({
    autoConnect: true,
    backgroundSync: true,
    notifications: true,
    doNotDisturb: false,
  });

  function togglePref(key: PrefKey) {
    if (key === "haptics") {
      setHapticsEnabled(!hapticsEnabled);
    } else {
      setPrefs((p) => ({ ...p, [key]: !p[key as Exclude<PrefKey, "haptics">] }));
    }
  }

  function prefValue(key: PrefKey): boolean {
    if (key === "haptics") return hapticsEnabled;
    return prefs[key as Exclude<PrefKey, "haptics">];
  }

  return (
    <div className="card mt-3 py-2">
      {PREFERENCES.map((pref, i) => (
        <button
          key={pref.key}
          onClick={() => togglePref(pref.key)}
          role="switch"
          aria-checked={prefValue(pref.key)}
          className={`flex w-full items-center gap-3 py-3 text-left ${
            i > 0 ? "border-t border-ink-100" : ""
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-500">
            <pref.icon size={17} strokeWidth={2.25} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-medium text-ink-900">
              {t(`manage.prefs.${pref.key}.label`)}
            </span>
            <span className="block text-[12px] text-ink-500">
              {t(`manage.prefs.${pref.key}.hint`)}
            </span>
          </span>
          <Toggle on={prefValue(pref.key)} />
        </button>
      ))}
    </div>
  );
}
