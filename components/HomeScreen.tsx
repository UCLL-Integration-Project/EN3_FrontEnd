"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  BarChart2,
  ChevronRight,
  Cpu,
  LogOut,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";
import useAuth from "@hooks/useAuth";
import { insightRequest } from "@services/AiService";
import { safeStorage } from "@context/safeStorage";
import AiInsightPopup from "@components/ai/AiInsightPopup";

const FOUR_HOURS = 4 * 60 * 60 * 1000;

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "greetingMorning" : hour < 18 ? "greetingAfternoon" : "greetingEvening";

  const displayName = user?.firstName?.trim() || user?.username?.trim() || "";

  const [insight, setInsight] = useState<string | null>(null);

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

  const navItems = [
    { icon: User,      label: t("nav.profile"),     href: `/${locale}/profile`,       admin: false },
    { icon: Users,     label: t("nav.connections"),  href: `/${locale}/connections`,   admin: false },
    { icon: Cpu,       label: t("nav.device"),       href: `/${locale}/device`,        admin: false },
    { icon: BarChart2, label: t("nav.stats"),        href: `/${locale}/stats`,         admin: false },
    { icon: Settings,  label: t("nav.settings"),     href: `/${locale}/settings`,      admin: false },
    ...(user?.role === "ADMIN"
      ? [{ icon: Shield, label: t("nav.admin"), href: `/${locale}/admin/members`, admin: true }]
      : []),
  ] as { icon: typeof User; label: string; href: string; admin: boolean }[];

  return (
    <section className="relative flex min-h-full flex-col p-0">
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

      {/* AI floating action button */}
      <Link
        href={`/${locale}/ai`}
        aria-label={t("nav.ai")}
        className="absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-[22px] text-white shadow-pop active:scale-95 transition-transform duration-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
      >
        ✦
      </Link>

      {/* Proactive insight popup */}
      {insight && (
        <AiInsightPopup insight={insight} onDismiss={handleDismissInsight} />
      )}
    </section>
  );
}
