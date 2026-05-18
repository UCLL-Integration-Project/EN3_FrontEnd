"use client";

import Link from "next/link";
import { Waves } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import useAuth from "@hooks/useAuth";
import Language from "./language";
import SettingsButton from "./users/SettingsButton";

export default function Header() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("header");
  const { user } = useAuth();

  const handleHomePage = () => {
    router.push(`/${locale}`);
  };

  return (
    <header className="app-bar">
      {/* Left: Logo */}
      <Link
        href={`/${locale}`}
        aria-label="CrossWave home"
        className="tap flex items-center gap-2.5 rounded-pill px-3 py-1 active:bg-ink-100"
      >
        <span className="brand-mark" aria-hidden="true">
          <Waves size={20} strokeWidth={2.25} />
        </span>
        <span className="hidden text-[17px] font-extrabold tracking-tight text-ink-900 min-[400px]:block">
          CrossWave
        </span>
      </Link>

      {/* Middle: User Status */}
      <div className="flex flex-1 justify-center px-2">
        <button
          onClick={handleHomePage}
          className="tap rounded-pill px-3 py-1 active:bg-ink-100"
        >
          <h4 className="truncate text-center">
            {user ? t("loggedInAs", { name: user.firstName ?? "" }) : t("welcome")}
          </h4>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {user ? (
          <SettingsButton />
        ) : (
          <div className="hidden items-center gap-1 sm:flex">
            <Link href={`/${locale}/login`} className="btn-quiet">
              {t("nav.login")}
            </Link>
            <Link href={`/${locale}/signup`} className="btn-secondary px-4 py-2">
              {t("nav.register")}
            </Link>
          </div>
        )}
        <Language />
      </div>
    </header>
  );
}
