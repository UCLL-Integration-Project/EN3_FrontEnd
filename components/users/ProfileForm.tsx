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
    <form onSubmit={handleSubmit} className="flex Padding Border Gap flex-col">
      <h5>{t("profileTitle")}</h5>

      <div className="Wrapper flex-col">
        <div className="flex gap-1">
          <label htmlFor="firstNameInput">{t("label.firstName")}</label>
          <div className="min-h-6 text-red-500">{errors.firstName || ""}</div>
        </div>
        <div className="input-wrapper">
          <input
            id="firstNameInput"
            type="text"
            value={profile.firstName}
            onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
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
            value={profile.lastName}
            onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
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
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
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
