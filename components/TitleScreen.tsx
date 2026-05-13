"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Waves, LogOut } from "lucide-react";
import useAuth from "@hooks/useAuth";
import LanguageChip from "@components/language";

export default function TitleScreen() {
  const { user, logout } = useAuth();
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();

  if (user) {
    return (
      <section className="app-screen bg-wave">
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <span className="brand-mark h-20 w-20" aria-hidden="true">
            <Waves size={42} strokeWidth={2.25} />
          </span>
          <h1>{t("welcome")}</h1>
          <p className="max-w-[300px]">{t("loggedInAs", { name: user.username ?? "" })}</p>
        </div>

        <div className="action-dock flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push(`/${locale}/login`);
            }}
            className="btn-secondary w-full justify-center py-4 text-[16px]"
          >
            <LogOut size={20} aria-hidden="true" />
            <span className="ml-2">{t("signOut")}</span>
          </button>
          <div className="flex justify-center pt-1">
            <LanguageChip />
          </div>
        </div>
      </section>
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
