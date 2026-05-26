"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginRequest, verifyMfaRequest } from "@services/UserService";
import { AuthenticationRequest, StatusMessage } from "@types";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import BackButton from "@components/BackButton";
import { sanitizeReturnPath } from "@components/auth/returnUrl";

export default function UserLoginForm() {
  const [form, setForm] = useState({ email: "", password: "", mfaEnabled: false });
  const [mfaCode, setMfaCode] = useState("");
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; mfa?: string }>({});
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuth();
  const t = useTranslations("UserLoginForm");

  const handleChange = (field: "email" | "password" | "mfaEnabled", value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.email.trim()) newErrors.email = t("validate.error");
    if (!form.password.trim()) newErrors.password = t("validate.error");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearMessages = () => {
    setErrors({});
    setStatusMessages([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearMessages();
    if (!validate()) return;

    const authRequest: AuthenticationRequest = {
      email: form.email,
      password: form.password,
      mfaEnabled: form.mfaEnabled,
    };

    setSubmitting(true);
    try {
      const response = await loginRequest(authRequest);
      // If token is null AND mfa was enabled, it means MFA is required
      if (authRequest.mfaEnabled && !response.token) {
        setTempUsername(response.username!);
        setIsMfaRequired(true);
        setStatusMessages([{ message: t("mfa_required"), type: "success" }]);
      } else {
        setStatusMessages([{ message: t("success"), type: "success" }]);
        login(response);
        const next = new URLSearchParams(window.location.search).get("next");
        const destination = sanitizeReturnPath(next, `/${locale}`);
        setTimeout(() => router.replace(destination), 500);
      }
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["INVALID_CREDENTIALS", "USERNAME_TAKEN", "NETWORK_ERROR"];
      const messageKey = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setStatusMessages([{ message: t(`error.${messageKey}`), type: "error" }]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMfaSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearMessages();
    if (!mfaCode.trim()) {
      setErrors({ mfa: t("validate.error") });
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await verifyMfaRequest(tempUsername, mfaCode);
      setStatusMessages([{ message: t("success"), type: "success" }]);
      login(loggedInUser);
      setTimeout(() => router.push(`/${locale}`), 500);
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["MFA_CODE_NOT_FOUND", "MFA_CODE_EXPIRED", "INVALID_MFA_CODE", "NETWORK_ERROR"];
      const messageKey = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setStatusMessages([{ message: t(`error.${messageKey}`), type: "error" }]);
    } finally {
      setSubmitting(false);
    }
  };

  if (isMfaRequired) {
    return (
      <section className="app-screen">
        <div className="pb-2">
          <button
            type="button"
            onClick={() => setIsMfaRequired(false)}
            aria-label="Back"
            className="back-btn"
          >
            <ArrowLeft size={22} strokeWidth={2.25} />
          </button>
        </div>
        <header className="flex flex-col gap-1 pt-2 pb-5">
          <h1>Verification</h1>
          <p>Please enter the 6-digit code sent to your email.</p>
        </header>

        <form onSubmit={handleMfaSubmit} className="flex flex-1 flex-col gap-4">
          <div className="field">
            <label htmlFor="mfaInput" className="field-label">{t("label.mfa_code")}</label>
            <div className="field-control">
              <ShieldCheck size={18} className="text-ink-400" aria-hidden="true" />
              <input
                id="mfaInput"
                type="text"
                placeholder="123456"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="field-input text-center text-2xl tracking-widest"
                maxLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </div>
            <div className="field-error">{errors.mfa || ""}</div>
          </div>

          {statusMessages.length > 0 && (
            <ul className="flex flex-col gap-2">
              {statusMessages.map(({ message, type }, index) => (
                <li
                  key={index}
                  className={`status ${type === "error" ? "status-error" : "status-success"}`}
                >
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

          <div className="action-dock">
            <button className="btn-cta" type="submit" disabled={submitting}>
              {submitting ? "…" : t("button_verify")}
            </button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="app-screen">
      <div className="pb-2">
        <BackButton />
      </div>
      <header className="flex flex-col gap-1 pt-2 pb-5">
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4" noValidate>
        <div className="field">
          <label htmlFor="emailInput" className="field-label">
            {t("label.email")}
          </label>
          <div className="field-control">
            <Mail size={18} className="text-ink-400" aria-hidden="true" />
            <input
              id="emailInput"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="field-input"
            />
          </div>
          <div className="field-error">{errors.email || ""}</div>
        </div>

        <div className="field">
          <label htmlFor="passwordInput" className="field-label">
            {t("label.password")}
          </label>
          <div className="field-control">
            <Lock size={18} className="text-ink-400" aria-hidden="true" />
            <input
              id="passwordInput"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="field-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="icon-btn -mr-2"
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="field-error">{errors.password || ""}</div>
        </div>

        <div className="flex items-center gap-3 px-1 py-1">
          <input
            id="mfaEnabledInput"
            type="checkbox"
            checked={form.mfaEnabled}
            onChange={(e) => handleChange("mfaEnabled", e.target.checked)}
            className="h-5 w-5 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
          />
          <label htmlFor="mfaEnabledInput" className="tap text-[15px] font-medium text-ink-700">
            {t("label.mfa_enabled")}
          </label>
        </div>

        {statusMessages.length > 0 && (
          <ul className="flex flex-col gap-2">
            {statusMessages.map(({ message, type }, index) => (
              <li
                key={index}
                className={`status ${type === "error" ? "status-error" : "status-success"}`}
              >
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

        <div className="action-dock flex flex-col gap-3">
          <button type="submit" className="btn-cta" disabled={submitting}>
            {submitting ? "…" : t("button")}
          </button>
          <Link
            href={`/${locale}/signup`}
            className="tap text-center text-[15px] font-semibold text-accent-600"
          >
            {t("signupLink")}
          </Link>
        </div>
      </form>
    </section>
  );
}
