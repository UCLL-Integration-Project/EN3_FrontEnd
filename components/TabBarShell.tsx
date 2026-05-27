"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import useAuth from "@hooks/useAuth";
import TabBar from "@components/TabBar";

/* Decides whether to render the tab bar for the current route.
 *
 * The tab bar is part of the persistent shell — it only appears on the
 * four top-level tabbed routes (home, connections, stats, own profile).
 * Sub-screens like settings, device, public profile, admin, auth, and
 * error pages hide it so they feel like pushed views.
 *
 * Signed-out users never see tabs. */
export default function TabBarShell() {
  const pathname = usePathname();
  const locale = useLocale();
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  const normalized = pathname.replace(/\/$/, "");
  const root = `/${locale}`;
  const tabbed = new Set([
    root,
    `${root}/connections`,
    `${root}/stats`,
    `${root}/profile`,
    `${root}/ai`,
  ]);

  if (!tabbed.has(normalized)) return null;
  return <TabBar />;
}
