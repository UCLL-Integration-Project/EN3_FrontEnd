"use client";

import { useTranslations } from "use-intl";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@hooks/usePushNotifications";

export default function NotificationsSection() {
  const t = useTranslations("notifications");
  const { permission, isSubscribed, busy, error, subscribe, unsubscribe } = usePushNotifications();

  if (permission === "unsupported") {
    return (
      <div className="card flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <BellOff size={18} aria-hidden="true" />
          <h5 className="m-0">{t("title")}</h5>
        </div>
        <p className="text-[13px] text-ink-500">{t("unsupported")}</p>
      </div>
    );
  }

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Bell size={18} aria-hidden="true" />
        <h5 className="m-0">{t("title")}</h5>
      </div>
      <p className="text-[13px] text-ink-500">{t("body")}</p>

      {permission === "denied" ? (
        <p className="status-error text-[13px]">{t("denied")}</p>
      ) : isSubscribed ? (
        <button
          type="button"
          className="btn-ghost w-full justify-center py-4"
          onClick={unsubscribe}
          disabled={busy}
        >
          {t("turnOff")}
        </button>
      ) : (
        <button
          type="button"
          className="btn-cta w-full justify-center py-4"
          onClick={subscribe}
          disabled={busy}
        >
          {t("turnOn")}
        </button>
      )}

      {(() => {
        if (!error || error === "UNSUPPORTED") return null;
        let key = "errorGeneric";
        if (error === "MISSING_VAPID_KEY") key = "errorMissingKey";
        else if (error === "NETWORK_ERROR") key = "errorNetwork";
        else if (error.startsWith("HTTP_")) key = "errorServer";
        return <p className="status-error text-[13px]">{t(key)}</p>;
      })()}
    </div>
  );
}
