import { notFound } from "next/navigation";

/* Catch-all for any URL under /[locale] that no real page matches.
 * Explicit routes (login, signup, device, settings, …) always take
 * precedence; only genuinely unknown paths reach this.
 *
 * Calling notFound() renders app/[locale]/not-found.tsx. Without this
 * route, unmatched URLs fall through to Next.js's built-in default 404. */
export default function CatchAllNotFound() {
  notFound();
}
