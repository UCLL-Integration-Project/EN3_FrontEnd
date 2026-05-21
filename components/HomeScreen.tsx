"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  LifeBuoy,
  LogOut,
  MessageSquare,
  Radio,
  Settings,
  Wifi,
} from "lucide-react";
import useAuth from "@hooks/useAuth";
import { useDevice } from "@context/DeviceContext";
import { useDeviceWebSocket } from "@hooks/useDeviceWebSocket";
import LanguageChip from "@components/language";
import { PagerIcon } from "@components/device/DeviceCards";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const t = useTranslations("home.dashboard");
  const tHome = useTranslations("home");
  const tDevice = useTranslations("device");
  const locale = useLocale();
  const router = useRouter();

  const { deviceIp } = useDevice();
  const { isConnected, sensorData, sendMessage } = useDeviceWebSocket(deviceIp);

  const [msgText, setMsgText] = useState("");
  const [sentNote, setSentNote] = useState(false);
  const sentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSendMessage() {
    const text = msgText.trim();
    if (!text || !isConnected) return;
    sendMessage(text);
    setMsgText("");
    setSentNote(true);
    if (sentTimer.current) clearTimeout(sentTimer.current);
    sentTimer.current = setTimeout(() => setSentNote(false), 3000);
  }

  const displayName =
    user?.firstName?.trim() || user?.username?.trim() || t("fallbackName");
  const initial = displayName.charAt(0).toUpperCase();

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12
      ? "greetingMorning"
      : hour < 18
        ? "greetingAfternoon"
        : "greetingEvening";

  const actions = [
    { icon: Settings, label: t("actionSettings"), href: `/${locale}/settings` },
    { icon: LifeBuoy, label: t("actionHelp"), href: `/${locale}` },
  ];

  const lastUpdateTime = sensorData
    ? new Date(sensorData.ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  const readings = sensorData
    ? [
        {
          icon: Activity,
          label: t("readingX"),
          value: sensorData.ax.toFixed(3),
          unit: "g",
          tone: "bg-brand-50 text-brand-600",
        },
        {
          icon: Activity,
          label: t("readingY"),
          value: sensorData.ay.toFixed(3),
          unit: "g",
          tone: "bg-secondary-50 text-secondary-600",
        },
        {
          icon: Activity,
          label: t("readingZ"),
          value: sensorData.az.toFixed(3),
          unit: "g",
          tone: "bg-accent-50 text-accent-600",
        },
        {
          icon: Radio,
          label: t("readingRf"),
          value: String(sensorData.rfCount),
          unit: "",
          tone: "bg-ink-50 text-ink-500",
        },
      ]
    : null;

  return (
    <section className="app-screen bg-wave">
      {/* Greeting header */}
      <div className="flex items-center gap-3 pt-safe-t">
        <div className="min-w-0 flex-1">
          <p
            className="text-[13px] font-medium text-ink-500"
            suppressHydrationWarning
          >
            {t(greetingKey)}
          </p>
          <h3 className="truncate">{displayName}</h3>
        </div>
        <Link
          href={`/${locale}/settings`}
          aria-label={t("actionSettings")}
          className="tap h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-brand-gradient text-[18px] font-bold text-white shadow-pop active:scale-95"
        >
          {initial}
        </Link>
      </div>

      {/* Companion device hero card */}
      <Link
        href={`/${locale}/device`}
        className="mt-5 block rounded-sheet bg-brand-gradient p-5 text-white shadow-pop transition-transform duration-100 active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <PagerIcon size={26} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/65">
              {t("companionTitle")}
            </p>
            <p className="truncate text-[19px] font-bold tracking-tight text-white">
              {tDevice("defaultName")}
            </p>
          </div>
          <ChevronRight size={20} className="shrink-0 text-white/70" />
        </div>
        <div className="mt-4 flex items-center gap-4 border-t border-white/15 pt-3 text-[12px] font-medium text-white/85">
          <span className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-300" : "bg-white/40"}`}
            />
            {isConnected ? t("companionConnected") : t("companionDisconnected")}
          </span>
          <span className="ml-auto text-white/65">
            {lastUpdateTime
              ? t("companionLastUpdate", { time: lastUpdateTime })
              : t("companionManage")}
          </span>
        </div>
      </Link>

      {/* Broadcast message — main product feature */}
      <div className="mt-5 rounded-sheet bg-white p-5 shadow-card ring-1 ring-ink-100">
        <div className="flex items-center gap-2.5">
          <MessageSquare size={18} className="text-brand-500" strokeWidth={2.25} />
          <h5 className="flex-1">{t("messageTitle")}</h5>
        </div>
        <p className="mt-1 text-[12px] text-ink-500">{t("messageSubtitle")}</p>
        <textarea
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={t("messagePlaceholder")}
          rows={3}
          className="mt-3 w-full resize-none rounded-xl bg-ink-50 px-3 py-2.5 text-[14px] text-ink-900 outline-none ring-1 ring-ink-200 placeholder:text-ink-400 focus:ring-brand-400"
        />
        <button
          className="btn-cta mt-3 w-full"
          onClick={handleSendMessage}
          disabled={!msgText.trim() || !isConnected}
        >
          {t("messageSend")}
        </button>
        {sentNote && (
          <div className="mt-3 flex items-center gap-2 text-[13px] font-medium text-emerald-700">
            <CheckCircle2 size={15} />
            {t("messageSent")}
          </div>
        )}
        {!isConnected && (
          <p className="mt-2 text-center text-[12px] text-ink-400">{t("messageNoDevice")}</p>
        )}
        {sensorData?.customMsg && (
          <div className="mt-3 rounded-xl bg-brand-50 px-3 py-2.5 ring-1 ring-brand-200">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-500">
              {t("messageCurrent")}
            </p>
            <p className="mt-0.5 text-[13px] text-ink-900">{sensorData.customMsg}</p>
          </div>
        )}
      </div>

      {/* RF messages from nearby devices */}
      <div className="mt-5 rounded-sheet bg-white p-5 shadow-card ring-1 ring-ink-100">
        <div className="flex items-center gap-2.5">
          <Radio size={18} className="text-brand-500" strokeWidth={2.25} />
          <h5 className="flex-1">{t("rfTitle")}</h5>
          {sensorData && (
            <span className="rounded-pill bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-500">
              {sensorData.rfCount}
            </span>
          )}
        </div>
        {sensorData?.rfMessages && sensorData.rfMessages.length > 0 ? (
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
          <p className="mt-2 text-[13px] text-ink-400">{t("noRfMessages")}</p>
        )}
        {!isConnected && (
          <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-400">
            <Wifi size={13} />
            {t("messageNoDevice")}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <h5 className="mt-6 px-1">{t("actionsTitle")}</h5>
      <div className="mt-3 flex flex-col gap-2.5">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 rounded-sheet bg-white p-4 shadow-card ring-1 ring-ink-100 transition-transform duration-100 active:scale-[0.98]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <action.icon size={19} strokeWidth={2.25} />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-ink-900">
              {action.label}
            </span>
            <ChevronRight size={18} className="text-ink-300" strokeWidth={2.5} />
          </Link>
        ))}
      </div>

      {/* Live sensor readings */}
      <h5 className="mt-6 px-1">{t("readingsTitle")}</h5>
      {readings ? (
        <div className="card mt-3 py-2">
          {readings.map((r, i) => (
            <div
              key={r.label}
              className={`flex items-center gap-3 py-3 ${
                i > 0 ? "border-t border-ink-100" : ""
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${r.tone}`}
              >
                <r.icon size={16} strokeWidth={2.25} />
              </span>
              <span className="min-w-0 flex-1 text-[14px] font-medium text-ink-900">
                {r.label}
              </span>
              <span className="shrink-0 font-mono text-[14px] font-semibold text-ink-900">
                {r.value}
                {r.unit && (
                  <span className="text-[12px] font-normal text-ink-400">
                    {" "}
                    {r.unit}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card mt-3">
          <p className="text-center text-[13px] text-ink-400">{t("noData")}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-10 pb-[calc(theme(spacing.6)+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace(`/${locale}/login`);
          }}
          className="tap gap-2 rounded-pill px-4 py-2.5 text-[13px] font-semibold text-ink-500 ring-1 ring-ink-200 transition-colors duration-100 active:bg-ink-100"
        >
          <LogOut size={15} strokeWidth={2.25} />
          {tHome("signOut")}
        </button>
        <LanguageChip />
      </div>
    </section>
  );
}
