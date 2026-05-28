"use client";

import { User } from "@types";
import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { connectRequest } from "@services/UserService";
import { useTranslations } from "use-intl";

type Props = {
  user: User;
  isOwnProfile: boolean;
  /** Count from the activity feed — replaces the hardcoded 0 in the badge. */
  activityCount?: number;
  onEdit?: () => void;
  isEditing?: boolean;
};

/* Profile hero — banner, avatar, name, action button, stats row.
 *
 * `isConnected` is initially false because the API doesn't yet return that
 * field on /users/{username}. The first time the user taps "Connect" we
 * flip the local state optimistically; on the next mount the button will
 * read "Connect" again until the backend exposes the relationship. This
 * is a known limitation (see audit #4) — the right fix is a backend
 * change. */
export default function ProfileHeader({
  user,
  isOwnProfile,
  activityCount = 0,
  onEdit,
  isEditing = false,
}: Props) {
  const t = useTranslations("social");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [feedback, setFeedback] = useState<
    { kind: "success" | "error"; text: string } | null
  >(null);

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username || "User";

  const handleConnect = async () => {
    if (!user.username || isConnected) return;
    setIsConnecting(true);
    setFeedback(null);
    try {
      await connectRequest(user.username);
      setIsConnected(true);
      setFeedback({ kind: "success", text: t("connectSuccess", { name: displayName }) });
      setTimeout(() => setFeedback(null), 3500);
    } catch {
      setFeedback({ kind: "error", text: t("connectError") });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="relative mb-6">
      {/* Banner */}
      <div className="h-32 w-full overflow-hidden bg-brand-soft sm:h-40">
        {user.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.bannerUrl}
            alt="Profile Banner"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-brand-gradient opacity-20" />
        )}
      </div>

      <div className="px-5">
        <div className="relative -mt-12 flex items-end justify-between">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-card overflow-hidden">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-ink-100 text-2xl font-bold text-ink-400">
                {user.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="pb-2">
            {isOwnProfile ? (
              !isEditing && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="chip bg-brand-soft text-brand-700 ring-brand-300"
                >
                  {t("editProfile")}
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting || isConnected}
                className={`btn py-2 px-6 ${
                  isConnected
                    ? "bg-ink-100 text-ink-400 shadow-none ring-1 ring-ink-200"
                    : ""
                }`}
              >
                {isConnected ? t("connected") : isConnecting ? "…" : t("connect")}
              </button>
            )}
          </div>
        </div>

        {/* Name & stats */}
        <div className="mt-3">
          <h2 className="h3">{displayName}</h2>
          <p className="text-ink-500">@{user.username}</p>

          <div className="mt-4 flex gap-6 border-y border-ink-50 py-3">
            {user.connectionsCount != null && (
              <div className="flex flex-col">
                <span className="font-bold text-ink-900">
                  {user.connectionsCount + (isConnected ? 1 : 0)}
                </span>
                <span className="text-[12px] text-ink-500 uppercase tracking-wider">
                  {t("connections")}
                </span>
              </div>
            )}
            {(isOwnProfile || user.shareActivity !== false) && (
              <div className="flex flex-col">
                <span className="font-bold text-ink-900">{activityCount}</span>
                <span className="text-[12px] text-ink-500 uppercase tracking-wider">
                  {t("activity")}
                </span>
              </div>
            )}
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            className={`status mt-3 animate-sheet-in ${
              feedback.kind === "error" ? "status-error" : "status-success"
            }`}
          >
            {feedback.kind === "error" ? (
              <AlertCircle size={18} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={18} aria-hidden="true" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
