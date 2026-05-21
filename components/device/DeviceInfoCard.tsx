"use client";

import { Watch } from "lucide-react";

interface InfoRow {
  icon: typeof Watch;
  label: string;
  value: string;
}

export function DeviceInfoCard({ rows }: { rows: InfoRow[] }) {
  return (
    <div className="card mt-3 py-2">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex items-center justify-between gap-3 py-3 ${
            i > 0 ? "border-t border-ink-100" : ""
          }`}
        >
          <span className="flex items-center gap-3">
            <row.icon size={17} className="text-ink-400" strokeWidth={2.25} />
            <span className="text-[13px] text-ink-600">{row.label}</span>
          </span>
          <span className="select-text text-[13px] font-semibold text-ink-900">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
