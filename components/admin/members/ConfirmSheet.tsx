"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { useEffect, useState } from "react";

/* Bottom-sheet confirmation for a moderation action (#9529). Names the
   target + consequence (passed in as title/message), takes an optional
   note, and surfaces a translated error from the caller. */
export default function ConfirmSheet({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel,
  notePlaceholder,
  onConfirm,
  loading = false,
  error = null,
  destructive = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  notePlaceholder: string;
  onConfirm: (note: string) => void;
  loading?: boolean;
  error?: string | null;
  destructive?: boolean;
}) {
  const [note, setNote] = useState("");

  // Clear the note each time the sheet opens fresh.
  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  return (
    <Dialog open={open} onClose={loading ? () => {} : onClose} className="relative z-50">
      <div className="sheet-backdrop" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center">
        <DialogPanel className="sheet-bottom">
          <div className="sheet-grabber" aria-hidden="true" />
          <h3 className="px-5 pb-1">{title}</h3>
          <p className="px-5 pb-3 text-sm text-ink-500">{message}</p>

          <div className="px-5">
            <textarea
              className="field-control w-full resize-none"
              rows={2}
              placeholder={notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p role="alert" className="status-error mx-5 mt-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 px-5 pb-5 pt-3">
            <button
              type="button"
              className="btn-ghost flex-1"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn-cta flex-1 ${destructive ? "!bg-rose-600" : ""}`}
              onClick={() => onConfirm(note)}
              disabled={loading}
            >
              {confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
