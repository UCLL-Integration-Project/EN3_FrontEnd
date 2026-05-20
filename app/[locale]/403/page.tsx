"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Waves, Home } from "lucide-react";

/* Translated 403 page. Reached when middleware (proxy.ts) or the admin
   layout rejects a non-admin user. Visual is the same shell as not-found.tsx
   so the two error states feel consistent — only the copy and eyebrow change. */
export default function Forbidden() {
  const locale = useLocale();
  const t = useTranslations("forbidden");

  return (
    <section className="app-screen bg-wave">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative mb-7 flex h-40 w-40 items-center justify-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ animationDelay: `${i * 0.9}s` }}
              className="absolute inset-0 rounded-full border-2 border-brand-300/40 animate-ping"
            />
          ))}
          <span
            className="brand-mark h-20 w-20 animate-wave"
            aria-hidden="true"
          >
            <Waves size={40} strokeWidth={2.25} />
          </span>
        </div>

        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-brand-500">
          {t("eyebrow")}
        </p>
        <h2 className="mt-2">{t("title")}</h2>
        <p className="mt-2 max-w-[300px]">{t("subtitle")}</p>
      </div>

      <div className="action-dock">
        <Link
          href={`/${locale}`}
          className="btn-cta no-underline flex items-center justify-center gap-2"
        >
          <Home size={18} strokeWidth={2.25} aria-hidden="true" />
          {t("home")}
        </Link>
      </div>
    </section>
  );
}
