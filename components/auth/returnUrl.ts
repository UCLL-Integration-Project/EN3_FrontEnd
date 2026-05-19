/**
 * Resolve a post-login "next" destination into a safe, same-origin path.
 *
 * Anything that isn't a plain internal path (absolute URLs, "//host"
 * protocol-relative paths, backslash tricks) is rejected and the fallback
 * is returned — this prevents the redirect being used as an open redirect.
 *
 * Pure and runtime-agnostic: safe to import from client components and
 * from the Edge middleware (proxy.ts).
 */
export function sanitizeReturnPath(
  next: string | null | undefined,
  fallback: string,
): string {
  if (!next) return fallback;

  let path = next;
  try {
    // The value may arrive URL-encoded from a query string.
    path = decodeURIComponent(next);
  } catch {
    return fallback;
  }

  // Allow only a single leading slash; reject "//host" and absolute URLs.
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("\\")) return fallback;

  return path;
}
