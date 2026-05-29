"use client";

import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { useTranslations } from "use-intl";

export type SortField = "name" | "dateAdded" | "recentlyActive";
export type SortDir = "asc" | "desc";

export interface SortState {
  field: SortField;
  dir: SortDir;
}

interface SortBarProps {
  sort: SortState;
  onSortChange: (s: SortState) => void;
}

const FIELDS: { value: SortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "dateAdded", label: "Date Added" },
  { value: "recentlyActive", label: "Active" },
];

export default function SortBar({ sort, onSortChange }: SortBarProps) {
  const t = useTranslations("ConnectionsPage");

  function handleClick(field: SortField) {
    if (sort.field === field) {
      onSortChange({ field, dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      onSortChange({ field, dir: "asc" });
    }
  }

  return (
    <div role="group" aria-label={t("sortBy")} className="flex items-center gap-1.5">
      <ArrowUpDown size={13} className="text-ink-400 shrink-0" aria-hidden="true" />
      {FIELDS.map(({ value, label }) => {
        const active = sort.field === value;
        const Icon = active ? (sort.dir === "asc" ? ChevronUp : ChevronDown) : null;
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            aria-pressed={active}
            className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[12px] font-medium transition border ${
              active ? "bg-ink-900 text-white border-ink-900" : "bg-white text-ink-600 border-ink-200 active:bg-ink-100"
            }`}
          >
            {label}
            {Icon && <Icon size={11} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
