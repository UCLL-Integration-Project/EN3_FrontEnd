"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ArrowLeft,
  BellRing,
  BluetoothConnected,
  Check,
  CheckCircle2,
  Cpu,
  Download,
  Footprints,
  Hash,
  HeartPulse,
  Moon,
  Pencil,
  Plug,
  RefreshCw,
  Trash2,
  Vibrate,
  Watch,
  Wifi,
  X,
} from "lucide-react";
import { useDevice } from "@context/DeviceContext";
import { BatteryGlyph, SignalBars, Toggle } from "./DeviceUI";

/* -------------------------------------------------------------------------
 * Companion-device management screen.
 * One companion per account: there is no "add device" — forgetting the
 * current one is the only route to pairing another, and the app needs a
 * linked device to function.
 * Frontend only — every value below is mock state. Wire up the GATT
 * characteristics / backend API where the TODO markers are.
 * ---------------------------------------------------------------------- */

const DEVICE = {
  model: "CrossWave Band 2",
  serial: "CW2-0A91-7F3C",
  mac: "A4:2F:8C:1D:9E:0B",
  pairedSince: "12 May 2026",
  installedFirmware: "2.3.1",
  latestFirmware: "2.4.0",
};

type PrefKey =
  | "autoConnect"
  | "backgroundSync"
  | "notifications"
  | "haptics"
  | "doNotDisturb";

type Pref = {
  key: PrefKey;
  label: string;
  hint: string;
  icon: typeof Wifi;
};

const PREFERENCES: Pref[] = [
  {
    key: "autoConnect",
    label: "Auto-connect",
    hint: "Reconnect when in range",
    icon: BluetoothConnected,
  },
  {
    key: "backgroundSync",
    label: "Background sync",
    hint: "Keep readings up to date",
    icon: RefreshCw,
  },
  {
    key: "notifications",
    label: "Push notifications",
    hint: "Alerts from your companion",
    icon: BellRing,
  },
  {
    key: "haptics",
    label: "Haptic alerts",
    hint: "Vibrate on the device",
    icon: Vibrate,
  },
  {
    key: "doNotDisturb",
    label: "Do not disturb",
    hint: "Mute alerts overnight",
    icon: Moon,
  },
];

