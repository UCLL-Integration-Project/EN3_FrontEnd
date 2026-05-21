"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

/* Debounced text input. The page owns the canonical query value; this
   component holds local state for typing latency so re-fetches only fire
   ~250ms after the user pauses. */
export default function MembersSearch({
  value,
  onChange,
  delay = 250,
}: {
  value: string;
  onChange: (next: string) => void;
  delay?: number;
}) {
  const t = useTranslations("admin.members.search");
  const [local, setLocal] = useState(value);

  // Sync down when the parent resets externally (e.g. clearing the filter).
  useEffect(() => setLocal(value), [value]);

  useEffect(() => {
    if (local === value) return;
    const id = setTimeout(() => onChange(local), delay);
    return () => clearTimeout(id);
  }, [local, value, onChange, delay]);

  return (
    <label className="field flex items-center gap-2">
      <Search size={16} strokeWidth={2.25} aria-hidden className="text-ink-400" />
      <input
        type="search"
        className="field-control flex-1 bg-transparent outline-none"
        placeholder={t("placeholder")}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
    </label>
  );
}
