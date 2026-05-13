"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();
  const t = useTranslations("header");

  const handleLogin = () => {
    router.push(`/login`);
  };

  return (
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
    </>
  );
}
