"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserData, getActivityRequest } from "@services/UserService";
import { User, Activity } from "@types";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";
import AppBar from "@components/AppBar";
import ProfileHeader from "@components/users/ProfileHeader";
import ActivityList from "@components/users/ActivityList";
import { AuthSplash } from "@components/auth/RouteGuard";

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
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;

    if (currentUser?.username === username) {
      router.replace(`/${locale}/profile`);
      return;
    }

    setLoading(true);
    setNotFound(false);
    Promise.all([getUserData(username), getActivityRequest(username)])
      .then(([userData, activityData]) => {
        setTargetUser(userData);
        setActivities(activityData);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username, currentUser, locale, router]);

  if (authLoading || loading) return <AuthSplash />;

  if (notFound || !targetUser) {
    return (
      <section className="app-screen p-0">
        <AppBar title={t("notFoundTitle")} backHref={`/${locale}/connections`} />
        <div className="flex flex-1 items-center justify-center p-10 text-center">
          <p className="text-ink-400">
            {t("notFoundBody", { username })}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="app-screen p-0">
      <AppBar transparent backHref={`/${locale}/connections`} />

      <ProfileHeader
        user={targetUser}
        isOwnProfile={false}
        activityCount={activities.length}
      />

      <div className="px-5 pb-8">
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
    </section>
  );
}
