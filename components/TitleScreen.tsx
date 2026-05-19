"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Waves } from "lucide-react";
import useAuth from "@hooks/useAuth";
import LanguageChip from "@components/language";
import HomeScreen from "@components/HomeScreen";
import { DeviceGuard, AuthSplash } from "@components/auth/RouteGuard";

export default function TitleScreen() {
  const { user, isLoading } = useAuth();
  const t = useTranslations("home");
  const locale = useLocale();

  // Wait for the session check before choosing landing vs. home.
  if (isLoading) return <AuthSplash />;

  // Signed in: the home screen needs a linked device, so gate it.
  if (user) {
    return (
      <DeviceGuard>
        <HomeScreen />
      </DeviceGuard>
    );
  }

  return (
    <section className="app-screen bg-wave">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <span
          className="brand-mark h-24 w-24 animate-wave"
          aria-hidden="true"
        >
          <Waves size={52} strokeWidth={2.25} />
        </span>
        <h1 className="max-w-[340px]">{t("welcome")}</h1>
        <p className="max-w-[300px]">{t("subtitle")}</p>
      </div>

      <div className="action-dock flex flex-col gap-3">
        <Link href={`/${locale}/signup`} className="btn-cta no-underline text-center">
          {t("cta.getStarted")}
        </Link>
        <Link
          href={`/${locale}/login`}
          className="btn-ghost w-full justify-center py-4 no-underline text-center"
        >
          {t("cta.haveAccount")}
        </Link>
        <div className="flex justify-center pt-1">
          <LanguageChip />
        </div>
      </div>
    </section>
  );
}
