"use client";

import { useEffect, useState } from "react";
import { updateProfileRequest } from "@services/UserService";
import { StatusMessage, UpdateProfileInput } from "@types";
import useAuth from "@hooks/useAuth";
import { useTranslations } from "use-intl";

type Props = {
  initialProfile: UpdateProfileInput;
};

export default function ProfileForm({ initialProfile }: Props) {
  const { updateUser } = useAuth();
  const t = useTranslations("UserSettingsForm");

  const [profile, setProfile] = useState<UpdateProfileInput>(initialProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<StatusMessage[]>([]);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!profile.firstName.trim()) errs.firstName = t("validate.error");
    if (!profile.lastName.trim()) errs.lastName = t("validate.error");
    if (!profile.email.trim() || !/^\S+@\S+\.\S+$/.test(profile.email)) errs.email = t("validate.error");
    if (!profile.username.trim()) errs.username = t("validate.error");
    if (profile.age === undefined || profile.age <= 0) errs.age = t("validate.error");
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
      updateUser({ 
        firstName: updated.firstName, 
        lastName: updated.lastName, 
        email: updated.email,
        username: updated.username,
        age: updated.age
      });
      setStatus([{ message: t("profileSuccess"), type: "success" }]);
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["EMAIL_TAKEN", "USERNAME_TAKEN", "NETWORK_ERROR"];
      const key = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setStatus([{ message: t(`error.${key}`), type: "error" }]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
      <div className="flex flex-col gap-4 mt-2">
        <div className="field">
          <label htmlFor="usernameInput" className="field-label">{t("label.username") || "Username"}</label>
          <div className="field-control">
            <input
              id="usernameInput"
              type="text"
              value={profile.username}
              onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
              className="field-input"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          <div className="field-error">{errors.username || ""}</div>
        </div>

        <div className="field">
          <label htmlFor="firstNameInput" className="field-label">{t("label.firstName")}</label>
          <div className="field-control">
            <input
              id="firstNameInput"
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
              className="field-input"
            />
          </div>
          <div className="field-error">{errors.firstName || ""}</div>
        </div>

        <div className="field">
          <label htmlFor="lastNameInput" className="field-label">{t("label.lastName")}</label>
          <div className="field-control">
            <input
              id="lastNameInput"
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
              className="field-input"
            />
          </div>
          <div className="field-error">{errors.lastName || ""}</div>
        </div>

        <div className="field">
          <label htmlFor="emailInput" className="field-label">{t("label.email")}</label>
          <div className="field-control">
            <input
              id="emailInput"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className="field-input"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          <div className="field-error">{errors.email || ""}</div>
        </div>

        <div className="field">
          <label htmlFor="ageInput" className="field-label">{t("label.age") || "Age"}</label>
          <div className="field-control">
            <input
              id="ageInput"
              type="number"
              value={profile.age || ""}
              onChange={(e) => setProfile((p) => ({ ...p, age: parseInt(e.target.value) || 0 }))}
              className="field-input"
              inputMode="numeric"
            />
          </div>
          <div className="field-error">{errors.age || ""}</div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="action-dock">
        {status.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {status.map(({ message, type }, i) => (
              <div key={i} className={`status ${type === "error" ? "status-error" : "status-success"}`}>
                {message}
              </div>
            ))}
          </div>
        )}
        <button className="btn-cta" type="submit">
          {t("saveButton")}
        </button>
      </div>
    </form>
  );
}
