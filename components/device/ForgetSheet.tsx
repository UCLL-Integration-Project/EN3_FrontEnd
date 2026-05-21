"use client";

import { useTranslations } from "next-intl";
import { Trash2, X } from "lucide-react";

interface ForgetSheetProps {
  name: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function ForgetSheet({ name, onConfirm, onDismiss }: ForgetSheetProps) {
  const t = useTranslations("device");
  return (
    <>
      <button
        aria-label={t("manage.dismiss")}
        className="sheet-backdrop"
        onClick={onDismiss}
      />
      <div
        className="sheet-bottom px-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forget-device-title"
      >
        <div className="sheet-grabber" />
        <div className="mt-2 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 size={20} />
          </span>
          <div className="flex-1">
            <h4 id="forget-device-title">{t("manage.forgetTitle", { name })}</h4>
            <p className="mt-1">{t("manage.forgetBody", { name })}</p>
          </div>
          <button aria-label={t("manage.close")} onClick={onDismiss} className="icon-btn">
            <X size={20} />
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            className="tap w-full rounded-pill bg-red-600 px-5 py-3.5 text-[15px] font-semibold text-white shadow-card transition-transform duration-100 active:scale-[0.98] active:bg-red-700"
            onClick={onConfirm}
          >
            {t("manage.forgetConfirm")}
          </button>
          <button className="btn-ghost w-full" onClick={onDismiss}>
            {t("manage.forgetCancel")}
          </button>
        </div>
      </div>
    </>
  );
}
