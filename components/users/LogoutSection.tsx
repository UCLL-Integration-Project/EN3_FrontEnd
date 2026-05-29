"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@hooks/useAuth";
import { useTranslations } from "use-intl";
import { LogOut } from "lucide-react";

export default function LogoutSection() {
  const router = useRouter();
  const { logout } = useAuth();
  const t = useTranslations("UserSettingsForm");

  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    // replace() so the back button can't return into the app after logout.
    router.replace("/login");
  };

  return (
    <div className="card flex flex-col gap-4">
      <h5>{t("accountTitle")}</h5>
      {logoutConfirm ? (
        <div className="flex flex-col gap-3">
          <p>{t("logoutConfirm")}</p>
          <button className="btn-cta" onClick={handleLogout}>
            {t("logoutConfirmButton")}
          </button>
          <button className="btn-ghost w-full justify-center py-4" onClick={() => setLogoutConfirm(false)}>
            {t("cancelButton")}
          </button>
        </div>
      ) : (
        <button className="btn-ghost w-full justify-center py-4" onClick={() => setLogoutConfirm(true)}>
          <LogOut size={20} aria-hidden="true" />
          <span className="ml-2">{t("logoutButton")}</span>
        </button>
      )}
    </div>
  );
}
