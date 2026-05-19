"use client";

import { useState } from "react";
import { changePasswordRequest } from "@services/UserService";
import { StatusMessage } from "@types";
import { useTranslations } from "use-intl";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ChangePasswordForm() {
  const t = useTranslations("UserSettingsForm");

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Partial<typeof passwords>>({});
  const [status, setStatus] = useState<StatusMessage[]>([]);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4" noValidate>
      <h5>{t("passwordTitle")}</h5>

      <div className="field">
        <label htmlFor="currentPasswordInput" className="field-label">
          {t("label.currentPassword")}
        </label>
        <div className="field-control">
          <Lock size={18} className="text-ink-400" aria-hidden="true" />
          <input
            id="currentPasswordInput"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
            className="field-input"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            aria-label={showCurrent ? "Hide password" : "Show password"}
            className="icon-btn h-9 w-9 -mr-2"
          >
            {showCurrent ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
        <div className="field-error">{errors.currentPassword || ""}</div>
      </div>

      <div className="field">
        <label htmlFor="newPasswordInput" className="field-label">
          {t("label.newPassword")}
        </label>
        <div className="field-control">
          <Lock size={18} className="text-ink-400" aria-hidden="true" />
          <input
            id="newPasswordInput"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
            className="field-input"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            aria-label={showNew ? "Hide password" : "Show password"}
            className="icon-btn h-9 w-9 -mr-2"
          >
            {showNew ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
        <div className="field-error">{errors.newPassword || ""}</div>
      </div>

      <div className="field">
        <label htmlFor="confirmPasswordInput" className="field-label">
          {t("label.confirmPassword")}
        </label>
        <div className="field-control">
          <Lock size={18} className="text-ink-400" aria-hidden="true" />
          <input
            id="confirmPasswordInput"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
            className="field-input"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Hide password" : "Show password"}
            className="icon-btn h-9 w-9 -mr-2"
          >
            {showConfirm ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
        <div className="field-error">{errors.confirmPassword || ""}</div>
      </div>

      {status.length > 0 && (
        <ul className="flex flex-col gap-2">
          {status.map(({ message, type }, i) => (
            <li key={i} className={`status ${type === "error" ? "status-error" : "status-success"}`}>
              {type === "error" ? (
                <AlertCircle size={18} aria-hidden="true" />
              ) : (
                <CheckCircle2 size={18} aria-hidden="true" />
              )}
              <span>{message}</span>
            </li>
          ))}
        </ul>
      )}

      <button type="submit" className="btn-cta">
        {t("saveButton")}
      </button>
    </form>
  );
}
