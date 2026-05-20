"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Activity,
  ArrowLeft,
  BellRing,
  BluetoothConnected,
  Check,
  CheckCircle2,
  Cpu,
  Download,
  Hash,
  MessageSquare,
  Moon,
  Pencil,
  Plug,
  Radio,
  RefreshCw,
  Trash2,
  Vibrate,
  Watch,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useDevice } from "@context/DeviceContext";
import { useDeviceWebSocket } from "@hooks/useDeviceWebSocket";
import { BatteryGlyph, SignalBars, Toggle } from "./DeviceUI";

/* -------------------------------------------------------------------------
 * Companion-device management screen.
 * One companion per account: there is no "add device" — forgetting the
 * current one is the only route to pairing another, and the app needs a
 * linked device to function.
 * Frontend only — every value below is mock state. Wire up the GATT
 * characteristics / backend API where the TODO markers are.
 * All user-visible copy comes from the `device` message catalogue.
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

/* Labels and hints are resolved from the catalogue at render time
   (device.manage.prefs.<key>) — only the key and icon are static. */
const PREFERENCES: { key: PrefKey; icon: typeof Wifi }[] = [
  { key: "autoConnect", icon: BluetoothConnected },
  { key: "backgroundSync", icon: RefreshCw },
  { key: "notifications", icon: BellRing },
  { key: "haptics", icon: Vibrate },
  { key: "doNotDisturb", icon: Moon },
];

