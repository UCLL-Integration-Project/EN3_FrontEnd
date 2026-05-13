"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginRequest } from "@services/UserService";
import { AuthenticationRequest, StatusMessage } from "@types";
import useAuth from "@hooks/useAuth";
import { useTranslations } from "use-intl";

export default function UserLoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const router = useRouter();
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
      const loggedInUser = await loginRequest(authRequest);
      setStatusMessages([{ message: t("success"), type: "success" }]);
      login(loggedInUser);
      setTimeout(() => router.push(`/`), 500);
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["INVALID_CREDENTIALS", "USERNAME_TAKEN", "NETWORK_ERROR"];
      const messageKey = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setStatusMessages([{ message: t(`error.${messageKey}`), type: "error" }]);
    }
  };

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
