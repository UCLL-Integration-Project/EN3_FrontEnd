"use client";
import Link from "next/link";
import { Waves } from "lucide-react";
import { useLocale } from "use-intl";
import { useRouter } from "next/navigation";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";
import Language from "./language";
import LoginButton from "./users/LoginButton";
import RegisterButton from "./users/RegisterButton";
import SettingsButton from "./users/SettingsButton";

export default function Header() {
  const locale = useLocale();

  return (
    <header className="app-bar justify-center">
      <Link
        href={`/${locale}`}
        aria-label="CrossWave home"
        className="tap flex items-center gap-2.5 rounded-pill px-3 py-1 active:bg-ink-100"
      >
        <span className="brand-mark h-9 w-9" aria-hidden="true">
          <Waves size={20} strokeWidth={2.25} />
        </span>
        <span className="text-[17px] font-extrabold tracking-tight text-ink-900">
          CrossWave
        </span>
      </Link>
    <header className="flex max-h-min border-b">
      <div className="Wrapper Padding justify-between overflow-visible">
        <div className="Center">
          <button
            onClick={() => {
              handleHomePage();
            }}
          >
            <h4>{user ? `Logged in as ${user.username}` : t("welcome")}</h4>
          </button>
        </div>
        <div className="flex Padding gap-3">
          {user ? (
            <SettingsButton />
          ) : (
            <>
              <LoginButton />
              <RegisterButton />
            </>
          )}
          <Language />
        </div>
      </div>
    </header>
  );
}