export default function DeviceManager() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("device");
  const { unlinkDevice, deviceIp, setDeviceIp } = useDevice();
  const { isConnected, sensorData, sendMessage, forceReconnect } =
    useDeviceWebSocket(deviceIp);

  const [name, setName] = useState(() => t("defaultName"));
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(name);

  const [editingIp, setEditingIp] = useState(false);
  const [draftIp, setDraftIp] = useState(deviceIp);
  const [msgText, setMsgText] = useState("");

  const [battery] = useState(72);
  const [charging] = useState(false);
  const [lastSync, setLastSync] = useState<
    "lastSyncRecent" | "lastSyncJustNow"
  >("lastSyncRecent");

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
  const fwTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear any pending timer/interval if the user leaves mid-operation, so
  // no callback fires state setters on an unmounted component.
  useEffect(
    () => () => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
      if (fwTimer.current) clearInterval(fwTimer.current);
    },
    [],
  );

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
    flash(t("manage.noteNameUpdated"));
  }

  function saveIp() {
    const next = draftIp.trim();
    setDeviceIp(next);
    setEditingIp(false);
  }

  function handleSendMessage() {
    const text = msgText.trim();
    if (!text) return;
    sendMessage(text);
    flash(t("manage.messageSent"));
  }

  function syncNow() {
    if (syncing) return;
    setSyncing(true);
    // TODO: trigger a real sync over the GATT connection.
    setTimeout(() => {
      setSyncing(false);
      setLastSync("lastSyncJustNow");
      flash(t("manage.noteSyncComplete"));
    }, 1800);
  }

  function identify() {
    if (identifying) return;
    setIdentifying(true);
    // TODO: write to the device's "identify" characteristic.
    setTimeout(() => {
      setIdentifying(false);
      flash(t("manage.noteBuzzed"));
    }, 2600);
  }

  function installFirmware() {
    if (fw !== "available") return;
    setFw("installing");
    setFwProgress(0);
    // TODO: stream the firmware image to the device.
    fwTimer.current = setInterval(() => {
      setFwProgress((p) => {
        if (p >= 100) {
          if (fwTimer.current) clearInterval(fwTimer.current);
          fwTimer.current = null;
          setFw("current");
          flash(
            t("manage.noteFirmwareUpdated", {
              version: DEVICE.latestFirmware,
            }),
          );
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
    { icon: Watch, label: t("manage.infoModel"), value: DEVICE.model },
    { icon: Hash, label: t("manage.infoSerial"), value: DEVICE.serial },
    { icon: Cpu, label: t("manage.infoMac"), value: DEVICE.mac },
    { icon: Plug, label: t("manage.infoPaired"), value: DEVICE.pairedSince },
  ];

  const readings = [
    {
      icon: Activity,
      value: sensorData ? sensorData.ax.toFixed(3) : "—",
      unit: sensorData ? "g" : "",
      label: t("manage.readingAccelX"),
    },
    {
      icon: Activity,
      value: sensorData ? sensorData.ay.toFixed(3) : "—",
      unit: sensorData ? "g" : "",
      label: t("manage.readingAccelY"),
    },
    {
      icon: Activity,
      value: sensorData ? sensorData.az.toFixed(3) : "—",
      unit: sensorData ? "g" : "",
      label: t("manage.readingAccelZ"),
    },
  ];

  return (
    <section className="app-screen">
      {/* In-screen app bar */}
      <div className="flex items-center gap-3 pt-safe-t">
        <Link
          href={`/${locale}`}
          aria-label={t("common.back")}
          className="back-btn flex items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={2.25} />
        </Link>
        <h4 className="flex-1">{t("manage.title")}</h4>
        <span
          className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12px] font-semibold ring-1 ${
            isConnected
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-ink-100 text-ink-500 ring-ink-200"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-ink-400"}`}
          />
          {isConnected ? t("manage.connected") : t("manage.disconnected")}
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
                  placeholder={t("manage.namePlaceholder")}
                />
                <button
                  aria-label={t("manage.saveName")}
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
            {t("manage.bluetooth")}
          </span>
          <span className="flex items-center gap-1.5">
            <SignalBars level={3} light />
            {t("manage.signalStrong")}
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-white/70">
            <RefreshCw size={13} />
            {t(`manage.${lastSync}`)}
          </span>
        </div>
      </div>

      {/* Battery + quick actions */}
      <div className="card mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h5>{t("manage.battery")}</h5>
            <p className="mt-1 text-[22px] font-semibold text-ink-900">
              {battery}
              <span className="text-[14px] text-ink-400">%</span>
            </p>
            <p className="text-[12px] text-ink-500">
              {charging
                ? t("manage.charging")
                : t("manage.batteryRemaining")}
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
            {syncing ? t("manage.syncing") : t("manage.syncNow")}
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
            {identifying ? t("manage.identifying") : t("manage.identify")}
          </button>
        </div>
      </div>

      {/* Device connection */}
      <h5 className="mt-6 px-1">{t("manage.connection")}</h5>
      <div className="card mt-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              isConnected ? "bg-emerald-50 text-emerald-600" : "bg-ink-50 text-ink-400"
            }`}
          >
            {isConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
          </span>
          <div className="min-w-0 flex-1">
            {editingIp ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={draftIp}
                  onChange={(e) => setDraftIp(e.target.value)}
                  onBlur={saveIp}
                  onKeyDown={(e) => e.key === "Enter" && saveIp()}
                  inputMode="decimal"
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="192.168.1.x"
                  className="min-w-0 flex-1 rounded-xl bg-ink-50 px-3 py-1.5 text-[15px] font-semibold text-ink-900 outline-none ring-1 ring-ink-300 placeholder:text-ink-400 focus:ring-brand-400"
                />
                <button
                  aria-label={t("manage.saveIp")}
                  onClick={saveIp}
                  className="tap h-9 w-9 shrink-0 rounded-pill bg-brand-500 text-white active:scale-95"
                >
                  <Check size={18} strokeWidth={2.75} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setDraftIp(deviceIp);
                  setEditingIp(true);
                }}
                className="flex items-center gap-2 text-left"
              >
                <span className="truncate text-[14px] font-semibold text-ink-900">
                  {deviceIp || t("manage.noIp")}
                </span>
                <Pencil size={13} className="shrink-0 text-ink-400" />
              </button>
            )}
            <p className="mt-0.5 text-[12px] text-ink-500">
              {isConnected ? t("manage.wsConnected") : t("manage.wsDisconnected")}
            </p>
          </div>
        </div>
        {!deviceIp && (
          <p className="mt-3 text-[12px] text-ink-500">{t("manage.ipHint")}</p>
        )}
        {deviceIp && !isConnected && (
          <button className="btn-secondary mt-4 w-full" onClick={forceReconnect}>
            <RefreshCw size={15} strokeWidth={2.5} />
            {t("manage.reconnect")}
          </button>
        )}
      </div>

      {/* Live readings */}
      <h5 className="mt-6 px-1">{t("manage.liveReadings")}</h5>
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

      {/* RF messages */}
      <div className="card mt-3">
        <div className="flex items-center gap-2.5">
          <Radio size={17} className="text-brand-500" strokeWidth={2.25} />
          <h5 className="flex-1">{t("manage.rfMessages")}</h5>
          {sensorData && (
            <span className="rounded-pill bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-500">
              {sensorData.rfCount}
            </span>
          )}
        </div>
        {sensorData && sensorData.rfMessages.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {sensorData.rfMessages.map((m, i) => (
              <li
                key={i}
                className="rounded-xl bg-ink-50 px-3 py-2 font-mono text-[12px] text-ink-700"
              >
                {m}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[13px] text-ink-500">{t("manage.noRfMessages")}</p>
        )}
      </div>

      {/* Send message to device */}
      <h5 className="mt-6 px-1">{t("manage.messageSection")}</h5>
      <div className="card mt-3">
        <div className="flex items-center gap-2.5">
          <MessageSquare size={17} className="text-brand-500" strokeWidth={2.25} />
          <p className="text-[13px] text-ink-600">{t("manage.messageHint")}</p>
        </div>
        <textarea
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          placeholder={t("manage.messagePlaceholder")}
          rows={3}
          className="mt-3 w-full resize-none rounded-xl bg-ink-50 px-3 py-2.5 text-[14px] text-ink-900 outline-none ring-1 ring-ink-200 placeholder:text-ink-400 focus:ring-brand-400"
        />
        <button
          className="btn-cta mt-3 w-full"
          onClick={handleSendMessage}
          disabled={!msgText.trim() || !isConnected}
        >
          {t("manage.messageSend")}
        </button>
        {sensorData?.customMsg && (
          <div className="mt-3 rounded-xl bg-brand-50 px-3 py-2.5 ring-1 ring-brand-200">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-500">
              {t("manage.messageCurrent")}
            </p>
            <p className="mt-0.5 text-[13px] text-ink-900">{sensorData.customMsg}</p>
          </div>
        )}
      </div>

      {/* Firmware */}
      <h5 className="mt-6 px-1">{t("manage.firmware")}</h5>
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
                {t("manage.firmwareVersion", {
                  version: DEVICE.latestFirmware,
                })}
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
                  {t("manage.firmwareInstalling", { progress: fwProgress })}
                </p>
              </div>
            ) : (
              <button
                className="btn-secondary mt-4 w-full"
                onClick={installFirmware}
              >
                {t("manage.firmwareInstall")}
              </button>
            )}
          </>
        )}
      </div>

      {/* Device info */}
      <h5 className="mt-6 px-1">{t("manage.deviceInfo")}</h5>
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
      <h5 className="mt-6 px-1">{t("manage.preferences")}</h5>
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

      {/* Danger zone — plain footer, not a sticky dock, so it never
          hovers over the content while scrolling. */}
      <div className="mt-auto pt-10 pb-[calc(theme(spacing.6)+env(safe-area-inset-bottom))]">
        <button
          className="tap w-full rounded-pill bg-red-50 px-5 py-3.5 text-[14px] font-semibold text-red-600 ring-1 ring-red-200 transition-transform duration-100 active:scale-[0.98] active:bg-red-100"
          onClick={() => setShowForget(true)}
        >
          <Trash2 size={16} strokeWidth={2.25} className="mr-2" />
          {t("manage.forget")}
        </button>
      </div>

      {/* Forget confirmation sheet */}
      {showForget && (
        <>
          <button
            aria-label={t("manage.dismiss")}
            className="sheet-backdrop"
            onClick={() => setShowForget(false)}
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
                <h4 id="forget-device-title">
                  {t("manage.forgetTitle", { name })}
                </h4>
                <p className="mt-1">{t("manage.forgetBody", { name })}</p>
              </div>
              <button
                aria-label={t("manage.close")}
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
                {t("manage.forgetConfirm")}
              </button>
              <button
                className="btn-ghost w-full"
                onClick={() => setShowForget(false)}
              >
                {t("manage.forgetCancel")}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
