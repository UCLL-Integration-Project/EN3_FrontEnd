"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { AuthContextType, User } from "@types";
import { getMyProfileRequest, logoutRequest } from "@services/UserService";
import { safeStorage } from "./safeStorage";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "loggedInUser";

/* First-party "is signed in" hint cookie. The real credential is the
   backend's httpOnly `authToken`; this lets proxy.ts redirect before a
   page renders. UX gate only — see proxy.ts. */
const SESSION_HINT_COOKIE = "cw_session";
const SESSION_HINT_MAX_AGE = 3600;

function writeSessionHint(signedIn: boolean) {
  if (typeof document === "undefined") return;
  try {
    document.cookie = signedIn
      ? `${SESSION_HINT_COOKIE}=1; path=/; max-age=${SESSION_HINT_MAX_AGE}; samesite=lax`
      : `${SESSION_HINT_COOKIE}=; path=/; max-age=0; samesite=lax`;
  } catch {
    /* ignore */
  }
}

/** Read the cached user; tolerates missing/unavailable/corrupt storage. */
function readCachedUser(): User | null {
  const raw = safeStorage.get(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    safeStorage.remove(STORAGE_KEY);
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* Verify the session on mount via /api/users/me.
     This must NEVER strand the app on the splash, so every outcome —
     success, error, a slow/hung network, unavailable storage — is funnelled
     through `finish`, which always clears isLoading exactly once. */
  useEffect(() => {
    let settled = false;

    const finish = (apply: () => void) => {
      if (settled) return;
      settled = true;
      try {
        apply();
      } catch (e) {
        console.error("Auth init failed:", e);
      }
      setIsLoading(false);
    };

    const cached = readCachedUser();

    // Fallback: if /me hasn't answered in time, stop blocking the UI.
    const timer = setTimeout(() => finish(() => setUser(cached)), 6000);

    getMyProfileRequest()
      .then((profile) => {
        finish(() => {
          safeStorage.set(STORAGE_KEY, JSON.stringify(profile));
          writeSessionHint(true);
          setUser(profile);
        });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "";
        finish(() => {
          if (message === "NETWORK_ERROR" && cached) {
            // Backend unreachable — trust the cache for now.
            setUser(cached);
          } else {
            // Rejected / invalid session — clear it.
            safeStorage.remove(STORAGE_KEY);
            writeSessionHint(false);
            setUser(null);
          }
        });
      })
      .finally(() => clearTimeout(timer));
  }, []);

  /* Any API call that returns 401 dispatches `auth:unauthorized`
     (see UserService). Clear local auth state so the guards redirect. */
  useEffect(() => {
    const handleUnauthorized = () => {
      safeStorage.remove(STORAGE_KEY);
      writeSessionHint(false);
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = (userData: User) => {
    safeStorage.set(STORAGE_KEY, JSON.stringify(userData));
    writeSessionHint(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    safeStorage.remove(STORAGE_KEY);
    writeSessionHint(false);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    const updated = { ...user, ...userData };
    safeStorage.set(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
