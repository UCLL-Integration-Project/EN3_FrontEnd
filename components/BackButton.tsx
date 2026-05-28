"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = { href?: string; label?: string };

/* Real back button: pops history when possible, falls back to `href` (or
 * locale root). The old version always navigated to `/${locale}` regardless
 * of where the user came from, which made every sub-screen back-jump to
 * home — confusing for any flow deeper than one level. */
export default function BackButton({ href, label = "Back" }: Props) {
  const router = useRouter();
  const fallback = href ?? "/";

  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button type="button" onClick={onClick} aria-label={label} className="back-btn">
      <ArrowLeft size={22} strokeWidth={2.25} />
    </button>
  );
}
