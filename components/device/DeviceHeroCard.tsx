"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BluetoothConnected, Check, Pencil, RefreshCw, Watch } from "lucide-react";
import { SignalBars } from "./DeviceUI";

interface HeroProps {
  model: string;
  lastSync: "lastSyncRecent" | "lastSyncJustNow";
  onNameChange?: (name: string) => void;
}

export function DeviceHeroCard({ model, lastSync, onNameChange }: HeroProps) {
  const t = useTranslations("device");
  const [name, setName] = useState(() => t("defaultName"));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  function save() {
    const next = draft.trim() || name;
    setName(next);
    setEditing(false);
    onNameChange?.(next);
  }

  return (
    <div className="mt-4 rounded-sheet bg-brand-gradient p-6 text-white shadow-pop">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
          <Watch size={30} strokeWidth={2} />
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
              <span className="truncate font-display text-[24px] leading-tight">{name}</span>
              <Pencil size={15} className="shrink-0 opacity-70" />
            </button>
          )}
          <p className="mt-0.5 text-[13px] text-white/70">{model}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-white/15 pt-4 text-[12px] font-medium text-white/85">
        <span className="flex items-center gap-1.5">
          <BluetoothConnected size={14} />
          {t("manage.bluetooth")}
        </span>
        <span className="flex items-center gap-1.5">
          <SignalBars level={3} light />
          {t("manage.signalStrong")}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-white/70">
          <RefreshCw size={13} />
          {t(`manage.${lastSync}`)}
        </span>
      </div>
    </div>
  );
}
