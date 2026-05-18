"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyProfileRequest } from "@services/UserService";
import { UpdateProfileInput } from "@types";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";
import ProfileForm from "@components/users/ProfileForm";
import ChangePasswordForm from "@components/users/ChangePasswordForm";
import LogoutSection from "@components/users/LogoutSection";
import BackButton from "@components/BackButton";

export default function UserSettingsForm() {
  const router = useRouter();
  const locale = useLocale();
  const { user, isLoading } = useAuth();
  const t = useTranslations("UserSettingsForm");

  const [profile, setProfile] = useState<UpdateProfileInput>({ firstName: "", lastName: "", email: "" });

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    getMyProfileRequest()
      .then((data) => {
        setProfile({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
        });
      })
      .catch(() => {});
  }, [isLoading]);

  return (
    <section className="app-screen">
      <div className="pb-2">
        <BackButton />
      </div>
      <header className="flex flex-col gap-1 pt-2 pb-5">
        <h1>{t("title")}</h1>
      </header>
      <div className="flex flex-col gap-4 pb-8">
        <ProfileForm initialProfile={profile} />
        <ChangePasswordForm />
        <LogoutSection />
      </div>
    </section>
  );
}
