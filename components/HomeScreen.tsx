"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bluetooth, ChevronRight, Cpu, Radio, Send, Settings, Shield, Wifi, WifiOff } from "lucide-react";
import useAuth from "@hooks/useAuth";
import { useDevice } from "@context/DeviceContext";
import { useDeviceWebSocket } from "@hooks/useDeviceWebSocket";
import MultiStatus from "./status/MultiStatus";
import { insightRequest } from "@services/AiService";
import { safeStorage } from "@context/safeStorage";
import AiInsightPopup from "@components/ai/AiInsightPopup";

const FOUR_HOURS = 4 * 60 * 60 * 1000;

/* Home dashboard.
 *
 * Replaces the prior "menu of routes" with a content-first view that
 * surfaces the user's device status and broadcast affordances. Top-level
 * navigation lives in the bottom tab bar; settings/admin live as
 * secondary entries here.
 *
 * When no device is linked, a pairing CTA replaces the device card —
 * the app no longer hard-walls users without hardware. */
export default function HomeScreen() {
  const { user } = useAuth();
  const { deviceLinked, deviceIp, deviceName } = useDevice();
  const { isConnected, sensorData, sendMessage } = useDeviceWebSocket(deviceLinked ? deviceIp : "");

  const [selectedStatusMessage, setSelectedStatusMessage] = useState("");
  const [sentConfirm, setSentConfirm] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const t = useTranslations("home");

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? "greetingMorning" : hour < 18 ? "greetingAfternoon" : "greetingEvening";

  const displayName = user?.firstName?.trim() || user?.username?.trim() || "";
  const resolvedDeviceName = deviceName || t("dashboard.companionTitle");

  useEffect(() => {
    const last = safeStorage.get("cw_last_insight");
    if (last && Date.now() - Number(last) < FOUR_HOURS) return;

    insightRequest()
      .then(({ insight: text }) => {
        if (text) setInsight(text);
      })
      .catch(() => {});
  }, []);

  const handleDismissInsight = () => {
    safeStorage.set("cw_last_insight", String(Date.now()));
    setInsight(null);
  };

  return (
    <section className="app-screen p-0">
      {/* Brand gradient greeting */}
      <div className="bg-brand-gradient px-5 pb-7 pt-[calc(1.25rem+env(safe-area-inset-top))]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/65" suppressHydrationWarning>
              {t(`dashboard.${greetingKey}`)}
            </p>
            <p className="mt-1 text-[26px] font-extrabold tracking-tight text-white">{displayName}</p>
          </div>
          <Link
            href={"/settings"}
            aria-label={t("nav.settings")}
            className="icon-btn -mr-1 mt-0.5 text-white/80 active:text-white"
          >
            <Settings size={22} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-6 pt-5">
        {/* Companion device card — pairing CTA when not linked */}
        {!deviceLinked ? (
          <Link
            href={"/device/setup"}
            className="animate-rise group flex items-center gap-4 rounded-sheet bg-secondary-50 px-4 py-4 shadow-card ring-1 ring-secondary-200 transition-transform duration-100 active:scale-[0.98] no-underline"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary-500 text-white shadow-pop">
              <Bluetooth size={22} strokeWidth={2.25} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-secondary-800">{t("dashboard.pairTitle")}</p>
              <p className="text-[12px] text-secondary-700/80">{t("dashboard.pairSubtitle")}</p>
            </div>
            <ChevronRight size={18} className="text-secondary-500" strokeWidth={2.5} aria-hidden />
          </Link>
        ) : (
          <Link
            href="/device"
            className="animate-rise flex items-center gap-4 rounded-sheet bg-white px-4 py-4 shadow-card ring-1 ring-ink-100 transition-transform duration-100 active:scale-[0.98] no-underline"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Cpu size={22} strokeWidth={2.25} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-ink-900">{resolvedDeviceName}</p>
              <p className="flex items-center gap-1.5 text-[12px] text-ink-500">
                {isConnected ? (
                  <>
                    <Wifi size={12} strokeWidth={2.5} className="text-emerald-500" aria-hidden />
                    <span>{t("dashboard.companionConnected")}</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} strokeWidth={2.5} className="text-ink-400" aria-hidden />
                    <span>{t("dashboard.companionDisconnected")}</span>
                  </>
                )}
              </p>
            </div>
            <ChevronRight size={18} className="text-ink-300" strokeWidth={2.5} aria-hidden />
          </Link>
        )}

        {/* Broadcast + RF — only when device linked */}
        {/* {deviceLinked && ( */}
        <>
          <div>
            <h5 className="mb-2 px-1">{t("dashboard.messageTitle")}</h5>
            {!deviceIp ? (
              <div className="card">
                <p className="mt-2 text-[12px] text-ink-400">{t("dashboard.messageNoDevice")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Replaced textarea with MultiStatus custom component */}
                <MultiStatus onStatusSelected={setSelectedStatusMessage} />

                <button
                  type="button"
                  disabled={!selectedStatusMessage.trim()}
                  onClick={() => {
                    sendMessage(selectedStatusMessage.trim());
                    setSentConfirm(true);
                    setTimeout(() => setSentConfirm(false), 3500);
                  }}
                  className="btn w-full disabled:opacity-40"
                >
                  <Send size={14} strokeWidth={2.25} />
                  {t("dashboard.messageSend")}
                </button>

                {sentConfirm && (
                  <p className="text-center text-[12px] text-emerald-600">{t("dashboard.messageSent")}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <h5 className="mb-2 px-1">{t("dashboard.rfTitle")}</h5>
            <div className="card">
              {!sensorData || sensorData.rfMessages.length === 0 ? (
                <div className="flex items-center gap-3 py-1">
                  <Radio size={18} className="shrink-0 text-ink-300" strokeWidth={2} />
                  <p className="text-[13px] text-ink-400">{t("dashboard.noRfMessages")}</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {sensorData.rfMessages.map((msg, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Radio size={14} className="mt-0.5 shrink-0 text-brand-400" strokeWidth={2} />
                      <span className="text-[13px] text-ink-800">{msg}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
        {/* )} */}

        {/* Admin panel entry — only rendered for admin accounts */}
        {user?.role === "ADMIN" && (
          <div className="flex flex-col gap-2">
            <Link
              href={"/admin"}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-card ring-1 ring-ink-100 transition-transform duration-100 active:scale-[0.98] no-underline"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-600">
                <Shield size={18} strokeWidth={2.25} aria-hidden />
              </span>
              <span className="flex-1 text-[14px] font-semibold text-secondary-700">{t("nav.admin")}</span>
              <ChevronRight size={16} className="text-ink-300" strokeWidth={2.5} aria-hidden />
            </Link>
          </div>
        )}
      </div>

      {/* Proactive insight popup */}
      {insight && <AiInsightPopup insight={insight} onDismiss={handleDismissInsight} />}
    </section>
  );
}
