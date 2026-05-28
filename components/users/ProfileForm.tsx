"use client";

import { useEffect, useState } from "react";
import { updateProfileRequest } from "@services/UserService";
import { StatusMessage, UpdateProfileInput } from "@types";
import useAuth from "@hooks/useAuth";
import { useTranslations } from "use-intl";

type Props = {
  initialProfile: UpdateProfileInput;
  onSuccess?: () => void;
  onCancel?: () => void;
  onSaved?: (saved: UpdateProfileInput) => void;
};

export default function ProfileForm({ initialProfile, onSuccess, onCancel, onSaved }: Props) {
  const { updateUser } = useAuth();
  const t = useTranslations("UserSettingsForm");
  const ts = useTranslations("social");

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
    if (profile.bio && profile.bio.length > 200) errs.bio = "Bio is too long (max 200 chars)";
    if (profile.location && profile.location.length > 100) errs.location = "Location is too long (max 100 chars)";
    if (profile.website && !/^https?:\/\/.+/.test(profile.website)) errs.website = "Must start with https:// or http://";
    if (profile.website && profile.website.length > 255) errs.website = "Website URL is too long (max 255 chars)";
    if (profile.interests && profile.interests.length > 300) errs.interests = "Interests is too long (max 300 chars)";
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
        age: updated.age,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl,
        bannerUrl: updated.bannerUrl,
        location: updated.location ?? undefined,
        website: updated.website ?? undefined,
        interests: updated.interests ?? undefined,
      });
      setStatus([{ message: t("profileSuccess"), type: "success" }]);
      if (onSaved) {
        onSaved({
          firstName: updated.firstName ?? "",
          lastName: updated.lastName ?? "",
          email: updated.email ?? "",
          username: updated.username ?? "",
          age: updated.age ?? 0,
          bio: updated.bio ?? "",
          avatarUrl: updated.avatarUrl ?? "",
          bannerUrl: updated.bannerUrl ?? "",
          location: updated.location ?? "",
          website: updated.website ?? "",
          interests: updated.interests ?? "",
        });
      }
      if (onSuccess) {
        setTimeout(onSuccess, 800);
      }
    } catch (error) {
      const code = (error as Error).message;
      const knownCodes = ["EMAIL_TAKEN", "USERNAME_TAKEN", "NETWORK_ERROR"];
      const key = knownCodes.includes(code) ? code : "UNKNOWN_ERROR";
      setStatus([{ message: t(`error.${key}`), type: "error" }]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col pb-24">
      <div className="flex flex-col gap-4 mt-2">
        <h5 className="px-1 text-ink-500">{ts("publicProfile")}</h5>
        
        <div className="field">
          <label htmlFor="bioInput" className="field-label">{ts("about")}</label>
          <div className="field-control h-auto py-3">
            <textarea
              id="bioInput"
              rows={3}
              value={profile.bio || ""}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              className="field-input resize-none"
              placeholder={ts("bioPlaceholder")}
            />
          </div>
          <div className="field-error">{errors.bio || ""}</div>
        </div>

        <div className="field">
          <label htmlFor="avatarUrlInput" className="field-label">{ts("avatarUrl")}</label>
          <div className="field-control">
            <input
              id="avatarUrlInput"
              type="text"
              value={profile.avatarUrl || ""}
              onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))}
              className="field-input"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="bannerUrlInput" className="field-label">{ts("bannerUrl")}</label>
          <div className="field-control">
            <input
              id="bannerUrlInput"
              type="text"
              value={profile.bannerUrl || ""}
              onChange={(e) => setProfile((p) => ({ ...p, bannerUrl: e.target.value }))}
              className="field-input"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="locationInput" className="field-label">{ts("location")}</label>
          <div className="field-control">
            <input
              id="locationInput"
              type="text"
              value={profile.location || ""}
              onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
              className="field-input"
              placeholder={ts("locationPlaceholder")}
              autoCorrect="off"
            />
          </div>
          <div className="field-error">{errors.location || ""}</div>
        </div>

        <div className="field">
          <label htmlFor="websiteInput" className="field-label">{ts("website")}</label>
          <div className="field-control">
            <input
              id="websiteInput"
              type="url"
              value={profile.website || ""}
              onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
              className="field-input"
              placeholder="https://..."
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          <div className="field-error">{errors.website || ""}</div>
        </div>

        <div className="field">
          <label htmlFor="interestsInput" className="field-label">{ts("interests")}</label>
          <div className="field-control h-auto py-3">
            <textarea
              id="interestsInput"
              rows={2}
              value={profile.interests || ""}
              onChange={(e) => setProfile((p) => ({ ...p, interests: e.target.value }))}
              className="field-input resize-none"
              placeholder={ts("interestsPlaceholder")}
            />
          </div>
          <div className="field-error">{errors.interests || ""}</div>
        </div>

        <hr className="my-2 border-ink-100" />
        <h5 className="px-1 text-ink-500">{ts("accountDetails")}</h5>

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

      <div className="action-dock gap-3 flex flex-col sm:flex-row">
        {status.length > 0 && (
          <div className="mb-2 flex flex-col gap-2">
            {status.map(({ message, type }, i) => (
              <div key={i} className={`status ${type === "error" ? "status-error" : "status-success"}`}>
                {message}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3 w-full">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="btn-ghost flex-1"
            >
              {t("cancelButton")}
            </button>
          )}
          <button className="btn-cta flex-[2]" type="submit">
            {t("saveButton")}
          </button>
        </div>
      </div>
    </form>
  );
}
