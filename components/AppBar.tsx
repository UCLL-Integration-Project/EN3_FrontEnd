"use client";

import { ReactNode } from "react";
import BackButton from "@components/BackButton";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";

type Props = {
  /** Title shown centered. Optional — some screens use a hero instead. */
  title?: string;
  /** Show a leading back button. Default true. Set false on root-tab screens. */
  showBack?: boolean;
  /** Fallback href for the back button when history is empty. */
  backHref?: string;
  /** Optional right-aligned slot (icon button(s), language chip, etc.). */
  right?: ReactNode;
  /** Floats over content with a transparent surface (used over a banner). */
  transparent?: boolean;
};

/* Single app-bar primitive — every sub-screen used to roll its own header
 * (different back icons, title positions, spacing). This consolidates the
 * pattern so every screen looks the same.
 *
 * Layout: [back?] [title centered] [right slot]. The back button is fixed
 * width so the title stays optically centered even with a right slot. */
export default function AppBar({ title, showBack = true, backHref, right, transparent = false }: Props) {
  const surface = transparent ? "bg-transparent border-b-0" : "app-bar"; // app-bar already includes bg/blur/border
  const t = useTranslations("home");

  return (
    <header className={`${transparent ? "flex h-app-bar shrink-0 items-center gap-2 px-4 pt-safe-t z-30" : surface}`}>
      <div className="flex w-12 shrink-0 items-center justify-start">{showBack && <BackButton href={backHref} />}</div>
      <div className="flex-1 min-w-0 px-2 text-center">{title && <h4 className="truncate">{title}</h4>}</div>
      <div className="flex w-12 shrink-0 items-center justify-end gap-1">
        {right}
        <Link
          href={"/settings"}
          aria-label={t("nav.settings")}
          className="icon-btn -mr-1 mt-0.5 text-black/80 active:text-black"
        >
          <Settings size={22} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
