"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";

export default function LogoutSection() {
  const router = useRouter();
  const locale = useLocale();
  const { logout } = useAuth();
  const t = useTranslations("UserSettingsForm");

  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    // replace() so the back button can't return into the app after logout.
    router.replace(`/${locale}/login`);
  };

  return (
    <div className="flex Padding Border Gap flex-col">
      <h5>{t("accountTitle")}</h5>
      {logoutConfirm ? (
        <div className="Wrapper Gap items-center">
          <span>{t("logoutConfirm")}</span>
          <button className="btn" onClick={handleLogout}>
            {t("logoutConfirmButton")}
          </button>
          <button className="btn-secondary" onClick={() => setLogoutConfirm(false)}>
            {t("cancelButton")}
          </button>
        </div>
      ) : (
        <button className="btn" onClick={() => setLogoutConfirm(true)}>
          <span className="material-symbols-outlined" aria-hidden="true">
            logout
          </span>
          <span>{t("logoutButton")}</span>
        </button>
      )}
    </div>
  );
}
