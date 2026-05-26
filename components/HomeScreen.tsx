"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  BarChart2,
  Cpu,
  LogOut,
  Radio,
  Send,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import useAuth from "@hooks/useAuth";
import { useDevice } from "@context/DeviceContext";
import { useDeviceWebSocket } from "@hooks/useDeviceWebSocket";
import MultiStatus from "./status/MultiStatus";
import { NavItem } from "@types";
import NavList from "./util/NavList";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { deviceLinked, deviceIp } = useDevice();
  const { sensorData, sendMessage } = useDeviceWebSocket(
    deviceLinked ? deviceIp : "",
  );

  const [selectedStatusMessage, setSelectedStatusMessage] = useState("");
  const [sentConfirm, setSentConfirm] = useState(false);
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12
      ? "greetingMorning"
      : hour < 18
        ? "greetingAfternoon"
        : "greetingEvening";

  const displayName = user?.firstName?.trim() || user?.username?.trim() || "";

  const navItems: NavItem[] = [
    {
      icon: User,
      label: t("nav.profile"),
      href: `/${locale}/profile`,
    },
    {
      icon: Users,
      label: t("nav.connections"),
      href: `/${locale}/connections`,
    },
    {
      icon: Cpu,
      label: t("nav.device"),
      href: `/${locale}/device`,
    },
    {
      icon: BarChart2,
      label: t("nav.stats"),
      href: `/${locale}/stats`,
    },
    {
      icon: Settings,
      label: t("nav.settings"),
      href: `/${locale}/settings`,
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            icon: Shield,
            label: t("nav.admin"),
            href: `/${locale}/admin`,
            variant: "admin" as const,
          },
        ]
      : []),
  ];

  const handleSendStatus = () => {
    if (!selectedStatusMessage.trim()) return;

    sendMessage(selectedStatusMessage.trim());
    setSentConfirm(true);
    setTimeout(() => setSentConfirm(false), 3500);
  };

  return (
    <section className="flex min-h-full flex-col p-0">
      {/* Brand gradient banner */}
      <div className="bg-brand-gradient px-5 pb-8 pt-[calc(1.25rem+env(safe-area-inset-top))]">
        <p
          className="text-[11px] font-medium uppercase tracking-widest text-white/65"
          suppressHydrationWarning
        >
          {t(`dashboard.${greetingKey}`)}
        </p>
        <p className="mt-1 text-[26px] font-extrabold tracking-tight text-white">
          {displayName}
        </p>
      </div>

      {/* Nav list */}
      <div className="px-5 pb-4 pt-5">
        <NavList items={navItems} />
      </div>

      {/* Status selector */}
      <MultiStatus onStatusSelected={setSelectedStatusMessage} />

      {/* Broadcast tile — only when a device is linked */}
      <div className="px-5 pb-2">
        <h5 className="mb-2 px-1">{t("dashboard.messageTitle")}</h5>
        <div className="card">
          <p className="text-[12px] text-ink-500">
            {t("dashboard.messageSubtitle")}
          </p>

          {/* Selected status message preview */}
          {selectedStatusMessage && (
            <div className="mt-2 rounded-xl bg-brand-50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-brand-600">
                {t("dashboard.messageCurrent")}
              </p>
              <p className="mt-1 text-[13px] text-ink-800">
                {selectedStatusMessage}
              </p>
            </div>
          )}

          {/* Send button */}
          <button
            disabled={!selectedStatusMessage.trim()}
            onClick={handleSendStatus}
            className="btn-primary mt-2 w-full disabled:opacity-40"
          >
            <Send size={14} strokeWidth={2.25} />
            {t("dashboard.messageSend")}
          </button>

          {sentConfirm && (
            <p className="mt-1.5 text-center text-[12px] text-emerald-600">
              {t("dashboard.messageSent")}
            </p>
          )}
        </div>

        {/* RF messages from nearby devices */}
        <h5 className="mb-2 mt-5 px-1">{t("dashboard.rfTitle")}</h5>
        <div className="card">
          {!sensorData || sensorData.rfMessages.length === 0 ? (
            <div className="flex items-center gap-3 py-1">
              <Radio
                size={18}
                className="shrink-0 text-ink-300"
                strokeWidth={2}
              />
              <p className="text-[13px] text-ink-400">
                {t("dashboard.noRfMessages")}
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {sensorData.rfMessages.map((msg, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Radio
                    size={14}
                    className="mt-0.5 shrink-0 text-brand-400"
                    strokeWidth={2}
                  />
                  <span className="text-[13px] text-ink-800">{msg}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Sign out */}
      <div className="mt-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace(`/${locale}/login`);
          }}
          className="tap flex w-full items-center justify-center gap-2 rounded-pill px-4 py-3 text-[13px] font-semibold text-ink-500 ring-1 ring-ink-200 transition-colors duration-100 active:bg-ink-100"
        >
          <LogOut size={15} strokeWidth={2.25} aria-hidden />
          {t("signOut")}
        </button>
      </div>
    </section>
  );
}
