"use client";

import StatusTypeManager from "@components/status/StatusTypeManager";
import NavList from "@components/util/NavList";
import { NavItem } from "@types";
import { Home, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function AdminPage() {
  const t = useTranslations("admin");
  const locale = useLocale();

  const navItems: NavItem[] = [
    {
      icon: Users,
      label: t("nav.members"),
      href: `/${locale}/admin/members`,
    },
  ];

  return (
    <section className="app-screen">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}`}
            aria-label="Home"
            className="back-btn flex items-center justify-center"
          >
            <Home size={18} strokeWidth={2.25} />
          </Link>

          <h2 className="flex-1">{t("title")}</h2>
        </div>

        <NavList items={navItems} />
        <StatusTypeManager />
      </header>
    </section>
  );
}
