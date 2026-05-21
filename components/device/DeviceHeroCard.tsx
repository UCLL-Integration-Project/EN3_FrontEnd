"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Pencil, RefreshCw, WifiOff } from "lucide-react";
import { PagerIcon } from "./PagerIcon";

interface HeroProps {
  model: string;
  name: string;
  isConnected: boolean;
  lastReceivedAt: number | null;
  isStale?: boolean;
  onNameChange?: (name: string) => void;
}

export function DeviceHeroCard({ model, name, isConnected, lastReceivedAt, isStale = false, onNameChange }: HeroProps) {
  const t = useTranslations("device");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  function save() {
    const next = draft.trim() || name;
    setEditing(false);
    onNameChange?.(next);
  }

  function formatElapsed(ts: number): string {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 10) return t("manage.lastSyncJustNow");
    if (sec < 60) return t("manage.lastSyncSecondsAgo", { n: sec });
    const min = Math.floor(sec / 60);
    if (min < 60) return t("manage.lastSyncMinutesAgo", { n: min });
    return `${Math.floor(min / 60)}h`;
  }

  return (
    <div className="mt-4 rounded-sheet bg-brand-gradient p-6 text-white shadow-pop">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
          <PagerIcon size={30} />
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                maxLength={32}
                className="min-w-0 flex-1 rounded-xl bg-white/15 px-3 py-1.5 text-[18px] font-semibold text-white outline-none ring-1 ring-white/40 placeholder:text-white/50"
                placeholder={t("manage.namePlaceholder")}
              />
              <button
                aria-label={t("manage.saveName")}
                onClick={save}
                className="tap h-9 w-9 shrink-0 rounded-pill bg-white/20 active:scale-95"
              >
                <Check size={18} strokeWidth={2.75} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setDraft(name); setEditing(true); }}
              className="flex items-center gap-2 text-left"
            >
              <span className="truncate font-display text-[24px] leading-tight text-white">
                {name}
              </span>
              <Pencil size={15} className="shrink-0 opacity-70" />
            </button>
          )}
          <p className="mt-0.5 text-[13px] text-white/70">{model}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-white/15 pt-4 text-[12px] font-medium text-white/85">
        {isConnected && !isStale ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {t("manage.signalLive")}
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-white/70">
              <RefreshCw size={13} />
              {lastReceivedAt ? formatElapsed(lastReceivedAt) : "—"}
            </span>
          </>
        ) : isStale ? (
          <>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              {t("manage.stale")}
            </span>
            {lastReceivedAt && (
              <span className="ml-auto flex items-center gap-1.5 text-white/50">
                <RefreshCw size={13} />
                {formatElapsed(lastReceivedAt)}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5 text-white/60">
              <WifiOff size={13} />
              {t("manage.disconnected")}
            </span>
            {lastReceivedAt && (
              <span className="ml-auto flex items-center gap-1.5 text-white/50">
                <RefreshCw size={13} />
                {formatElapsed(lastReceivedAt)}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
