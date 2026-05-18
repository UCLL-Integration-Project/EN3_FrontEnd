"use client";

import { useEffect, useState } from "react";
import { updateProfileRequest } from "@services/UserService";
import { StatusMessage, UpdateProfileInput } from "@types";
import useAuth from "@hooks/useAuth";
import { useTranslations } from "use-intl";
import { User as UserIcon, IdCard, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

type Props = {
  initialProfile: UpdateProfileInput;
};

export default function ProfileForm({ initialProfile }: Props) {
  const { updateUser } = useAuth();
  const t = useTranslations("UserSettingsForm");

  const [profile, setProfile] = useState<UpdateProfileInput>(initialProfile);
  const [errors, setErrors] = useState<Partial<UpdateProfileInput>>({});
  const [status, setStatus] = useState<StatusMessage[]>([]);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const validate = () => {
    const errs: Partial<UpdateProfileInput> = {};
    if (!profile.firstName.trim()) errs.firstName = t("validate.error");
    if (!profile.lastName.trim()) errs.lastName = t("validate.error");
    if (!profile.email.trim() || !/^\S+@\S+\.\S+$/.test(profile.email)) errs.email = t("validate.error");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatus([]);
    if (!validate()) return;

    try {
      const updated = await updateProfileRequest(profile);
      updateUser({ firstName: updated.firstName, lastName: updated.lastName, email: updated.email });
      setStatus([{ message: t("profileSuccess"), type: "success" }]);
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["EMAIL_TAKEN", "NETWORK_ERROR"];
      const key = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setStatus([{ message: t(`error.${key}`), type: "error" }]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4" noValidate>
      <h5>{t("profileTitle")}</h5>

      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label htmlFor="firstNameInput" className="field-label">
            {t("label.firstName")}
          </label>
          <div className="field-control">
            <UserIcon size={18} className="text-ink-400" aria-hidden="true" />
            <input
              id="firstNameInput"
              type="text"
              autoComplete="given-name"
              autoCapitalize="words"
              autoCorrect="off"
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
              className="field-input"
            />
          </div>
          <div className="field-error">{errors.firstName || ""}</div>
        </div>

        <div className="field">
          <label htmlFor="lastNameInput" className="field-label">
            {t("label.lastName")}
          </label>
          <div className="field-control">
            <IdCard size={18} className="text-ink-400" aria-hidden="true" />
            <input
              id="lastNameInput"
              type="text"
              autoComplete="family-name"
              autoCapitalize="words"
              autoCorrect="off"
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
              className="field-input"
            />
          </div>
          <div className="field-error">{errors.lastName || ""}</div>
        </div>
      </div>

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
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            className="field-input"
          />
        </div>
        <div className="field-error">{errors.email || ""}</div>
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
