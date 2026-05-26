"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserData, getActivityRequest } from "@services/UserService";
import { User, Activity } from "@types";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";
import BackButton from "@components/BackButton";
import ProfileHeader from "@components/users/ProfileHeader";
import ActivityList from "@components/users/ActivityList";

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("social");
  const { user: currentUser, isLoading: authLoading } = useAuth();

  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    // If viewing own profile, redirect to /profile
    if (currentUser?.username === username) {
      router.replace(`/${locale}/profile`);
      return;
    }

    setLoading(true);
    Promise.all([
      getUserData(username),
      getActivityRequest(username)
    ])
    .then(([userData, activityData]) => {
      setTargetUser(userData);
      setActivities(activityData);
    })
    .catch(() => {
      // Handle user not found or other errors
    })
    .finally(() => {
      setLoading(false);
    });
  }, [username, currentUser, locale, router]);

  if (authLoading || loading) return null;

  if (!targetUser) {
    return (
      <section className="app-screen">
        <header className="app-bar">
          <BackButton />
          <h1 className="h4">Not Found</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-10 text-center">
          <p className="text-ink-400">User &ldquo;@{username}&rdquo; does not exist or profile is private.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="app-screen p-0">
      <header className="app-bar border-b-0 bg-transparent absolute top-0 w-full z-40">
        <BackButton />
        <div className="flex-1" />
      </header>
      
      <main className="flex-1 overflow-y-auto pb-safe-b">
        <ProfileHeader 
          user={targetUser} 
          isOwnProfile={false} 
        />

        <div className="px-5">
          <div className="flex flex-col gap-6 animate-rise">
            <div className="card">
              <h5 className="mb-2">{t("about")}</h5>
              <p className={targetUser.bio ? "text-ink-900" : "text-ink-400 italic"}>
                {targetUser.bio || t("noBio")}
              </p>
            </div>

            <ActivityList activities={activities} />
          </div>
        </div>
      </main>
    </section>
  );
}
