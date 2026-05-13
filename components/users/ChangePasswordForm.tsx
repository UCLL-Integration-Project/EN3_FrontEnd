"use client";

import { useState } from "react";
import { changePasswordRequest } from "@services/UserService";
import { StatusMessage } from "@types";
import { useTranslations } from "use-intl";

export default function ChangePasswordForm() {
  const t = useTranslations("UserSettingsForm");

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Partial<typeof passwords>>({});
  const [status, setStatus] = useState<StatusMessage[]>([]);

  const validate = () => {
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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatus([]);
    if (!validate()) return;

    try {
      await changePasswordRequest(passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setStatus([{ message: t("passwordSuccess"), type: "success" }]);
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["INVALID_CREDENTIALS", "NETWORK_ERROR"];
      const key = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setStatus([{ message: t(`error.${key}`), type: "error" }]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex Padding Border Gap flex-col">
      <h5>{t("passwordTitle")}</h5>

      <div className="Wrapper flex-col">
        <div className="flex gap-1">
          <label htmlFor="currentPasswordInput">{t("label.currentPassword")}</label>
          <div className="min-h-6 text-red-500">{errors.currentPassword || ""}</div>
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
          <div className="min-h-6 text-red-500">{errors.newPassword || ""}</div>
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
          <div className="min-h-6 text-red-500">{errors.confirmPassword || ""}</div>
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
          {status.map(({ message, type }, i) => (
            <li key={i} className={type === "error" ? "text-red-500" : "text-green-500"}>
              {message}
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
