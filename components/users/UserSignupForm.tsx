"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signupRequest } from "@services/UserService";
import { StatusMessage, User } from "@types";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";

export default function UserSignupForm() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    age: "",
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuth();
  const t = useTranslations("UserSignupForm");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.username.trim()) newErrors.username = t("validate.error");
    if (!form.password.trim()) {
      newErrors.password = t("validate.error");
    } else if (form.password.length < 8) {
      newErrors.password = t("validate.weakPassword");
    }
    if (!form.firstName.trim()) newErrors.firstName = t("validate.error");
    if (!form.lastName.trim()) newErrors.lastName = t("validate.error");
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = t("validate.error");

    const ageNum = parseInt(form.age, 10);
    if (!form.age.trim() || isNaN(ageNum) || ageNum < 0) {
      newErrors.age = t("validate.error");
    }

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

    const userInput: User = {
      username: form.username,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      age: parseInt(form.age, 10),
    };

    try {
      const newUser = await signupRequest(userInput);
      setStatusMessages([{ message: t("success"), type: "success" }]);
      login(newUser);
      setTimeout(() => router.push(`/`), 500);
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["USERNAME_TAKEN", "EMAIL_TAKEN", "NETWORK_ERROR"];
      const messageKey = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setStatusMessages([{ message: t(`error.${messageKey}`), type: "error" }]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex Padding Border Gap flex-col">
      <div className="Wrapper flex-col">
        <div className="flex gap-1">
          <label htmlFor="usernameInput">{t("label.username")}</label>
          <div className="min-h-6 text-red-500">{errors.username || ""}</div>
        </div>
        <div className="input-wrapper">
          <input
            id="usernameInput"
            type="text"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="Wrapper flex-col">
        <div className="flex gap-1">
          <label htmlFor="firstNameInput">{t("label.firstName")}</label>
          <div className="min-h-6 text-red-500">{errors.firstName || ""}</div>
        </div>
        <div className="input-wrapper">
          <input
            id="firstNameInput"
            type="text"
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="Wrapper flex-col">
        <div className="flex gap-1">
          <label htmlFor="lastNameInput">{t("label.lastName")}</label>
          <div className="min-h-6 text-red-500">{errors.lastName || ""}</div>
        </div>
        <div className="input-wrapper">
          <input
            id="lastNameInput"
            type="text"
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="Wrapper flex-col">
        <div className="flex gap-1">
          <label htmlFor="emailInput">{t("label.email")}</label>
          <div className="min-h-6 text-red-500">{errors.email || ""}</div>
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
          <label htmlFor="ageInput">{t("label.age")}</label>
          <div className="min-h-6 text-red-500">{errors.age || ""}</div>
        </div>
        <div className="input-wrapper">
          <input
            id="ageInput"
            type="number"
            min="0"
            value={form.age}
            onChange={(e) => handleChange("age", e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="Wrapper flex-col">
        <div className="flex gap-1">
          <label htmlFor="passwordInput">{t("label.password")}</label>
          <div className="min-h-6 text-red-500">{errors.password || ""}</div>
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
            <li key={index} className={type === "error" ? "text-red-500" : "text-green-500"}>
              {message}
            </li>
          ))}
        </ul>
      </div>

      <Link href={`/${locale}/login`} className="text-blue-500 hover:underline self-start">
        {t("loginLink")}
      </Link>
    </form>
  );
}
