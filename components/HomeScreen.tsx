"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  BatteryMedium,
  BluetoothConnected,
  ChevronRight,
  LifeBuoy,
  LogOut,
  RefreshCw,
  Settings,
  Trophy,
  Watch,
} from "lucide-react";
import useAuth from "@hooks/useAuth";
import LanguageChip from "@components/language";

/* -------------------------------------------------------------------------
 * Signed-in app home — a companion-device dashboard.
 * CrossWave requires exactly one linked companion per account. This screen
 * assumes a device is linked; the guard that redirects to /device/setup when
 * none is linked belongs in the auth/device context (mock data for now).
 * ---------------------------------------------------------------------- */

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const t = useTranslations("home.dashboard");
  const tHome = useTranslations("home");
  const tDevice = useTranslations("device");
  const locale = useLocale();
  const router = useRouter();

  const displayName =
    user?.firstName?.trim() || user?.username?.trim() || t("fallbackName");
  const initial = displayName.charAt(0).toUpperCase();

  // Computed at render — wrapped in suppressHydrationWarning where shown,
  // since the server hour and the device hour may differ.
  const hour = new Date().getHours();
  const greetingKey =
    hour < 12
      ? "greetingMorning"
      : hour < 18
        ? "greetingAfternoon"
        : "greetingEvening";

  const actions = [
    {
      icon: Settings,
      label: t("actionSettings"),
      href: `/${locale}/settings`,
    },
    {
      icon: LifeBuoy,
      label: t("actionHelp"),
      href: `/${locale}`,
    },
  ];

  const activity = [
    {
      icon: RefreshCw,
      tone: "bg-brand-50 text-brand-600",
      label: t("activitySynced"),
      time: t("timeNow"),
    },
    {
      icon: Trophy,
      tone: "bg-secondary-50 text-secondary-600",
      label: t("activityGoal"),
      time: t("timeMinutes", { count: 42 }),
    },
    {
      icon: BluetoothConnected,
      tone: "bg-accent-50 text-accent-600",
      label: t("activityFirmware"),
      time: t("timeHours", { count: 5 }),
    },
  ];

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

      {/* Companion device — hero card */}
      <Link
        href={`/${locale}/device`}
        className="mt-5 block rounded-sheet bg-brand-gradient p-5 text-white shadow-pop transition-transform duration-100 active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <Watch size={26} strokeWidth={2} />
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
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            {t("companionConnected")}
          </span>
          <span className="flex items-center gap-1.5">
            <BatteryMedium size={15} />
            72%
          </span>
          <span className="ml-auto text-white/65">{t("companionManage")}</span>
        </div>
      </Link>

      {/* Quick actions — note: no "pair device" here; one companion per
          account, and swapping happens by forgetting the current one. */}
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

      {/* Recent activity */}
      <h5 className="mt-6 px-1">{t("activityTitle")}</h5>
      <div className="card mt-3 py-2">
        {activity.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 py-3 ${
              i > 0 ? "border-t border-ink-100" : ""
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.tone}`}
            >
              <item.icon size={16} strokeWidth={2.25} />
            </span>
            <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink-900">
              {item.label}
            </span>
            <span className="shrink-0 text-[12px] text-ink-400">
              {item.time}
            </span>
          </div>
        ))}
      </div>

      {/* Footer — minor controls, kept off the sticky CTA dock */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-10 pb-[calc(theme(spacing.6)+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={async () => {
            // Await logout so auth state is cleared before navigating —
            // otherwise GuestGuard on /login can still see a signed-in user
            // and bounce straight back here.
            await logout();
            // replace() so the back button can't return into the app after
            // signing out.
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
