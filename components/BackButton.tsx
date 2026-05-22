"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "next-intl";

type Props = { href?: string; label?: string };

export default function BackButton({ href, label = "Back" }: Props) {
  const locale = useLocale();
  const target = href ?? `/${locale}`;
  return (
    <Link href={target} aria-label={label} className="back-btn">
      <ArrowLeft size={22} strokeWidth={2.25} />
    </Link>
  );
}
