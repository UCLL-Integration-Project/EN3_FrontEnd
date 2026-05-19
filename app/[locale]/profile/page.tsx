"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyProfileRequest } from "@services/UserService";
import { UpdateProfileInput } from "@types";
import useAuth from "@hooks/useAuth";
import { useLocale } from "use-intl";
import ProfileForm from "@components/users/ProfileForm";
import BackButton from "@components/BackButton";

export default function ProfilePage() {
  const router = useRouter();
  const locale = useLocale();
  const { user, isLoading } = useAuth();

  const [profile, setProfile] = useState<UpdateProfileInput>({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    username: "", 
    age: 0 
  });

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
          username: data.username ?? "",
          age: data.age ?? 0,
        });
      })
      .catch(() => {});
  }, [isLoading, user, router, locale]);

  return (
    <section className="app-screen">
      <header className="app-bar">
        <BackButton />
        <h1 className="flex-1 text-center h4">Profile</h1>
        <div className="w-12" /> {/* Spacer to balance the BackButton */}
      </header>
      
      <main className="flex-1 overflow-y-auto pb-safe-b">
        <ProfileForm initialProfile={profile} />
      </main>
    </section>
  );
}
