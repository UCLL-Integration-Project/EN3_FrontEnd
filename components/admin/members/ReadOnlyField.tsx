"use client";

import { ReactNode } from "react";

/* A single label · value row in the detail view's read-only fields list.
   Empty / null values fall back to an em dash so the column stays aligned. */
export default function ReadOnlyField({
  label,
  value,
  placeholder = "—",
}: {
  label: string;
  value?: string | null | ReactNode;
  placeholder?: string;
}) {
  const shown =
    value === null || value === undefined || value === "" ? placeholder : value;
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink-100 py-2 last:border-b-0">
      <dt className="text-xs uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="text-sm font-medium text-ink-700 text-right">{shown}</dd>
    </div>
  );
}
