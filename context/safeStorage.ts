/**
 * localStorage access that never throws.
 *
 * Browsers throw on storage access in private-browsing mode, when cookies /
 * site storage are blocked, or under strict tracking protection. An
 * unguarded localStorage call in that situation crashes whatever effect it
 * runs in — which, for an auth provider, strands the whole app on its
 * loading splash. These wrappers degrade to a no-op instead.
 */
export const safeStorage = {
  get(key: string): string | null {
    try {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    } catch {
      /* storage unavailable — ignore */
    }
  },
  remove(key: string): void {
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(key);
    } catch {
      /* storage unavailable — ignore */
    }
  },
};
