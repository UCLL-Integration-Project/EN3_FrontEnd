"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { AuthContextType, User, UserResponse } from "@types";
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

/* Pick only the non-sensitive profile fields the UI needs. The /me response
   is typed UserResponse, which includes `password`; that field must never be
   written to localStorage, where any script on the origin could read it and
   it would survive browser restarts. */
function toSafeUser(profile: UserResponse | any): User {
  return {
    username: profile.username,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    age: profile.age,
  };
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

type AuthProviderProps = {
  children: ReactNode;
  initialUser?: any | null; // Accepts the raw UserResponse from Next.js SSR
};

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  // Sanitize the SSR user if it exists
  const startingUser = initialUser ? toSafeUser(initialUser) : null;

  // Initialize state using the SSR data if available
  const [user, setUser] = useState<User | null>(startingUser);
  const [isLoading, setIsLoading] = useState(!startingUser);

  /* Verify the session on mount via /api/users/me.
     The 6s timer is a *fallback* that only unblocks the splash (showing the
     cached user as a provisional value). It deliberately does NOT settle the
     auth check: a slow /me response still applies its result whenever it
     finally resolves, so a valid signed-in user is never stranded as
     signed-out until a reload. */
  useEffect(() => {
    // --- SHORT-CIRCUIT FOR SSR NAVIGATIONS ---
    // If layout.tsx already fetched the user securely via Node.js,
    // sync the local cache and skip the client-side fetch entirely.
    if (startingUser) {
      safeStorage.set(STORAGE_KEY, JSON.stringify(startingUser));
      writeSessionHint(true);
      setIsLoading(false);
      return; 
    }

    let cancelled = false;
    const cached = readCachedUser();

    // Fallback: if /me is slow, stop blocking the UI with the cached user.
    // The request below still updates auth state when it resolves.
    const timer = setTimeout(() => {
      if (cancelled) return;
      setUser(cached);
      setIsLoading(false);
    }, 6000);

    getMyProfileRequest()
      .then((profile) => {
        if (cancelled) return;
        const safeUser = toSafeUser(profile);
        safeStorage.set(STORAGE_KEY, JSON.stringify(safeUser));
        writeSessionHint(true);
        setUser(safeUser);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "";
        if (message === "NETWORK_ERROR" && cached) {
          // Backend unreachable — trust the cache, and refresh the session
          // hint cookie so proxy.ts and the client agree on "signed in"
          // (otherwise the middleware would still bounce protected routes).
          writeSessionHint(true);
          setUser(cached);
        } else {
          // Rejected / invalid session — clear it.
          safeStorage.remove(STORAGE_KEY);
          writeSessionHint(false);
          setUser(null);
        }
      })
      .finally(() => {
        if (cancelled) return;
        clearTimeout(timer);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [startingUser]);

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
    const updated = { ...user, ...userData } as User;
    safeStorage.set(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};