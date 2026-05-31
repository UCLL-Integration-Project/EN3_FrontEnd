"use client";

import { usePathname } from "next/navigation";
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

const TABBED = new Set(["/", "/connections", "/stats", "/profile", "/ai"]);

export default function TabBarShell() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  const withoutLocale = "/" + pathname.split("/").slice(2).join("/");
  const normalized = withoutLocale.replace(/\/$/, "") || "/";

  if (!TABBED.has(normalized)) return null;
  return <TabBar />;
}
