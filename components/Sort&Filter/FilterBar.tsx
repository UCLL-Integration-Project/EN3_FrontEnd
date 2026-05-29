"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "use-intl";
import { ConnectionLevel } from "@types";

export type LevelFilter = ConnectionLevel | "ALL";

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  level: LevelFilter;
  onLevelChange: (v: LevelFilter) => void;
}

const LEVELS: { value: LevelFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CONTACT", label: "Contact" },
  { value: "FRIEND", label: "Friend" },
  { value: "BEST_FRIEND", label: "Best Friend" },
];

export default function FilterBar({ search, onSearchChange, level, onLevelChange }: FilterBarProps) {
  const t = useTranslations("ConnectionsPage");

  return (
    <div className="flex flex-col gap-2">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="w-full rounded-lg border border-ink-200 bg-white pl-8 pr-8 py-2 text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label={t("clearSearch")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-ink-400 hover:text-ink-700"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Level pills */}
      <div role="group" aria-label={t("filterByLevel")} className="flex gap-1.5 flex-wrap">
        {LEVELS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onLevelChange(value)}
            aria-pressed={level === value}
            className={`px-3 py-1 rounded-full text-[12px] font-medium transition border ${
              level === value
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-ink-600 border-ink-200 active:bg-ink-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
