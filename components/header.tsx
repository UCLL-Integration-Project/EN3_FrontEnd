"use client";
import { useRouter } from "next/navigation";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";
import Language from "./language";

export default function Header() {
  const locale = useLocale();
  const router = useRouter();
  const { user, logout } = useAuth();
  const t = useTranslations("header");

  const handleHomePage = () => {
    router.push(`/`);
  };

  const handleLogout = () => {
    logout();
    router.push(`/login`);
  };

  const handleLogin = () => {
    router.push(`/login`);
  };

  const handleRegister = () => {
    router.push(`/signup`);
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
            <button
              onClick={() => {
                handleLogout();
              }}
              aria-label="Log out"
              className="btn"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                logout
              </span>
              <span>{t("nav.logout")}</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  handleLogin();
                }}
                aria-label="Log in"
                className="btn"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  login
                </span>
                <span>{t("nav.login")}</span>
              </button>
              <button
                onClick={() => {
                  handleRegister();
                }}
                aria-label="Register"
                className="btn"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  person_add
                </span>
                <span>{t("nav.register")}</span>
              </button>
            </>
          )}
          <Language />
        </div>
      </div>
    </header>
  );
}
