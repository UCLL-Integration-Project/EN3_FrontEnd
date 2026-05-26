"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { AdminAction, AdminMemberDetail } from "@types";
import {
  getMemberRequest,
  suspendMemberRequest,
  reactivateMemberRequest,
  clearBioRequest,
  clearAvatarRequest,
  flagMemberRequest,
} from "@services/AdminService";
import AppBar from "@components/AppBar";
import MemberDetailHero from "@components/admin/members/MemberDetailHero";
import ReadOnlyField from "@components/admin/members/ReadOnlyField";
import ModerationActions from "@components/admin/members/ModerationActions";
import AuditTrail from "@components/admin/members/AuditTrail";
import ConfirmSheet from "@components/admin/members/ConfirmSheet";

function formatLong(iso: string | null | undefined, locale: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(d);
}

/* AdminAction -> translation key stem + API call. */
const ACTION_KEY: Record<AdminAction, string> = {
  SUSPEND: "suspend",
  REACTIVATE: "reactivate",
  CLEAR_BIO: "clearBio",
  CLEAR_AVATAR: "clearAvatar",
  FLAG: "flag",
};
const ACTION_FN: Record<AdminAction, (id: number, note?: string) => Promise<AdminMemberDetail>> = {
  SUSPEND: suspendMemberRequest,
  REACTIVATE: reactivateMemberRequest,
  CLEAR_BIO: clearBioRequest,
  CLEAR_AVATAR: clearAvatarRequest,
  FLAG: flagMemberRequest,
};

export default function AdminMemberDetailPage() {
  const t = useTranslations("admin.members.detail");
  const tm = useTranslations("admin.members.moderation");
  const locale = useLocale();
  const params = useParams();
  const sp = useSearchParams();

  const idParam = params?.id;
  const id = typeof idParam === "string" ? Number(idParam) : NaN;
  const ret = sp.get("ret") ?? "";
  const backHref = `/${locale}/admin/members${ret ? `?${ret}` : ""}`;

  const [data, setData] = useState<AdminMemberDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingAction, setPendingAction] = useState<AdminAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setError("USER_NOT_FOUND");
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getMemberRequest(id)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "UNKNOWN_ERROR");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const openAction = (action: AdminAction) => {
    setActionError(null);
    setPendingAction(action);
  };

  const closeSheet = () => {
    setPendingAction(null);
    setActionError(null);
  };

  const confirmAction = async (note: string) => {
    if (!pendingAction || !data) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await ACTION_FN[pendingAction](data.id, note);
      setData(updated);
      setPendingAction(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "UNKNOWN_ERROR");
    } finally {
      setActionLoading(false);
    }
  };

  const moderationError = actionError
    ? tm.has(`errors.${actionError}`)
      ? tm(`errors.${actionError}` as never)
      : tm("errors.UNKNOWN_ERROR")
    : null;

  const actionKey = pendingAction ? ACTION_KEY[pendingAction] : null;

  return (
    <section className="app-screen p-0">
      <AppBar title={t("title")} backHref={backHref} />

      <div className="px-5 pt-4 pb-8">
      {error && (
        <p role="alert" className="status-error mt-4">
          {t.has(`errors.${error}`) ? t(`errors.${error}` as never) : t("errors.UNKNOWN_ERROR")}
        </p>
      )}

      {!error && data && (
        <>
          <div className="mt-4">
            <MemberDetailHero member={data} />
          </div>
          <dl className="card mt-4 px-4 py-2">
            <ReadOnlyField label={t("fields.display")} value={data.displayName} />
            <ReadOnlyField label={t("fields.username")} value={`@${data.username}`} />
            <ReadOnlyField label={t("fields.bio")} value={data.bio} />
            <ReadOnlyField label={t("fields.joined")} value={formatLong(data.joinedAt, locale)} />
            <ReadOnlyField
              label={t("fields.lastSeen")}
              value={formatLong(data.lastSeenAt, locale) ?? t("lastSeenNever")}
            />
          </dl>

          <ModerationActions member={data} onAction={openAction} disabled={actionLoading} />
          <AuditTrail entries={data.recentAudit} />

          {pendingAction && actionKey && (
            <ConfirmSheet
              open
              onClose={closeSheet}
              title={tm(`${actionKey}.title` as "suspend.title", { name: data.displayName })}
              message={tm(`${actionKey}.message` as never)}
              confirmLabel={tm(`${actionKey}.confirm` as never)}
              cancelLabel={tm("cancel")}
              notePlaceholder={tm("note.placeholder")}
              onConfirm={confirmAction}
              loading={actionLoading}
              error={moderationError}
              destructive={pendingAction === "SUSPEND" || pendingAction === "CLEAR_BIO" || pendingAction === "CLEAR_AVATAR"}
            />
          )}
        </>
      )}

      {isLoading && !data && !error && (
        <p className="mt-4 text-sm text-ink-500">…</p>
      )}
      </div>
    </section>
  );
}
