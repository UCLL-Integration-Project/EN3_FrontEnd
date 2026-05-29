"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import useAuth from "@hooks/useAuth";
import { useTranslations } from "use-intl";
import { getConnectionsRequest, removeConnectionRequest, setConnectionLevelRequest } from "@services/UserService";
import { ConnectionDTO, ConnectionLevel } from "@types";
import { AlertCircle, CheckCircle2, ChevronDown, Users, UserMinus, SlidersHorizontal, X } from "lucide-react";
import AppBar from "@components/AppBar";
import SortBar, { SortState } from "@components/Sort&Filter/SortBar";
import FilterBar, { LevelFilter } from "@components/Sort&Filter/FilterBar";

const DEFAULT_SORT: SortState = { field: "name", dir: "asc" };
const DEFAULT_LEVEL: LevelFilter = "ALL";
const DEFAULT_SEARCH = "";

export default function ConnectionsView() {
  const { updateUser } = useAuth();
  const t = useTranslations("ConnectionsPage");

  const [connections, setConnections] = useState<ConnectionDTO[]>([]);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState("");
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter + sort state
  const [search, setSearch] = useState(DEFAULT_SEARCH);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>(DEFAULT_LEVEL);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [showControls, setShowControls] = useState(false);

  const isDirty =
    search !== DEFAULT_SEARCH ||
    levelFilter !== DEFAULT_LEVEL ||
    sort.field !== DEFAULT_SORT.field ||
    sort.dir !== DEFAULT_SORT.dir;

  function resetAll() {
    setSearch(DEFAULT_SEARCH);
    setLevelFilter(DEFAULT_LEVEL);
    setSort(DEFAULT_SORT);
  }

  useEffect(() => {
    let cancelled = false;
    getConnectionsRequest()
      .then((data) => {
        if (cancelled) return;
        setConnections(data);
        updateUser({ connectionsCount: data.length });
      })
      .catch(() => {
        if (!cancelled) setError(t("error.UNKNOWN_ERROR"));
      })
      .finally(() => {
        if (!cancelled) setFetched(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flash(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  const formatLevel = (level: ConnectionLevel | undefined): string => {
    const normalizedLevel = level || "CONTACT";
    if (normalizedLevel === "BEST_FRIEND") return "Best Friend";
    return normalizedLevel.charAt(0) + normalizedLevel.slice(1).toLowerCase();
  };

  const handleRemove = async (username: string) => {
    try {
      await removeConnectionRequest(username);
      const updatedList = connections.filter((c) => c.username !== username);
      setConnections(updatedList);
      updateUser({ connectionsCount: updatedList.length });
      flash(t("removed", { name: username }));
    } catch {
      setError(t("error.UNKNOWN_ERROR"));
    }
  };

  const handleSetLevel = async (username: string, level: ConnectionLevel) => {
    try {
      await setConnectionLevelRequest(username, level);
      const updatedList = connections.map((c) => (c.username === username ? { ...c, level } : c));
      setConnections(updatedList);
      setExpandedLevel(null);
      flash(t("levelChanged", { name: username, level: formatLevel(level) }));
    } catch {
      setError(t("error.UNKNOWN_ERROR"));
    }
  };

  // Derived: filtered + sorted list
  type SortableConnection = ConnectionDTO & { createdAt?: string | number; lastActiveAt?: string | number };

  const displayedConnections = useMemo(() => {
    let list: SortableConnection[] = [...connections];

    // Filter by search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.username.toLowerCase().includes(q) ||
          (c.firstName ?? "").toLowerCase().includes(q) ||
          (c.lastName ?? "").toLowerCase().includes(q),
      );
    }

    // Filter by level
    if (levelFilter !== "ALL") {
      list = list.filter((c) => (c.level || "CONTACT") === levelFilter);
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sort.field === "name") {
        const aName = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim().toLowerCase() || a.username;
        const bName = `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim().toLowerCase() || b.username;
        cmp = aName.localeCompare(bName);
      } else if (sort.field === "dateAdded") {
        cmp = (a.createdAt ?? 0) < (b.createdAt ?? 0) ? -1 : 1;
      } else if (sort.field === "recentlyActive") {
        cmp = (a.lastActiveAt ?? 0) < (b.lastActiveAt ?? 0) ? -1 : 1;
      }
      return sort.dir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [connections, search, levelFilter, sort]);

  const activeFilterCount = [search !== DEFAULT_SEARCH, levelFilter !== DEFAULT_LEVEL].filter(Boolean).length;

  return (
    <section className="app-screen p-0">
      <AppBar title={t("title")} showBack={false} />

      <div className="flex flex-col gap-4 px-5 py-5 pb-8">
        {toast && (
          <div role="status" className="status status-success animate-sheet-in">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{toast}</span>
          </div>
        )}

        {/* Controls toggle + reset row */}
        {fetched && connections.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowControls((v) => !v)}
              aria-expanded={showControls}
              aria-controls="connections-controls"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 bg-white text-[13px] font-medium text-ink-700 active:bg-ink-100"
            >
              <SlidersHorizontal size={14} aria-hidden="true" />
              {t("filterSort")}
              {activeFilterCount > 0 && (
                <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {isDirty && (
              <button
                type="button"
                onClick={resetAll}
                className="flex items-center gap-1 text-[12px] text-ink-500 underline underline-offset-2 active:text-ink-800"
              >
                <X size={12} aria-hidden="true" />
                {t("resetAll")}
              </button>
            )}
          </div>
        )}

        {/* Expandable controls panel */}
        {fetched && connections.length > 0 && showControls && (
          <div id="connections-controls" className="card flex flex-col gap-3 py-3">
            <FilterBar search={search} onSearchChange={setSearch} level={levelFilter} onLevelChange={setLevelFilter} />
            <div className="border-t border-ink-100 pt-3">
              <SortBar sort={sort} onSortChange={setSort} />
            </div>
          </div>
        )}

        {/* Empty (no connections at all) */}
        {fetched && !error && connections.length === 0 && (
          <div className="card flex flex-col items-center gap-3 py-10 text-center">
            <Users size={40} className="text-ink-300" aria-hidden="true" />
            <p>{t("empty")}</p>
            <p className="text-[12px] text-ink-400">{t("emptyHint")}</p>
          </div>
        )}

        {/* Empty (no matches after filter/sort) */}
        {fetched && connections.length > 0 && displayedConnections.length === 0 && (
          <div className="card flex flex-col items-center gap-3 py-10 text-center">
            <Users size={40} className="text-ink-300" aria-hidden="true" />
            <p className="text-[15px] font-medium text-ink-700">{t("noMatches")}</p>
            <p className="text-[12px] text-ink-400">{t("noMatchesHint")}</p>
            <button
              type="button"
              onClick={resetAll}
              className="mt-1 px-4 py-1.5 rounded-lg bg-brand-600 text-white text-[13px] font-medium active:opacity-80"
            >
              {t("resetAll")}
            </button>
          </div>
        )}

        {/* Connection list */}
        {fetched && displayedConnections.length > 0 && (
          <div className="card flex flex-col">
            <h5 className="mb-1">
              {t("listTitle")}
              {isDirty && (
                <span className="ml-2 text-[12px] font-normal text-ink-400">
                  {displayedConnections.length} / {connections.length}
                </span>
              )}
            </h5>
            {displayedConnections.map((connection, i) => (
              <div key={connection.id}>
                <div className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-ink-100" : ""}`}>
                  <Link
                    href={`/profile/${connection.username}`}
                    className="flex flex-1 items-center gap-3 min-w-0 no-underline active:opacity-70"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 overflow-hidden">
                      {connection.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={connection.avatarUrl}
                          alt={connection.firstName ?? connection.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[15px] font-semibold text-brand-600">
                          {connection.firstName?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-ink-900 truncate">
                        {connection.firstName} {connection.lastName}
                      </p>
                      <p className="text-[13px] text-ink-500">@{connection.username}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedLevel(expandedLevel === connection.username ? null : connection.username)
                      }
                      aria-label={t("changeLevelAriaLabel", { name: connection.username })}
                      className="icon-btn text-ink-600 flex items-center gap-1 px-2"
                    >
                      <span className="text-[13px] font-medium">{formatLevel(connection.level)}</span>
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className={`transition-transform ${expandedLevel === connection.username ? "rotate-180" : ""}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(connection.username)}
                      aria-label={t("removeAriaLabel", { name: connection.username })}
                      className="icon-btn text-red-600 active:bg-red-100"
                    >
                      <UserMinus size={20} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {expandedLevel === connection.username && (
                  <div className="flex gap-2 py-3 px-3 bg-ink-50 rounded-b-lg">
                    {(["CONTACT", "FRIEND", "BEST_FRIEND"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleSetLevel(connection.username, level)}
                        className={`flex-1 px-3 py-2 rounded text-[13px] font-medium transition ${
                          (connection.level || "CONTACT") === level
                            ? "bg-brand-600 text-white"
                            : "bg-white text-ink-700 border border-ink-200 active:bg-ink-100"
                        }`}
                      >
                        {formatLevel(level)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div role="alert" className="status status-error">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </section>
  );
}
