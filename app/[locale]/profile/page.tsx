"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyProfileRequest } from "@services/UserService";
import { UpdateProfileInput } from "@types";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";
import ProfileForm from "@components/users/ProfileForm";
import BackButton from "@components/BackButton";
import ProfileHeader from "@components/users/ProfileHeader";
import ActivityList from "@components/users/ActivityList";
import { getActivityRequest } from "@services/UserService";
import { Activity } from "@types";

export default function ProfilePage() {
  const router = useRouter();
  const locale = useLocale();
  const { user, isLoading } = useAuth();
  const t = useTranslations("social");

  const [isEditing, setIsEditing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profile, setProfile] = useState<UpdateProfileInput>({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    username: "", 
    age: 0,
    bio: "",
    avatarUrl: "",
    bannerUrl: ""
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
          bio: data.bio ?? "",
          avatarUrl: data.avatarUrl ?? "",
          bannerUrl: data.bannerUrl ?? ""
        });
        
        // Fetch activity
        if (data.username) {
          getActivityRequest(data.username).then(setActivities);
        }
      })
      .catch(() => {});
  }, [isLoading, user, router, locale]);

  if (isLoading) return null;

  return (
    <section className="app-screen p-0"> {/* Remove padding to let banner go edge-to-edge */}
      <header className="app-bar border-b-0 bg-transparent absolute top-0 w-full z-40">
        <BackButton />
        <div className="flex-1" />
      </header>
      
      <main className="flex-1 overflow-y-auto pb-safe-b">
        <ProfileHeader 
          user={isEditing ? profile : (user || {})} 
          isOwnProfile={true} 
          onEdit={() => setIsEditing(true)}
        />

        <div className="px-5">
          {isEditing ? (
            <div className="animate-rise">
              <ProfileForm 
                initialProfile={profile} 
                onSuccess={() => setIsEditing(false)}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-rise">
              <div className="card">
                <h5 className="mb-2">{t("about")}</h5>
                <p className={profile.bio ? "text-ink-900" : "text-ink-400 italic"}>
                  {profile.bio || t("noBioSelf")}
                </p>
              </div>

              <ActivityList activities={activities} />

              <div className="flex justify-center pb-8">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-ghost px-8"
                >
                  {t("editProfileDetails")}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </section>
  );
}
