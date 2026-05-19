import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeReturnPath } from "./components/auth/returnUrl";

/* -------------------------------------------------------------------------
 * Edge middleware: locale routing (next-intl) + server-side auth gating.
 *
 * Auth check: the real JWT (`authToken`) is httpOnly + SameSite=None and
 * lives on the API origin, so it is unreadable here. `cw_session` is a
 * first-party hint cookie set by AuthContext — see the note there. It lets
 * us redirect before a page renders (no flash). It is a UX gate only; the
 * API and the client-side route guards remain the real enforcement.
 * ---------------------------------------------------------------------- */

const locales = ["en", "nl"] as const;
const defaultLocale = "en";

const intlMiddleware = createMiddleware({ locales, defaultLocale });

/* Path prefixes, matched against the path after the /[locale] segment. */
const PROTECTED = ["/device", "/settings"]; // require a signed-in user
const GUEST_ONLY = ["/login", "/signup"]; // require a signed-out user

function matchesPrefix(rest: string, prefixes: string[]): boolean {
  return prefixes.some((p) => rest === p || rest.startsWith(`${p}/`));
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];

  // No locale segment yet — let next-intl add one; the follow-up request
  // (now locale-prefixed) gets auth-evaluated.
  if (!locales.includes(locale as (typeof locales)[number])) {
    return intlMiddleware(request);
  }

  const rest = `/${segments.slice(1).join("/")}`;
  const signedIn = request.cookies.get("cw_session")?.value === "1";

  // Protected route, no session → send to login with a return path.
  // The return path keeps the original query string so a deep link like
  // /en/settings?tab=profile survives the login round-trip.
  if (matchesPrefix(rest, PROTECTED) && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = "";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Auth route, already signed in → send home (or to ?next= if present).
  if (matchesPrefix(rest, GUEST_ONLY) && signedIn) {
    const next = request.nextUrl.searchParams.get("next");
    // Resolve the return path through a URL so a query string in `next` lands
    // in `search`, not encoded into `pathname` (which would 404). The path is
    // same-origin-sanitised first, so the origin here is just a parse base.
    const target = new URL(
      sanitizeReturnPath(next, `/${locale}`),
      request.nextUrl.origin,
    );
    const url = request.nextUrl.clone();
    url.pathname = target.pathname;
    url.search = target.search;
    url.hash = "";
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[^/]*$).*)"],
};
