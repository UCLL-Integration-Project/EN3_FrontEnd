"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BarChart2, Home, User, Users } from "lucide-react";
import BambooAvatar from "@components/ai/BambooAvatar";
import type { LucideIcon } from "lucide-react";

/* Bottom tab bar — the app's primary navigation.
 *
 * Only rendered on top-level tabbed routes (home, connections, ai, stats,
 * own profile). Sub-screens (settings, device, public profile, admin, auth,
 * errors) hide the tab bar — see TabBarShell below. */

type Tab = { href: string; label: string; icon: LucideIcon };

function stripLocale(pathname: string): string {
  const parts = pathname.split("/").slice(2);
  return parts.length === 0 ? "/" : `/${parts.join("/")}`;
}

function isActive(pathname: string, href: string): boolean {
  const normalized = stripLocale(pathname).replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  if (target === "/") return normalized === "/";
  return normalized === target || normalized.startsWith(`${target}/`);
}

export default function TabBar() {
  const pathname = usePathname();
  const t = useTranslations("home.nav");

  const left: Tab[] = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/connections", label: t("connections"), icon: Users },
  ];

  const right: Tab[] = [
    { href: "/stats", label: t("stats"), icon: BarChart2 },
    { href: "/profile", label: t("profile"), icon: User },
  ];

  const aiActive = stripLocale(pathname).replace(/\/$/, "") === "/ai";

  function TabItem({ href, label, icon: Icon }: Tab) {
    const active = isActive(pathname, href);
    return (
      <li className="flex-1">
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={`tap flex h-app-tab w-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors duration-100 ${
            active ? "text-brand-600" : "text-ink-400 active:text-ink-700"
          }`}
        >
          <Icon size={22} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      </li>
    );
  }

  return (
    <nav
      aria-label="Primary"
      className="shrink-0 border-t border-ink-100 bg-white/95 backdrop-blur-md pb-safe-b"
    >
      <ul className="flex items-end justify-around">
        {left.map((tab) => (
          <TabItem key={tab.href} {...tab} />
        ))}

        {/* Center AI action button — raised above the bar */}
        <li className="flex flex-1 flex-col items-center justify-end">
          <Link
            href="/ai"
            aria-label={t("ai")}
            aria-current={aiActive ? "page" : undefined}
            className={`-mt-5 flex h-14 w-14 items-center justify-center rounded-full text-[22px] text-white shadow-pop transition-transform duration-100 active:scale-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 mb-1 ${
              aiActive ? "bg-brand-700" : "bg-brand-gradient"
            }`}
          >
            <BambooAvatar size={28} className="brightness-0 invert" />
          </Link>
        </li>

        {right.map((tab) => (
          <TabItem key={tab.href} {...tab} />
        ))}
      </ul>
    </nav>
  );
}
