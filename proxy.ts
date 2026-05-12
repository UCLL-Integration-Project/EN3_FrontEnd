import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  return createMiddleware({
    locales: ["en", "nl"],
    defaultLocale: "en",
  })(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[^/]*$).*)"],
};
