"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Waves } from "lucide-react";
import useAuth from "@hooks/useAuth";
import { useDevice } from "@context/DeviceContext";
import { sanitizeReturnPath } from "@components/auth/returnUrl";

/* -------------------------------------------------------------------------
 * Client-side route guards.
 *
 * Auth state lives in localStorage (via safeStorage) and is only known after
 * AuthProvider's mount effect runs, so every guard must wait for `isLoading`
 * to be false before deciding — otherwise a signed-in user would be wrongly
 * bounced on the first paint.
 *
 * Redirects use router.replace() (not push) so the guarded page is never
 * left in history: a signed-in user cannot press "back" into /login, and a
 * signed-out user cannot press "back" into a protected screen.
 * ---------------------------------------------------------------------- */

/** Brand splash shown while auth state resolves / a redirect is pending. */
export function AuthSplash() {
  return (
    <section className="app-screen items-center justify-center">
      <span className="brand-mark h-14 w-14 animate-pulse" aria-hidden="true">
        <Waves size={28} strokeWidth={2.25} />
      </span>
    </section>
  );
}

/**
 * Wrap pages that require a signed-in user (e.g. /device).
 * Unauthenticated visitors are redirected to /login.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && !user) {
      // Remember where the user was headed — including any query string, so
      // a deep link like /en/settings?tab=profile is restored after login.
      const search = searchParams.toString();
      const dest = search ? `${pathname}?${search}` : pathname;
      const query = new URLSearchParams({ next: dest }).toString();
      router.replace(`/${locale}/login?${query}`);
    }
  }, [isLoading, user, locale, pathname, searchParams, router]);

  // Still resolving, or signed-out and about to be redirected.
  if (isLoading || !user) return <AuthSplash />;
  return <>{children}</>;
}

/**
 * Wrap auth pages (/login, /signup).
 * Already-signed-in visitors are sent home, so they cannot navigate back
 * to the login or signup screen.
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isLoading && user) {
      // Honour a ?next= destination if present, else go home.
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(sanitizeReturnPath(next, `/${locale}`));
    }
  }, [isLoading, user, locale, router]);

  // Still resolving, or signed-in and about to be redirected.
  if (isLoading || user) return <AuthSplash />;
  return <>{children}</>;
}

/**
 * Wrap pages that require a linked companion device (e.g. the home screen,
 * /device). Use *inside* AuthGuard — it assumes the user is already signed
 * in and only checks device-linked state.
 *
 * CrossWave is unusable without a device, so anyone without one is sent to
 * the pairing flow. Do NOT wrap /device/setup with this (it would loop).
 */
export function DeviceGuard({ children }: { children: ReactNode }) {
  const { deviceLinked, isLoading } = useDevice();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isLoading && !deviceLinked) {
      router.replace(`/${locale}/device/setup`);
    }
  }, [isLoading, deviceLinked, locale, router]);

  // Still resolving, or no device and about to be redirected to setup.
  if (isLoading || !deviceLinked) return <AuthSplash />;
  return <>{children}</>;
}

/**
 * Wrap the device-pairing flow (/device/setup). Use *inside* AuthGuard.
 *
 * The one-companion model has no "add another device" path, so an account
 * that already has a linked companion must not be able to re-enter the
 * pairing wizard — already-linked users are sent to /device instead.
 * This is the inverse of DeviceGuard; the two never wrap the same route.
 */
export function SetupGuard({ children }: { children: ReactNode }) {
  const { deviceLinked, isLoading } = useDevice();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isLoading && deviceLinked) {
      router.replace(`/${locale}/device`);
    }
  }, [isLoading, deviceLinked, locale, router]);

  // Still resolving, or already linked and about to be redirected to /device.
  if (isLoading || deviceLinked) return <AuthSplash />;
  return <>{children}</>;
}
