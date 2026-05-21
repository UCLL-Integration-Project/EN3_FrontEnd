"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Activity,
  ArrowLeft,
  Check,
  CheckCircle2,
  Cpu,
  Hash,
  Pencil,
  Plug,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useDevice } from "@context/DeviceContext";
import { useDeviceWebSocket } from "@hooks/useDeviceWebSocket";
import {
  BatteryCard,
  DeviceHeroCard,
  DeviceInfoCard,
  FirmwareCard,
  ForgetSheet,
  PreferencesCard,
  ReadingsGrid,
} from "./DeviceCards";

const DEVICE = {
  model: "CrossWave",
  serial: "CW-0A91-7F3C",
  mac: "A4:2F:8C:1D:9E:0B",
  pairedSince: "12 May 2026",
  installedFirmware: "2.4.0",
  latestFirmware: "2.4.0",
};

export default function DeviceManager() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("device");
  const { unlinkDevice, deviceIp, setDeviceIp, deviceName, setDeviceName, hapticsEnabled } = useDevice();
  const { isConnected, sensorData, sendCommand, forceReconnect } =
    useDeviceWebSocket(deviceIp);

  const resolvedName = deviceName || t("defaultName");
  const [lastReceivedAt, setLastReceivedAt] = useState<number | null>(null);
  useEffect(() => {
    if (sensorData) setLastReceivedAt(Date.now());
  }, [sensorData]);

  const isStale = lastReceivedAt !== null && Date.now() - lastReceivedAt > 120_000;

  const [editingIp, setEditingIp] = useState(false);
  const [draftIp, setDraftIp] = useState(deviceIp);

  const [note, setNote] = useState<string | null>(null);
  const [showForget, setShowForget] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flash(message: string) {
    setNote(message);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 3200);
  }

  function saveIp() {
    setDeviceIp(draftIp.trim());
    setEditingIp(false);
  }

  function forgetDevice() {
    setShowForget(false);
    unlinkDevice();
    router.replace(`/${locale}/device/setup`);
  }

  const infoRows = [
    { icon: Cpu, label: t("manage.infoModel"), value: DEVICE.model },
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
      {/* App bar */}
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

      {!deviceIp && (
        <button
          className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-secondary-50 px-4 py-3 ring-1 ring-secondary-200 text-left"
          onClick={() => setEditingIp(true)}
        >
          <Wifi size={18} className="shrink-0 text-secondary-600" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-secondary-800">{t("manage.noIpBanner")}</p>
            <p className="text-[11px] text-secondary-600">{t("manage.noIpBannerHint")}</p>
          </div>
          <Pencil size={14} className="shrink-0 text-secondary-500" />
        </button>
      )}

      {note && (
        <div className="status status-success mt-3 animate-sheet-in">
          <CheckCircle2 size={18} />
          {note}
        </div>
      )}

      <DeviceHeroCard
        model={DEVICE.model}
        name={resolvedName}
        isConnected={isConnected}
        lastReceivedAt={lastReceivedAt}
        isStale={isStale}
        onNameChange={setDeviceName}
      />

      <BatteryCard
        battery={sensorData?.batteryPct != null && sensorData.batteryPct >= 0 ? sensorData.batteryPct : null}
        vcc={sensorData?.vcc ?? 0}
        isStale={isStale}
        lastReadingAt={lastReceivedAt}
        flash={flash}
        onSyncDone={() => {}}
        onIdentify={() => hapticsEnabled && sendCommand("BUZZ:")}
      />

      {/* WebSocket connection */}
      <h5 className="mt-6 px-1">{t("manage.connection")}</h5>
      <div className="card mt-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              isConnected
                ? "bg-emerald-50 text-emerald-600"
                : "bg-ink-50 text-ink-400"
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

      {/* Live accelerometer readings */}
      <h5 className="mt-6 px-1">{t("manage.liveReadings")}</h5>
      <ReadingsGrid readings={readings} />

      <h5 className="mt-6 px-1">{t("manage.firmware")}</h5>
      <FirmwareCard
        installed={DEVICE.installedFirmware}
        latest={DEVICE.latestFirmware}
        flash={flash}
      />

      <h5 className="mt-6 px-1">{t("manage.deviceInfo")}</h5>
      <DeviceInfoCard rows={infoRows} />

      <h5 className="mt-6 px-1">{t("manage.preferences")}</h5>
      <PreferencesCard />

      <div className="mt-auto pb-[calc(theme(spacing.6)+env(safe-area-inset-bottom))] pt-10">
        <button
          className="tap w-full rounded-pill bg-red-50 px-5 py-3.5 text-[14px] font-semibold text-red-600 ring-1 ring-red-200 transition-transform duration-100 active:scale-[0.98] active:bg-red-100"
          onClick={() => setShowForget(true)}
        >
          <Trash2 size={16} strokeWidth={2.25} className="mr-2" />
          {t("manage.forget")}
        </button>
      </div>

      {showForget && (
        <ForgetSheet
          name={resolvedName}
          onConfirm={forgetDevice}
          onDismiss={() => setShowForget(false)}
        />
      )}
    </section>
  );
}
