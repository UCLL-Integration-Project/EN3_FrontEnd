"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginRequest } from "@services/UserService";
import { AuthenticationRequest, StatusMessage } from "@types";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";

export default function UserLoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [mfaCode, setMfaCode] = useState("");
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; mfa?: string }>({});
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuth();
  const t = useTranslations("UserLoginForm");
  const [showPassword, setShowPassword] = useState(false);

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

    try {
      const response = await loginRequest(authRequest);
      // If token is null, it means MFA is required
      if (response.username && !response.token) {
        setTempUsername(response.username);
        setIsMfaRequired(true);
        setStatusMessages([{ message: t("mfa_required"), type: "success" }]);
      } else {
        setStatusMessages([{ message: t("success"), type: "success" }]);
        login(response);
        setTimeout(() => router.push(`/`), 500);
      }
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["INVALID_CREDENTIALS", "USERNAME_TAKEN", "NETWORK_ERROR"];
      const messageKey = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setStatusMessages([{ message: t(`error.${messageKey}`), type: "error" }]);
    }
  };

  const handleMfaSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearMessages();
    if (!mfaCode.trim()) {
      setErrors({ mfa: t("validate.error") });
      return;
    }

    try {
      const { verifyMfaRequest } = await import("@services/UserService");
      const loggedInUser = await verifyMfaRequest(tempUsername, mfaCode);
      setStatusMessages([{ message: t("success"), type: "success" }]);
      login(loggedInUser);
      setTimeout(() => router.push(`/`), 500);
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["MFA_CODE_NOT_FOUND", "MFA_CODE_EXPIRED", "INVALID_MFA_CODE", "NETWORK_ERROR"];
      const messageKey = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setStatusMessages([{ message: t(`error.${messageKey}`), type: "error" }]);
    }
  };

  if (isMfaRequired) {
    return (
      <form onSubmit={handleMfaSubmit} className="flex Padding Border Gap flex-col">
        <div className="Wrapper flex-col">
          <div className="flex gap-1">
            <label htmlFor="mfaInput">{t("label.mfa_code")}</label>
            <div className="min-h-6 text-red-500-500">{errors.mfa || ""}</div>
          </div>
          <div className="input-wrapper">
            <input
              id="mfaInput"
              type="text"
              placeholder="123456"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="input text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>
        </div>

        <div className="Wrapper Gap items-center">
          <button className="btn" type="submit">
            {t("button_verify")}
          </button>
          <ul>
            {statusMessages.map(({ message, type }, index) => (
              <li key={index} className={type === "error" ? "text-red-500-500" : "text-green-500-500"}>
                {message}
              </li>
            ))}
          </ul>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex Padding Border Gap flex-col">
      <div className="Wrapper flex-col">
        <div className="flex gap-1">
          <label htmlFor="emailInput">{t("label.email")}</label>
          <div className="min-h-6 text-red-500-500">{errors.email || ""}</div>
        </div>
        <div className="input-wrapper">
          <input
            id="emailInput"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="Wrapper flex-col">
        <div className="flex gap-1">
          <label htmlFor="passwordInput">{t("label.password")}</label>
          <div className="min-h-6 text-red-500-500">{errors.password || ""}</div>
        </div>
        <div className="flex input-wrapper">
          <input
            id="passwordInput"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="input"
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} className="Center">
            <span className="material-symbols-outlined min-w-[2em]">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      <div className="Wrapper Gap items-center">
        <button className="btn" type="submit">
          {t("button")}
        </button>
        <ul>
          {statusMessages.map(({ message, type }, index) => (
            <li key={index} className={type === "error" ? "text-red-500-500" : "text-green-500-500"}>
              {message}
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
