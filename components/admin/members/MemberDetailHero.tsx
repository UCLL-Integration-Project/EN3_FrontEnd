"use client";

import { AdminMemberDetail } from "@types";
import StatusBadge from "./StatusBadge";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/* Top of the detail screen — avatar tile, name + handle, prominent status. */
export default function MemberDetailHero({ member }: { member: AdminMemberDetail }) {
  return (
    <article className="card flex items-center gap-4 px-4 py-4">
      <span
        aria-hidden
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-700"
      >
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          initials(member.displayName)
        )}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate">{member.displayName}</h3>
        <p className="truncate text-sm text-ink-500">@{member.username}</p>
        <div className="mt-2">
          <StatusBadge status={member.moderationStatus} />
        </div>
      </div>
    </article>
  );
}
