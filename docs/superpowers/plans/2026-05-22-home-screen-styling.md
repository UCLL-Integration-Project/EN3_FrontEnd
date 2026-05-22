# Home Screen Styling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `HomeScreen.tsx` with a brand gradient banner header, green icon pills on each nav row, staggered rise animation, and a sign-out pill at the bottom.

**Architecture:** Single component rewrite — no logic changes, no new files, no new locale keys. All design tokens (`bg-brand-gradient`, `bg-brand-50`, `text-brand-600`, `animate-rise`, `shadow-card`) already exist in `globals.css` and `tailwind.config.js`.

**Tech Stack:** Next.js App Router, Tailwind CSS v3, lucide-react, next-intl

---

### Task 1: Restyle `HomeScreen.tsx`

**Files:**
- Modify: `components/HomeScreen.tsx`

The full replacement content is below. Paste it in one shot — the component is small enough to rewrite entirely rather than patch line-by-line.

- [ ] **Step 1: Replace `components/HomeScreen.tsx` with the styled version**

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "greetingMorning" : hour < 18 ? "greetingAfternoon" : "greetingEvening";

  const displayName = user?.firstName?.trim() || user?.username?.trim() || "";

  const navItems = [
    { icon: User,     label: t("nav.profile"),     href: `/${locale}/profile` },
    { icon: Users,    label: t("nav.connections"),  href: `/${locale}/connections` },
    { icon: Cpu,      label: t("nav.device"),       href: `/${locale}/device` },
    { icon: BarChart2,label: t("nav.stats"),        href: `/${locale}/stats` },
    { icon: Settings, label: t("nav.settings"),     href: `/${locale}/settings` },
    ...(user?.role === "ADMIN"
      ? [{ icon: Shield, label: t("nav.admin"), href: `/${locale}/admin/members` }]
      : []),
  ] as { icon: typeof User; label: string; href: string }[];

  return (
    <section className="app-screen p-0">
      {/* Brand gradient banner */}
      <div className="bg-brand-gradient px-5 pb-7 pt-[calc(theme(spacing.5)+env(safe-area-inset-top))]">
        <p className="text-[11px] font-medium text-white/70" suppressHydrationWarning>
          {t(`dashboard.${greetingKey}`)}
        </p>
        <h1 className="mt-0.5 text-[28px] font-extrabold tracking-tight text-white">
          {displayName}
        </h1>
      </div>

      {/* Nav list */}
      <div className="flex flex-col gap-2 px-5 pt-5">
        {navItems.map(({ icon: Icon, label, href }, index) => {
          const isAdmin = href.includes("/admin");
          return (
            <Link
              key={href}
              href={href}
              style={{ animationDelay: `${index * 40}ms` }}
              className={`animate-rise flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-100 transition-transform duration-100 active:scale-[0.98] ${
                isAdmin ? "ring-secondary-200" : ""
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  isAdmin
                    ? "bg-secondary-50 text-secondary-600"
                    : "bg-brand-50 text-brand-600"
                }`}
              >
                <Icon size={20} strokeWidth={2.25} aria-hidden />
              </span>
              <span
                className={`flex-1 text-[15px] font-semibold ${
                  isAdmin ? "text-secondary-800" : "text-ink-900"
                }`}
              >
                {label}
              </span>
              <ChevronRight size={18} className="text-ink-300" strokeWidth={2.5} aria-hidden />
            </Link>
          );
        })}
      </div>

      {/* Sign out */}
      <div className="mt-auto px-5 pb-[calc(theme(spacing.6)+env(safe-area-inset-bottom))] pt-8">
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace(`/${locale}/login`);
          }}
          className="tap flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[13px] font-semibold text-ink-500 ring-1 ring-ink-200 transition-colors duration-100 active:bg-ink-100"
        >
          <LogOut size={15} strokeWidth={2.25} aria-hidden />
          {t("signOut")}
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify `dashboard.greetingMorning` / `greetingAfternoon` / `greetingEvening` exist in both locale files**

These keys live at `home.dashboard.greetingMorning` etc. in `public/locales/en/common.json` and `public/locales/nl/common.json`. They were already present before this work — just confirm they haven't been removed.

Run: open `public/locales/en/common.json`, search for `greetingMorning`.  
Expected: key exists with value `"Good morning"`.

- [ ] **Step 3: Start the dev server and manually verify the home screen**

```bash
npm run dev
```

Open `http://localhost:8080/en` in a browser set to mobile viewport (Chrome DevTools → iPhone 14 Pro).

Check:
1. Signed out → `TitleScreen` shows (not HomeScreen)
2. Sign in → redirected to home, gradient banner renders with your name
3. Time-of-day label updates (test by temporarily setting `hour` to 6 / 14 / 20 in code)
4. Each nav row taps and navigates to the correct page
5. Admin row only appears if signed in as an admin user
6. Sign out logs out and redirects to `/en/login`
7. Nav cards stagger in (subtle, under 300ms)
8. On a real phone or DevTools emulation, banner extends behind the notch (safe-area inset)

- [ ] **Step 4: Commit**

```bash
git add components/HomeScreen.tsx
git commit -m "style: home screen — gradient banner, green icon pills, stagger animation"
```
