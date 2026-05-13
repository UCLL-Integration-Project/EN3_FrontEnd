"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyProfileRequest, updateProfileRequest, changePasswordRequest } from "@services/UserService";
import { StatusMessage, UpdateProfileInput } from "@types";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";

export default function UserSettingsForm() {
  const router = useRouter();
  const locale = useLocale();
  const { user, logout, updateUser } = useAuth();
  const t = useTranslations("UserSettingsForm");

  const [profile, setProfile] = useState<UpdateProfileInput>({ firstName: "", lastName: "", email: "" });
  const [profileErrors, setProfileErrors] = useState<Partial<UpdateProfileInput>>({});
  const [profileStatus, setProfileStatus] = useState<StatusMessage[]>([]);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState<Partial<typeof passwords>>({});
  const [passwordStatus, setPasswordStatus] = useState<StatusMessage[]>([]);

  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    getMyProfileRequest()
      .then((data) => {
        setProfile({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
        });
      })
      .catch(() => {});
  }, []);

  const validateProfile = () => {
    const errs: Partial<UpdateProfileInput> = {};
    if (!profile.firstName.trim()) errs.firstName = t("validate.error");
    if (!profile.lastName.trim()) errs.lastName = t("validate.error");
    if (!profile.email.trim() || !/^\S+@\S+\.\S+$/.test(profile.email)) errs.email = t("validate.error");
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileStatus([]);
    if (!validateProfile()) return;

    try {
      const updated = await updateProfileRequest(profile);
      updateUser({ firstName: updated.firstName, lastName: updated.lastName, email: updated.email });
      setProfileStatus([{ message: t("profileSuccess"), type: "success" }]);
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["EMAIL_TAKEN", "NETWORK_ERROR"];
      const key = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setProfileStatus([{ message: t(`error.${key}`), type: "error" }]);
    }
  };

  const validatePasswords = () => {
    const errs: Partial<typeof passwords> = {};
    if (!passwords.currentPassword.trim()) errs.currentPassword = t("validate.error");
    if (!passwords.newPassword.trim()) {
      errs.newPassword = t("validate.error");
    } else if (passwords.newPassword.length < 8) {
      errs.newPassword = t("validate.weakPassword");
    }
    if (!passwords.confirmPassword.trim()) {
      errs.confirmPassword = t("validate.error");
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      errs.confirmPassword = t("validate.passwordMismatch");
    }
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordStatus([]);
    if (!validatePasswords()) return;

    try {
      await changePasswordRequest(passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStatus([{ message: t("passwordSuccess"), type: "success" }]);
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["INVALID_CREDENTIALS", "NETWORK_ERROR"];
      const key = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setPasswordStatus([{ message: t(`error.${key}`), type: "error" }]);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  return (
    <div className="Wrapper Padding Col overflow-y-auto">
      <h3>{t("title")}</h3>

      <form onSubmit={handleProfileSubmit} className="flex Padding Border Gap flex-col">
        <h5>{t("profileTitle")}</h5>

        <div className="Wrapper flex-col">
          <div className="flex gap-1">
            <label htmlFor="firstNameInput">{t("label.firstName")}</label>
            <div className="min-h-6 text-red-500">{profileErrors.firstName || ""}</div>
          </div>
          <div className="input-wrapper">
            <input
              id="firstNameInput"
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
              className="input"
            />
          </div>
        </div>

        <div className="Wrapper flex-col">
          <div className="flex gap-1">
            <label htmlFor="lastNameInput">{t("label.lastName")}</label>
            <div className="min-h-6 text-red-500">{profileErrors.lastName || ""}</div>
          </div>
          <div className="input-wrapper">
            <input
              id="lastNameInput"
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
              className="input"
            />
          </div>
        </div>

        <div className="Wrapper flex-col">
          <div className="flex gap-1">
            <label htmlFor="emailInput">{t("label.email")}</label>
            <div className="min-h-6 text-red-500">{profileErrors.email || ""}</div>
          </div>
          <div className="input-wrapper">
            <input
              id="emailInput"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className="input"
            />
          </div>
        </div>

        <div className="Wrapper Gap items-center">
          <button className="btn" type="submit">
            {t("saveButton")}
          </button>
          <ul>
            {profileStatus.map(({ message, type }, i) => (
              <li key={i} className={type === "error" ? "text-red-500" : "text-green-500"}>
                {message}
              </li>
            ))}
          </ul>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="flex Padding Border Gap flex-col">
        <h5>{t("passwordTitle")}</h5>

        <div className="Wrapper flex-col">
          <div className="flex gap-1">
            <label htmlFor="currentPasswordInput">{t("label.currentPassword")}</label>
            <div className="min-h-6 text-red-500">{passwordErrors.currentPassword || ""}</div>
          </div>
          <div className="input-wrapper">
            <input
              id="currentPasswordInput"
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
              className="input"
            />
          </div>
        </div>

        <div className="Wrapper flex-col">
          <div className="flex gap-1">
            <label htmlFor="newPasswordInput">{t("label.newPassword")}</label>
            <div className="min-h-6 text-red-500">{passwordErrors.newPassword || ""}</div>
          </div>
          <div className="input-wrapper">
            <input
              id="newPasswordInput"
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              className="input"
            />
          </div>
        </div>

        <div className="Wrapper flex-col">
          <div className="flex gap-1">
            <label htmlFor="confirmPasswordInput">{t("label.confirmPassword")}</label>
            <div className="min-h-6 text-red-500">{passwordErrors.confirmPassword || ""}</div>
          </div>
          <div className="input-wrapper">
            <input
              id="confirmPasswordInput"
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
              className="input"
            />
          </div>
        </div>

        <div className="Wrapper Gap items-center">
          <button className="btn" type="submit">
            {t("saveButton")}
          </button>
          <ul>
            {passwordStatus.map(({ message, type }, i) => (
              <li key={i} className={type === "error" ? "text-red-500" : "text-green-500"}>
                {message}
              </li>
            ))}
          </ul>
        </div>
      </form>

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
    </div>
  );
}
