"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signupRequest } from "@services/UserService";
import { StatusMessage, User } from "@types";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";
import {
  AtSign,
  User as UserIcon,
  IdCard,
  Mail,
  Cake,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LucideIcon,
} from "lucide-react";
import BackButton from "@components/BackButton";

type FieldKey = "username" | "firstName" | "lastName" | "email" | "age" | "password";

const ICONS: Record<FieldKey, LucideIcon> = {
  username: AtSign,
  firstName: UserIcon,
  lastName: IdCard,
  email: Mail,
  age: Cake,
  password: Lock,
};

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
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuth();
  const t = useTranslations("UserSignupForm");

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
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = t("validate.error");

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

    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (
    key: FieldKey,
    options: {
      type?: string;
      autoComplete?: string;
      inputMode?: "text" | "email" | "numeric";
      capitalize?: "none" | "words";
    } = {}
  ) => {
    const isPassword = key === "password";
    const FieldIcon = ICONS[key];
    return (
      <div className="field" key={key}>
        <label htmlFor={`${key}Input`} className="field-label">
          {t(`label.${key}`)}
        </label>
        <div className="field-control">
          <FieldIcon size={18} className="text-ink-400" aria-hidden="true" />
          <input
            id={`${key}Input`}
            type={isPassword ? (showPassword ? "text" : "password") : options.type ?? "text"}
            autoComplete={options.autoComplete}
            inputMode={options.inputMode}
            autoCapitalize={options.capitalize ?? "none"}
            autoCorrect="off"
            value={form[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            className="field-input"
            min={key === "age" ? 0 : undefined}
          />
          {isPassword && (
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
          )}
        </div>
        <div className="field-error">{errors[key] || ""}</div>
      </div>
    );
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

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-3.5" noValidate>
        {renderField("username", { autoComplete: "username" })}
        <div className="grid grid-cols-2 gap-3">
          {renderField("firstName", { autoComplete: "given-name", capitalize: "words" })}
          {renderField("lastName", { autoComplete: "family-name", capitalize: "words" })}
        </div>
        {renderField("email", {
          type: "email",
          autoComplete: "email",
          inputMode: "email",
        })}
        {renderField("age", { type: "number", inputMode: "numeric" })}
        {renderField("password", { autoComplete: "new-password" })}

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
            href={`/${locale}/login`}
            className="tap text-center text-[15px] font-semibold text-accent-600"
          >
            {t("loginLink")}
          </Link>
        </div>
      </form>
    </section>
  );
}
