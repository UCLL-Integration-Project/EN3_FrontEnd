"use client";

import { useTranslations } from "use-intl";
import { AlertCircle, UserMinus, X } from "lucide-react";
import { ConnectionDTO } from "@types";

interface RemoveConnectionSheetProps {
  connection: ConnectionDTO;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onDismiss: () => void;
}

export default function RemoveConnectionSheet({
  connection,
  loading = false,
  error = null,
  onConfirm,
  onDismiss,
}: RemoveConnectionSheetProps) {
  const t = useTranslations("ConnectionsPage");
  const name = `${connection.firstName} ${connection.lastName}`.trim();

  return (
    <>
      <button
        type="button"
        aria-label={t("closeAriaLabel")}
        className="sheet-backdrop"
        onClick={loading ? undefined : onDismiss}
      />
      <div
        className="sheet-bottom px-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-connection-title"
      >
        <div className="sheet-grabber" aria-hidden="true" />
        <div className="mt-2 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <UserMinus size={20} aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <h4 id="remove-connection-title">{t("confirmRemoveTitle", { name })}</h4>
            <p className="mt-1">
              {t("confirmRemoveBody", { name, username: connection.username })}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("closeAriaLabel")}
            onClick={onDismiss}
            disabled={loading}
            className="icon-btn"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div role="alert" className="status status-error mt-4">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            className="tap w-full rounded-pill bg-red-600 px-5 py-3.5 text-[15px] font-semibold text-white shadow-card transition-transform duration-100 active:scale-[0.98] active:bg-red-700 disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t("removing") : t("confirmRemoveConfirm")}
          </button>
          <button
            type="button"
            className="btn-ghost w-full"
            onClick={onDismiss}
            disabled={loading}
          >
            {t("confirmRemoveCancel")}
          </button>
        </div>
      </div>
    </>
  );
}
