"use client";

import { useEffect, useState } from "react";
import { getMyProfileRequest, getActivityRequest } from "@services/UserService";
import { Activity, UpdateProfileInput } from "@types";
import useAuth from "@hooks/useAuth";
import { useTranslations } from "use-intl";
import ProfileForm from "@components/users/ProfileForm";
import ProfileHeader from "@components/users/ProfileHeader";
import ActivityList from "@components/users/ActivityList";
import AppBar from "@components/AppBar";
import { AuthGuard } from "@components/auth/RouteGuard";

function OwnProfile() {
  const { user, updateUser } = useAuth();
  const t = useTranslations("social");

  const [isEditing, setIsEditing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UpdateProfileInput>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    age: 0,
    bio: "",
    avatarUrl: "",
    bannerUrl: "",
  });

  useEffect(() => {
    let cancelled = false;
    getMyProfileRequest()
      .then((data) => {
        if (cancelled) return;
        setProfile({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          username: data.username ?? "",
          age: data.age ?? 0,
          bio: data.bio ?? "",
          avatarUrl: data.avatarUrl ?? "",
          bannerUrl: data.bannerUrl ?? "",
        });
        if (data.connectionsCount !== undefined) {
          updateUser({ connectionsCount: data.connectionsCount });
        }
        if (data.username) {
          getActivityRequest(data.username).then((res) => {
            if (!cancelled) setActivities(res);
          }).catch(() => { /* activity is optional */ });
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(t("loadError"));
      });
    return () => {
      cancelled = true;
    };
    // updateUser is stable via useAuth's context; safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="app-screen p-0">
      <AppBar transparent showBack={false} />

      <ProfileHeader
        user={isEditing ? profile : (user || {})}
        isOwnProfile
        activityCount={activities.length}
        onEdit={() => setIsEditing(true)}
      />

      <div className="px-5 pb-8">
        {loadError && (
          <div className="status status-error mb-4">
            <span>{loadError}</span>
          </div>
        )}

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
          </div>
        )}
      </div>
    </section>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <OwnProfile />
    </AuthGuard>
  );
}
