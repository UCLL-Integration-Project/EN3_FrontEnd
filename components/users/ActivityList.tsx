"use client";

import { Activity } from "@types";
import { useTranslations } from "use-intl";

type Props = {
  activities: Activity[];
};

export default function ActivityList({ activities }: Props) {
  const t = useTranslations("social");

  if (activities.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-ink-400 italic">{t("noActivity")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h5 className="px-1 text-ink-500">{t("activity")}</h5>
      <div className="flex flex-col gap-2">
        {activities.map((activity) => (
          <div key={activity.id} className="card py-3 px-4 flex items-start gap-4 animate-rise">
            <div className="brand-mark h-10 w-10 shrink-0 text-[16px]">
              {/* Fallback icon logic could go here */}
              🌊
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-ink-900 font-medium leading-tight">
                {activity.description}
              </p>
              <span className="text-[11px] text-ink-400 mt-1 uppercase font-semibold">
                {new Date(activity.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
