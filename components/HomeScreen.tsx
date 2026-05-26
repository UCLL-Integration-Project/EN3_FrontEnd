"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  BarChart2,
  ChevronRight,
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

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { deviceLinked, deviceIp } = useDevice();
  const { sensorData, sendMessage } = useDeviceWebSocket(deviceLinked ? deviceIp : "");

  const [draft, setDraft] = useState("");
  const [sentConfirm, setSentConfirm] = useState(false);
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "greetingMorning" : hour < 18 ? "greetingAfternoon" : "greetingEvening";

  const displayName = user?.firstName?.trim() || user?.username?.trim() || "";

  const navItems = [
    { icon: User,      label: t("nav.profile"),    href: `/${locale}/profile`,        admin: false },
    { icon: Users,     label: t("nav.connections"), href: `/${locale}/connections`,    admin: false },
    { icon: Cpu,       label: t("nav.device"),      href: `/${locale}/device`,         admin: false },
    { icon: BarChart2, label: t("nav.stats"),       href: `/${locale}/stats`,          admin: false },
    { icon: Settings,  label: t("nav.settings"),    href: `/${locale}/settings`,       admin: false },
    ...(user?.role === "ADMIN"
      ? [{ icon: Shield, label: t("nav.admin"), href: `/${locale}/admin/members`, admin: true }]
      : []),
  ] as { icon: typeof User; label: string; href: string; admin: boolean }[];

  return (
    <section className="app-screen p-0">
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
      <div className="flex flex-col gap-2 px-5 pb-4 pt-5">
        {navItems.map(({ icon: Icon, label, href, admin }, index) => (
          <Link
            key={href}
            href={href}
            style={{ animationDelay: `${index * 45}ms` }}
            className="animate-rise flex items-center gap-3 rounded-sheet bg-white px-4 py-3.5 shadow-card ring-1 ring-ink-100 transition-transform duration-100 active:scale-[0.98]"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                admin
                  ? "bg-secondary-50 text-secondary-600"
                  : "bg-brand-50 text-brand-600"
              }`}
            >
              <Icon size={20} strokeWidth={2.25} aria-hidden />
            </span>
            <span
              className={`flex-1 text-[15px] font-semibold ${
                admin ? "text-secondary-700" : "text-ink-900"
              }`}
            >
              {label}
            </span>
            <ChevronRight size={18} className="text-ink-300" strokeWidth={2.5} aria-hidden />
          </Link>
        ))}
      </div>

      {/* Broadcast + RF tiles — only when a device is linked */}
      {deviceLinked && (
        <div className="px-5 pb-2">
          {/* Broadcast */}
          <h5 className="mb-2 px-1">{t("dashboard.messageTitle")}</h5>
          <div className="card">
            <p className="text-[12px] text-ink-500">{t("dashboard.messageSubtitle")}</p>
            {!deviceIp ? (
              <p className="mt-2 text-[12px] text-ink-400">{t("dashboard.messageNoDevice")}</p>
            ) : (
              <>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t("dashboard.messagePlaceholder")}
                  rows={2}
                  className="mt-2 w-full resize-none rounded-xl bg-ink-50 px-3 py-2 text-[13px] text-ink-900 outline-none ring-1 ring-ink-200 placeholder:text-ink-400 focus:ring-brand-400"
                />
                <button
                  disabled={!draft.trim()}
                  onClick={() => {
                    sendMessage(draft.trim());
                    setDraft("");
                    setSentConfirm(true);
                    setTimeout(() => setSentConfirm(false), 3500);
                  }}
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
              </>
            )}
          </div>

          {/* RF messages from nearby devices */}
          <h5 className="mb-2 mt-5 px-1">{t("dashboard.rfTitle")}</h5>
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
      )}

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
