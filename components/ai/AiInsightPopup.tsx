"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

type Props = {
  insight: string;
  onDismiss: () => void;
};

export default function AiInsightPopup({ insight, onDismiss }: Props) {
  const t = useTranslations("ai");
  const locale = useLocale();
  const router = useRouter();

  const handleAskMore = () => {
    onDismiss();
    router.push(`/${locale}/ai`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="sheet-backdrop z-40"
        onClick={onDismiss}
        aria-hidden="true"
      />
      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className="sheet-bottom z-50"
      >
        <div className="sheet-grabber" />
        <div className="relative px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2">
          {/* Dismiss */}
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t("insight.dismiss")}
            className="icon-btn absolute right-3 top-0 text-xl leading-none"
          >
            ×
          </button>
          {/* Eyebrow */}
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-600">
            ✦ {t("insight.eyebrow")}
          </p>
          {/* Insight text */}
          <p className="mb-5 text-[15px] leading-relaxed text-ink-900">{insight}</p>
          {/* Ask more */}
          <button type="button" onClick={handleAskMore} className="btn-ghost">
            {t("insight.askMore")}
          </button>
        </div>
      </div>
    </>
  );
}
