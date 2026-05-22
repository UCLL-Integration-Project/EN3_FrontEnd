"use client";

import { AdminAction, AdminMemberDetail } from "@types";
import { useTranslations } from "next-intl";
import { Ban, RotateCcw, FileX, ImageOff, Flag } from "lucide-react";

/* The moderation button block on the detail page. Pure — it reports which
   action was requested via onAction; the page owns confirmation + the API
   call. Buttons disable themselves when the action would be a no-op. */
export default function ModerationActions({
  member,
  onAction,
  disabled = false,
}: {
  member: AdminMemberDetail;
  onAction: (action: AdminAction) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("admin.members.moderation");

  const rows: { action: AdminAction; label: string; icon: typeof Ban; off: boolean }[] = [
    {
      action: "SUSPEND",
      label: t("suspend.label"),
      icon: Ban,
      off: member.status === "SUSPENDED",
    },
    {
      action: "REACTIVATE",
      label: t("reactivate.label"),
      icon: RotateCcw,
      off: member.status === "ACTIVE",
    },
    {
      action: "CLEAR_BIO",
      label: t("clearBio.label"),
      icon: FileX,
      off: !member.bio,
    },
    {
      action: "CLEAR_AVATAR",
      label: t("clearAvatar.label"),
      icon: ImageOff,
      off: !member.avatarUrl,
    },
    {
      action: "FLAG",
      label: t("flag.label"),
      icon: Flag,
      off: member.status === "FLAGGED",
    },
  ];

  return (
    <section className="card mt-4 px-3 py-3">
      <h3 className="px-1 pb-2 text-xs uppercase tracking-wide text-ink-400">
        {t("title")}
      </h3>
      <div className="flex flex-col gap-1">
        {rows.map(({ action, label, icon: Icon, off }) => (
          <button
            key={action}
            type="button"
            className="sheet-row flex items-center gap-3 disabled:opacity-40"
            onClick={() => onAction(action)}
            disabled={disabled || off}
          >
            <Icon size={18} strokeWidth={2.25} aria-hidden />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
