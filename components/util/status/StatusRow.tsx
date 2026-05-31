"use client";

import { Edit2, Trash2 } from "lucide-react";
import { StatusResponse } from "@types";

type StatusRowProps = {
  status: StatusResponse;
  onEditClick: (status: StatusResponse) => void;
  onDeleteClick: (id: number) => void;
};

export default function StatusRow({ status, onEditClick, onDeleteClick }: StatusRowProps) {
  return (
    <div className="card flex items-center justify-between gap-3 bg-white p-4 shadow-card ring-1 ring-ink-100 rounded-xl">
      <div className="flex-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400 block">
          {status.statusType?.statusType ?? ""}
        </span>
        <p className="text-[14px] font-medium text-ink-900 mt-0.5">
          {status.message}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onEditClick(status)}
          className="tap flex h-9 w-9 items-center justify-center rounded-lg text-brand-600 transition-colors duration-100 active:bg-brand-50"
        >
          <Edit2 size={16} strokeWidth={2.25} aria-hidden />
        </button>

        <button
          onClick={() => onDeleteClick(status.id)}
          className="tap flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition-colors duration-100 active:bg-red-50"
        >
          <Trash2 size={16} strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </div>
  );
}