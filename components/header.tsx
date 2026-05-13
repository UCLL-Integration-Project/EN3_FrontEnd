"use client";
import { useRouter } from "next/navigation";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";
import Language from "./language";
import LoginButton from "./users/LoginButton";
import LogoutButton from "./users/LogoutButton";
import RegisterButton from "./users/RegisterButton";

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations("header");

  const handleHomePage = () => {
    router.push(`/`);
  };

  return (
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
            <LogoutButton />
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
