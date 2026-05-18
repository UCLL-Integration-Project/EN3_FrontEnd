"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginRequest } from "@services/UserService";
import { AuthenticationRequest, StatusMessage } from "@types";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import BackButton from "@components/BackButton";
import { sanitizeReturnPath } from "@components/auth/returnUrl";

export default function UserLoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuth();
  const t = useTranslations("UserLoginForm");

  const handleChange = (field: "email" | "password", value: string) => {
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
    };

    setSubmitting(true);
    try {
      const loggedInUser = await loginRequest(authRequest);
      setStatusMessages([{ message: t("success"), type: "success" }]);
      login(loggedInUser);
      // Return to the page the user originally wanted, else home.
      // replace() so the back button can't return to /login after signing in.
      const next = new URLSearchParams(window.location.search).get("next");
      const destination = sanitizeReturnPath(next, `/${locale}`);
      setTimeout(() => router.replace(destination), 500);
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["INVALID_CREDENTIALS", "USERNAME_TAKEN", "NETWORK_ERROR"];
      const messageKey = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setStatusMessages([{ message: t(`error.${messageKey}`), type: "error" }]);
    } finally {
      setSubmitting(false);
    }
  };

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
              className="icon-btn h-9 w-9 -mr-2"
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
