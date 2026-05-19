"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuth from "@hooks/useAuth";
import { useLocale, useTranslations } from "use-intl";
import { getConnectionsRequest, removeConnectionRequest } from "@services/UserService";
import { UserResponse } from "@types";
import BackButton from "@components/BackButton";
import { Users, UserMinus, AlertCircle } from "lucide-react";

export default function ConnectionsView() {
  const router = useRouter();
  const locale = useLocale();
  const { user, isLoading, updateUser } = useAuth();
  const t = useTranslations("ConnectionsPage");

  const [connections, setConnections] = useState<UserResponse[]>([]);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    getConnectionsRequest()
      .then((data) => {
        setConnections(data);
        updateUser({ connectionsCount: data.length });
      })
      .catch(() => setError(t("error.UNKNOWN_ERROR")))
      .finally(() => setFetched(true));
  }, [isLoading]);

  const handleRemove = async (username: string) => {
    try {
      await removeConnectionRequest(username);
      const updatedList = connections.filter((c) => c.username !== username);
      setConnections(updatedList);
      updateUser({ connectionsCount: updatedList.length });
    } catch {
      setError(t("error.UNKNOWN_ERROR"));
    }
  };

  return (
    <section className="app-screen">
      <div className="pb-2">
        <BackButton />
      </div>
      <header className="flex flex-col gap-1 pt-2 pb-5">
        <h1>{t("title")}</h1>
      </header>

      <div className="flex flex-col gap-4 pb-8">
        {fetched && !error && connections.length === 0 && (
          <div className="card flex flex-col items-center gap-3 py-10 text-center">
            <Users size={40} className="text-ink-300" aria-hidden="true" />
            <p>{t("empty")}</p>
          </div>
        )}

        {fetched && connections.length > 0 && (
          <div className="card flex flex-col">
            <h5 className="mb-3">{t("listTitle")}</h5>
            {connections.map((connection, i) => (
              <div
                key={connection.id}
                className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-ink-100" : ""}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <span className="text-[15px] font-semibold text-brand-600">
                    {connection.firstName?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-ink-900 truncate">
                    {connection.firstName} {connection.lastName}
                  </p>
                  <p className="text-[13px] text-ink-500">@{connection.username}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(connection.username)}
                  aria-label={t("removeAriaLabel", { name: connection.username })}
                  className="icon-btn text-red-600 hover:bg-red-50 active:bg-red-100"
                >
                  <UserMinus size={20} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="status status-error">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </section>
  );
}
