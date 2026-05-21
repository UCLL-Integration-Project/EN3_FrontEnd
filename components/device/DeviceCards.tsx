"use client";

/**
 * Sub-components for the device management screen.
 * Each card owns the UI and local state for one section.
 * They surface user-visible notifications via the `flash` callback prop.
 */

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BellRing,
  BluetoothConnected,
  Check,
  CheckCircle2,
  Download,
  Moon,
  Pencil,
  RefreshCw,
  Trash2,
  Vibrate,
  Watch,
  WifiOff,
  X,
} from "lucide-react";
import { BatteryGlyph, SignalBars, Toggle } from "./DeviceUI";

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

// ── Pager device icon ─────────────────────────────────────────────────────────

function PagerIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <rect x="4" y="8.5" width="11" height="7" rx="1" />
      <circle cx="19.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="19.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ── DeviceHeroCard ────────────────────────────────────────────────────────────

interface HeroProps {
  model: string;
  isConnected: boolean;
  lastReceivedAt: number | null;
  onNameChange?: (name: string) => void;
}

export function DeviceHeroCard({ model, isConnected, lastReceivedAt, onNameChange }: HeroProps) {
  const t = useTranslations("device");
  const [name, setName] = useState(() => t("defaultName"));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  function save() {
    const next = draft.trim() || name;
    setName(next);
    setEditing(false);
    onNameChange?.(next);
  }

  function formatElapsed(ts: number): string {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 10) return t("manage.lastSyncJustNow");
    if (sec < 60) return t("manage.lastSyncSecondsAgo", { n: sec });
    const min = Math.floor(sec / 60);
    if (min < 60) return t("manage.lastSyncMinutesAgo", { n: min });
    return `${Math.floor(min / 60)}h`;
  }

  return (
    <div className="mt-4 rounded-sheet bg-brand-gradient p-6 text-white shadow-pop">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
          <PagerIcon size={30} />
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                maxLength={32}
                className="min-w-0 flex-1 rounded-xl bg-white/15 px-3 py-1.5 text-[18px] font-semibold text-white outline-none ring-1 ring-white/40 placeholder:text-white/50"
                placeholder={t("manage.namePlaceholder")}
              />
              <button
                aria-label={t("manage.saveName")}
                onClick={save}
                className="tap h-9 w-9 shrink-0 rounded-pill bg-white/20 active:scale-95"
              >
                <Check size={18} strokeWidth={2.75} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setDraft(name); setEditing(true); }}
              className="flex items-center gap-2 text-left"
            >
              <span className="truncate font-display text-[24px] leading-tight">
                {name}
              </span>
              <Pencil size={15} className="shrink-0 opacity-70" />
            </button>
          )}
          <p className="mt-0.5 text-[13px] text-white/70">{model}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-white/15 pt-4 text-[12px] font-medium text-white/85">
        {isConnected ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {t("manage.signalLive")}
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-white/70">
              <RefreshCw size={13} />
              {lastReceivedAt ? formatElapsed(lastReceivedAt) : "—"}
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5 text-white/60">
              <WifiOff size={13} />
              {t("manage.disconnected")}
            </span>
            {lastReceivedAt && (
              <span className="ml-auto flex items-center gap-1.5 text-white/50">
                <RefreshCw size={13} />
                {formatElapsed(lastReceivedAt)}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── BatteryCard ───────────────────────────────────────────────────────────────

interface BatteryProps {
  battery: number | null;
  charging?: boolean;
  flash: (msg: string) => void;
  onSyncDone: () => void;
  onIdentify?: () => void;
}

export function BatteryCard({ battery, charging = false, flash, onSyncDone, onIdentify }: BatteryProps) {
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
    onIdentify?.();
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
            {battery != null ? (
              <>
                {battery}
                <span className="text-[14px] text-ink-400">%</span>
              </>
            ) : (
              <span className="text-ink-400">—</span>
            )}
          </p>
          <p className="text-[12px] text-ink-500">
            {battery != null
              ? charging
                ? t("manage.charging")
                : t("manage.batteryRemaining")
              : t("manage.batteryUnavailable")}
          </p>
        </div>
        {battery != null && <BatteryGlyph percent={battery} charging={charging} />}
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

// ── ReadingsGrid ──────────────────────────────────────────────────────────────

interface Reading {
  icon: typeof Watch;
  value: string;
  unit: string;
  label: string;
}

export function ReadingsGrid({ readings }: { readings: Reading[] }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2.5">
      {readings.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl bg-white p-3.5 shadow-card ring-1 ring-ink-100"
        >
          <stat.icon size={18} className="text-brand-500" strokeWidth={2.25} />
          <p className="mt-2 text-[17px] font-semibold leading-tight text-ink-900">
            {stat.value}
            {stat.unit && (
              <span className="text-[11px] font-medium text-ink-400"> {stat.unit}</span>
            )}
          </p>
          <p className="text-[11px] text-ink-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── FirmwareCard ──────────────────────────────────────────────────────────────

interface FirmwareProps {
  installed: string;
  latest: string;
  flash: (msg: string) => void;
}

export function FirmwareCard({ installed, latest, flash }: FirmwareProps) {
  const t = useTranslations("device");
  const [fw, setFw] = useState<"available" | "installing" | "current">("available");
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function install() {
    if (fw !== "available") return;
    setFw("installing");
    setProgress(0);
    timer.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null;
          setFw("current");
          flash(t("manage.noteFirmwareUpdated", { version: latest }));
          return 100;
        }
        return p + 5;
      });
    }, 110);
  }

  return (
    <div className="card mt-3">
      {fw === "current" ? (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink-900">
              {t("manage.firmwareUpToDate")}
            </p>
            <p className="text-[12px] text-ink-500">
              {t("manage.firmwareVersion", { version: latest })}
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
                {t("manage.firmwareUpdateAvailable")}
              </p>
              <p className="text-[12px] text-ink-500">
                {installed} → {latest}
              </p>
            </div>
          </div>
          {fw === "installing" ? (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-pill bg-ink-100">
                <div
                  className="h-full rounded-pill bg-brand-gradient transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-center text-[12px] font-medium text-ink-500">
                {t("manage.firmwareInstalling", { progress })}
              </p>
            </div>
          ) : (
            <button className="btn-secondary mt-4 w-full" onClick={install}>
              {t("manage.firmwareInstall")}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── DeviceInfoCard ────────────────────────────────────────────────────────────

interface InfoRow {
  icon: typeof Watch;
  label: string;
  value: string;
}

export function DeviceInfoCard({ rows }: { rows: InfoRow[] }) {
  return (
    <div className="card mt-3 py-2">
      {rows.map((row, i) => (
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
  );
}

// ── PreferencesCard ───────────────────────────────────────────────────────────

export function PreferencesCard() {
  const t = useTranslations("device");
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    autoConnect: true,
    backgroundSync: true,
    notifications: true,
    haptics: false,
    doNotDisturb: false,
  });

  return (
    <div className="card mt-3 py-2">
      {PREFERENCES.map((pref, i) => (
        <button
          key={pref.key}
          onClick={() => setPrefs((p) => ({ ...p, [pref.key]: !p[pref.key] }))}
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
              {t(`manage.prefs.${pref.key}.label`)}
            </span>
            <span className="block text-[12px] text-ink-500">
              {t(`manage.prefs.${pref.key}.hint`)}
            </span>
          </span>
          <Toggle on={prefs[pref.key]} />
        </button>
      ))}
    </div>
  );
}

// ── ForgetSheet ───────────────────────────────────────────────────────────────

interface ForgetSheetProps {
  name: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function ForgetSheet({ name, onConfirm, onDismiss }: ForgetSheetProps) {
  const t = useTranslations("device");
  return (
    <>
      <button
        aria-label={t("manage.dismiss")}
        className="sheet-backdrop"
        onClick={onDismiss}
      />
      <div
        className="sheet-bottom px-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forget-device-title"
      >
        <div className="sheet-grabber" />
        <div className="mt-2 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 size={20} />
          </span>
          <div className="flex-1">
            <h4 id="forget-device-title">{t("manage.forgetTitle", { name })}</h4>
            <p className="mt-1">{t("manage.forgetBody", { name })}</p>
          </div>
          <button aria-label={t("manage.close")} onClick={onDismiss} className="icon-btn">
            <X size={20} />
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            className="tap w-full rounded-pill bg-red-600 px-5 py-3.5 text-[15px] font-semibold text-white shadow-card transition-transform duration-100 active:scale-[0.98] active:bg-red-700"
            onClick={onConfirm}
          >
            {t("manage.forgetConfirm")}
          </button>
          <button className="btn-ghost w-full" onClick={onDismiss}>
            {t("manage.forgetCancel")}
          </button>
        </div>
      </div>
    </>
  );
}
