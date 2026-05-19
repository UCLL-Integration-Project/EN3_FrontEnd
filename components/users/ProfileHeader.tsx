"use client";

import { User } from "@types";
import { useState } from "react";
import { connectRequest } from "@services/UserService";
import { useTranslations } from "use-intl";

type Props = {
  user: User;
  isOwnProfile: boolean;
  onEdit?: () => void;
};

export default function ProfileHeader({ user, isOwnProfile, onEdit }: Props) {
  const t = useTranslations("social");
  const [isConnected, setIsConnected] = useState(false); // This would ideally come from backend
  const [isConnecting, setIsConnecting] = useState(false);

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username || "User";

  const handleConnect = async () => {
    if (!user.username || isConnected) return;
    setIsConnecting(true);
    try {
      await connectRequest(user.username);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="relative mb-6">
      {/* Banner */}
      <div className="h-32 w-full overflow-hidden bg-brand-soft sm:h-40">
        {user.bannerUrl ? (
          <img 
            src={user.bannerUrl} 
            alt="Profile Banner" 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-brand-gradient opacity-20" />
        )}
      </div>

      {/* Profile Info Area */}
      <div className="px-5">
        <div className="relative -mt-12 flex items-end justify-between">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-card overflow-hidden">
            {user.avatarUrl ? (
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

          {/* Action Button */}
          <div className="pb-2">
            {isOwnProfile ? (
              <button 
                onClick={onEdit}
                className="chip bg-brand-soft text-brand-700 ring-brand-300"
              >
                {t("editProfile")}
              </button>
            ) : (
              <button 
                onClick={handleConnect}
                disabled={isConnecting || isConnected}
                className={`btn py-2 px-6 ${isConnected ? "bg-ink-100 text-ink-400 shadow-none ring-1 ring-ink-200" : ""}`}
              >
                {isConnected ? t("connected") : (isConnecting ? "..." : t("connect"))}
              </button>
            )}
          </div>
        </div>

        {/* Name & Stats */}
        <div className="mt-3">
          <h2 className="h3">{displayName}</h2>
          <p className="text-ink-500">@{user.username}</p>
          
          <div className="mt-4 flex gap-6 border-y border-ink-50 py-3">
            <div className="flex flex-col">
              <span className="font-bold text-ink-900">
                {(user.connectionsCount || 0) + (isConnected ? 1 : 0)}
              </span>
              <span className="text-[12px] text-ink-500 uppercase tracking-wider">{t("connections")}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-ink-900">0</span>
              <span className="text-[12px] text-ink-500 uppercase tracking-wider">{t("activity")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