export default function DeviceManager() {
  const locale = useLocale();
  const router = useRouter();
  const { unlinkDevice } = useDevice();

  const [name, setName] = useState("My Companion");
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(name);

  const [battery] = useState(72);
  const [charging] = useState(false);
  const [lastSync, setLastSync] = useState("2 min ago");

  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    autoConnect: true,
    backgroundSync: true,
    notifications: true,
    haptics: false,
    doNotDisturb: false,
  });

  const [syncing, setSyncing] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [fw, setFw] = useState<"available" | "installing" | "current">(
    "available",
  );
  const [fwProgress, setFwProgress] = useState(0);

  const [note, setNote] = useState<string | null>(null);
  const [showForget, setShowForget] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (noteTimer.current) clearTimeout(noteTimer.current);
  }, []);

  function flash(message: string) {
    setNote(message);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 3200);
  }

  function togglePref(key: PrefKey) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function saveName() {
    const next = draftName.trim() || name;
    setName(next);
    setEditingName(false);
    flash("Device name updated");
  }

  function syncNow() {
    if (syncing) return;
    setSyncing(true);
    // TODO: trigger a real sync over the GATT connection.
    setTimeout(() => {
      setSyncing(false);
      setLastSync("just now");
      flash("Sync complete");
    }, 1800);
  }

  function identify() {
    if (identifying) return;
    setIdentifying(true);
    // TODO: write to the device's "identify" characteristic.
    setTimeout(() => {
      setIdentifying(false);
      flash("Your companion buzzed");
    }, 2600);
  }

  function installFirmware() {
    if (fw !== "available") return;
    setFw("installing");
    setFwProgress(0);
    // TODO: stream the firmware image to the device.
    const id = setInterval(() => {
      setFwProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setFw("current");
          flash(`Updated to firmware ${DEVICE.latestFirmware}`);
          return 100;
        }
        return p + 5;
      });
    }, 110);
  }

  function forgetDevice() {
    // TODO: remove the bond and clear stored credentials.
    setShowForget(false);
    // Unlink the account's device; the app now requires pairing again.
    unlinkDevice();
    router.replace(`/${locale}/device/setup`);
  }

  const infoRows = [
    { icon: Watch, label: "Model", value: DEVICE.model },
    { icon: Hash, label: "Serial number", value: DEVICE.serial },
    { icon: Cpu, label: "MAC address", value: DEVICE.mac },
    { icon: Plug, label: "Paired since", value: DEVICE.pairedSince },
  ];

  return (
    <section className="app-screen">
      {/* In-screen app bar */}
      <div className="flex items-center gap-3 pt-safe-t">
        <Link
          href={`/${locale}`}
          aria-label="Back"
          className="back-btn flex items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={2.25} />
        </Link>
        <h4 className="flex-1">Companion</h4>
        <span className="flex items-center gap-1.5 rounded-pill bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Connected
        </span>
      </div>

      {/* Transient status note */}
      {note && (
        <div className="status status-success mt-3 animate-sheet-in">
          <CheckCircle2 size={18} />
          {note}
        </div>
      )}

      {/* Hero device card */}
      <div className="mt-4 rounded-sheet bg-brand-gradient p-6 text-white shadow-pop">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <Watch size={30} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  maxLength={32}
                  className="min-w-0 flex-1 rounded-xl bg-white/15 px-3 py-1.5 text-[18px] font-semibold text-white outline-none ring-1 ring-white/40 placeholder:text-white/50"
                  placeholder="Device name"
                />
                <button
                  aria-label="Save name"
                  onClick={saveName}
                  className="tap h-9 w-9 shrink-0 rounded-pill bg-white/20 active:scale-95"
                >
                  <Check size={18} strokeWidth={2.75} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setDraftName(name);
                  setEditingName(true);
                }}
                className="flex items-center gap-2 text-left"
              >
                <span className="truncate font-display text-[24px] leading-tight">
                  {name}
                </span>
                <Pencil size={15} className="shrink-0 opacity-70" />
              </button>
            )}
            <p className="mt-0.5 text-[13px] text-white/70">{DEVICE.model}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4 border-t border-white/15 pt-4 text-[12px] font-medium text-white/85">
          <span className="flex items-center gap-1.5">
            <BluetoothConnected size={14} />
            Bluetooth
          </span>
          <span className="flex items-center gap-1.5">
            <SignalBars level={3} light />
            Strong
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-white/70">
            <RefreshCw size={13} />
            {lastSync}
          </span>
        </div>
      </div>

      {/* Battery + quick actions */}
      <div className="card mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h5>Battery</h5>
            <p className="mt-1 text-[22px] font-semibold text-ink-900">
              {battery}
              <span className="text-[14px] text-ink-400">%</span>
            </p>
            <p className="text-[12px] text-ink-500">
              {charging ? "Charging" : "≈ 2 days remaining"}
            </p>
          </div>
          <BatteryGlyph percent={battery} charging={charging} />
        </div>

        <div className="mt-4 flex gap-2.5">
          <button
            className="chip flex-1 justify-center"
            onClick={syncNow}
            disabled={syncing}
          >
            <RefreshCw
              size={15}
              className={syncing ? "animate-spin" : ""}
              strokeWidth={2.5}
            />
            {syncing ? "Syncing…" : "Sync now"}
          </button>
          <button
            className="chip flex-1 justify-center"
            onClick={identify}
            disabled={identifying}
          >
            <Vibrate
              size={15}
              className={identifying ? "animate-pulse" : ""}
              strokeWidth={2.5}
            />
            {identifying ? "Buzzing…" : "Identify"}
          </button>
        </div>
      </div>

      {/* Live readings */}
      <h5 className="mt-6 px-1">Live readings</h5>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {[
          { icon: HeartPulse, value: "68", unit: "bpm", label: "Heart rate" },
          { icon: Footprints, value: "7.4k", unit: "steps", label: "Today" },
          { icon: Moon, value: "7h 12m", unit: "", label: "Last sleep" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white p-3.5 shadow-card ring-1 ring-ink-100"
          >
            <stat.icon size={18} className="text-brand-500" strokeWidth={2.25} />
            <p className="mt-2 text-[17px] font-semibold leading-tight text-ink-900">
              {stat.value}
              {stat.unit && (
                <span className="text-[11px] font-medium text-ink-400">
                  {" "}
                  {stat.unit}
                </span>
              )}
            </p>
            <p className="text-[11px] text-ink-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Firmware */}
      <h5 className="mt-6 px-1">Firmware</h5>
      <div className="card mt-3">
        {fw === "current" ? (
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-ink-900">
                Up to date
              </p>
              <p className="text-[12px] text-ink-500">
                Firmware {DEVICE.latestFirmware}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-600">
                <Download size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-ink-900">
                  Update available
                </p>
                <p className="text-[12px] text-ink-500">
                  {DEVICE.installedFirmware} → {DEVICE.latestFirmware}
                </p>
              </div>
            </div>

            {fw === "installing" ? (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-pill bg-ink-100">
                  <div
                    className="h-full rounded-pill bg-brand-gradient transition-[width] duration-150"
                    style={{ width: `${fwProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-[12px] font-medium text-ink-500">
                  Installing… {fwProgress}% — keep the device nearby
                </p>
              </div>
            ) : (
              <button
                className="btn-secondary mt-4 w-full"
                onClick={installFirmware}
              >
                Install update
              </button>
            )}
          </>
        )}
      </div>

      {/* Device info */}
      <h5 className="mt-6 px-1">Device info</h5>
      <div className="card mt-3 py-2">
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-3 py-3 ${
              i > 0 ? "border-t border-ink-100" : ""
            }`}
          >
            <span className="flex items-center gap-3">
              <row.icon size={17} className="text-ink-400" strokeWidth={2.25} />
              <span className="text-[13px] text-ink-600">{row.label}</span>
            </span>
            <span className="select-text text-[13px] font-semibold text-ink-900">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Preferences */}
      <h5 className="mt-6 px-1">Preferences</h5>
      <div className="card mt-3 py-2">
        {PREFERENCES.map((pref, i) => (
          <button
            key={pref.key}
            onClick={() => togglePref(pref.key)}
            role="switch"
            aria-checked={prefs[pref.key]}
            className={`flex w-full items-center gap-3 py-3 text-left ${
              i > 0 ? "border-t border-ink-100" : ""
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-500">
              <pref.icon size={17} strokeWidth={2.25} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-ink-900">
                {pref.label}
              </span>
              <span className="block text-[12px] text-ink-500">
                {pref.hint}
              </span>
            </span>
            <Toggle on={prefs[pref.key]} />
          </button>
        ))}
      </div>

      {/* Danger zone — plain footer, not a sticky dock, so it never
          hovers over the content while scrolling. */}
      <div className="mt-auto pt-10 pb-[calc(theme(spacing.6)+env(safe-area-inset-bottom))]">
        <button
          className="tap w-full rounded-pill bg-red-50 px-5 py-3.5 text-[14px] font-semibold text-red-600 ring-1 ring-red-200 transition-transform duration-100 active:scale-[0.98] active:bg-red-100"
          onClick={() => setShowForget(true)}
        >
          <Trash2 size={16} strokeWidth={2.25} className="mr-2" />
          Forget this device
        </button>
      </div>

      {/* Forget confirmation sheet */}
      {showForget && (
        <>
          <button
            aria-label="Dismiss"
            className="sheet-backdrop"
            onClick={() => setShowForget(false)}
          />
          <div className="sheet-bottom px-5" role="dialog" aria-modal="true">
            <div className="sheet-grabber" />
            <div className="mt-2 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 size={20} />
              </span>
              <div className="flex-1">
                <h4>Forget {name}?</h4>
                <p className="mt-1">
                  Each account links one companion. Forgetting {name} unlinks
                  it — and since CrossWave needs a linked device, you&apos;ll
                  be taken straight to pairing.
                </p>
              </div>
              <button
                aria-label="Close"
                onClick={() => setShowForget(false)}
                className="icon-btn"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                className="tap w-full rounded-pill bg-red-600 px-5 py-3.5 text-[15px] font-semibold text-white shadow-card transition-transform duration-100 active:scale-[0.98] active:bg-red-700"
                onClick={forgetDevice}
              >
                Forget device
              </button>
              <button
                className="btn-ghost w-full"
                onClick={() => setShowForget(false)}
              >
                Keep paired
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
