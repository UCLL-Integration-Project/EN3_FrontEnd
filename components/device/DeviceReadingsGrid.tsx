"use client";

import { Watch } from "lucide-react";

interface Reading {
  icon: typeof Watch;
  value: string;
  unit: string;
  label: string;
}

export function ReadingsGrid({ readings }: { readings: Reading[] }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2.5">
      {readings.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl bg-white p-3.5 shadow-card ring-1 ring-ink-100"
        >
          <stat.icon size={18} className="text-brand-500" strokeWidth={2.25} />
          <p className="mt-2 text-[17px] font-semibold leading-tight text-ink-900">
            {stat.value}
            {stat.unit && (
              <span className="text-[11px] font-medium text-ink-400"> {stat.unit}</span>
            )}
          </p>
          <p className="text-[11px] text-ink-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
