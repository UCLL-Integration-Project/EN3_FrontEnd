"use client";

import { ReactNode } from "react";
import { Plus } from "lucide-react";

type PanelActionRowProps = {
  actionLabel: string;
  onActionClick: () => void;
  children: ReactNode;
};

export default function PanelActionRow({
  actionLabel,
  onActionClick,
  children,
}: PanelActionRowProps) {
  return (
    <div className="flex gap-2">
      {/* Main control content field */}
      <div className="flex-1">{children}</div>

      {/* Structured Action Button */}
      <button
        onClick={onActionClick}
        className="tap flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-card transition-all duration-100 active:scale-[0.95]"
        aria-label={actionLabel}
      >
        <Plus size={20} strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
