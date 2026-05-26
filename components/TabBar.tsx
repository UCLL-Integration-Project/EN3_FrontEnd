"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BarChart2, Home, User, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* Bottom tab bar — the app's primary navigation.
 *
 * Only rendered on top-level tabbed routes (home, connections, stats, own
 * profile). Sub-screens (settings, device, public profile, admin, auth,
 * errors) hide the tab bar — see TabBarShell below. */

type Tab = { href: string; label: string; icon: LucideIcon };

function isActive(pathname: string, locale: string, href: string): boolean {
  const normalized = pathname.replace(/\/$/, "");
  const target = href.replace(/\/$/, "");
  // Home matches exactly /[locale] or /[locale]/
  if (target === `/${locale}`) return normalized === `/${locale}`;
  return normalized === target || normalized.startsWith(`${target}/`);
}

export default function TabBar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("home.nav");

  const tabs: Tab[] = [
    { href: `/${locale}`, label: t("home"), icon: Home },
    { href: `/${locale}/connections`, label: t("connections"), icon: Users },
    { href: `/${locale}/stats`, label: t("stats"), icon: BarChart2 },
    { href: `/${locale}/profile`, label: t("profile"), icon: User },
  ];

  return (
    <nav
      aria-label="Primary"
      className="shrink-0 border-t border-ink-100 bg-white/95 backdrop-blur-md pb-safe-b"
    >
      <ul className="flex items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, locale, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`tap flex h-app-tab w-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors duration-100 ${
                  active ? "text-brand-600" : "text-ink-400 active:text-ink-700"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
