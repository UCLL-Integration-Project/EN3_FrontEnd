"use client";

import { useEffect, useState } from "react";
import { safeStorage } from "@context/safeStorage";
import { getMyProfileRequest, getStatsRequest, getConnectionsRequest } from "@services/UserService";
import type { UserAIContext } from "@types";

let _cachedContext: UserAIContext | null = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export function useAIContext(): UserAIContext {
  const [context, setContext] = useState<UserAIContext>({});

  useEffect(() => {
    if (_cachedContext && Date.now() - _cacheTime < CACHE_TTL) {
      setContext(_cachedContext);
      return;
    }

    let active = true;

    const shareProfile = safeStorage.get("cw_ai_share_profile") === "true";
    const shareStats = safeStorage.get("cw_ai_share_stats") === "true";
    const shareConnections = safeStorage.get("cw_ai_share_connections") === "true";

    const fetches: Promise<void>[] = [];
    const built: UserAIContext = {};

    if (shareProfile) {
      fetches.push(
        getMyProfileRequest()
          .then((data) => {
            built.profile = {
              name: `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim(),
              bio: data.bio ?? "",
              age: data.age ?? 0,
            };
          })
          .catch(() => {}),
      );
    }

    if (shareStats) {
      fetches.push(
        getStatsRequest()
          .then((data) => {
            if (data) built.stats = data;
          })
          .catch(() => {}),
      );
    }

    if (shareConnections) {
      fetches.push(
        getConnectionsRequest()
          .then((data) => {
            built.connections = data.map((u) => ({ username: u.username ?? "" }));
          })
          .catch(() => {}),
      );
    }

    Promise.all(fetches).then(() => {
      if (active) {
        _cachedContext = { ...built };
        _cacheTime = Date.now();
        setContext(_cachedContext);
      }
    });

    return () => { active = false; };
  }, []);

  return context;
}
