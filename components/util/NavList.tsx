"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { NavItem } from "@types";

type NavListProps = {
  items: NavItem[];
  animated?: boolean;
};

export default function NavList({ items, animated = true }: NavListProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map(({ icon: Icon, label, href, variant }, index) => {
        const isAdmin = variant === "admin";

        return (
          <Link
            key={href}
            href={href}
            style={animated ? { animationDelay: `${index * 45}ms` } : undefined}
            className="animate-rise flex items-center gap-3 rounded-sheet bg-white px-4 py-3.5 shadow-card ring-1 ring-ink-100 transition-transform duration-100 active:scale-[0.98]"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                isAdmin
                  ? "bg-secondary-50 text-secondary-600"
                  : "bg-brand-50 text-brand-600"
              }`}
            >
              <Icon size={20} strokeWidth={2.25} aria-hidden />
            </span>

            <span
              className={`flex-1 text-[15px] font-semibold ${
                isAdmin ? "text-secondary-700" : "text-ink-900"
              }`}
            >
              {label}
            </span>

            <ChevronRight
              size={18}
              className="text-ink-300"
              strokeWidth={2.5}
              aria-hidden
            />
          </Link>
        );
      })}
    </div>
  );
}
