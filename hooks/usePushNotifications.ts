"use client";

import { useCallback, useEffect, useState } from "react";
import { sendSubscription, removeSubscription } from "@services/PushSubscriptionService";

export type PushPermission = "unsupported" | "default" | "granted" | "denied";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
};

const isSupported = (): boolean =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isSubscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupported()) {
      setPermission("unsupported");
      setSubscribed(false);
      return;
    }
    setPermission(Notification.permission as PushPermission);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(sub !== null);
    } catch {
      setSubscribed(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const subscribe = useCallback(async () => {
    if (!isSupported()) {
      setError("UNSUPPORTED");
      return;
    }
    if (!vapidPublicKey) {
      setError("MISSING_VAPID_KEY");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== "granted") {
        setSubscribed(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));
      await sendSubscription(sub);
      setSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "UNKNOWN_ERROR");
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!isSupported()) return;
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        try {
          await removeSubscription(endpoint);
        } catch {
          /* server cleanup best-effort; local unsubscribe already succeeded */
        }
      }
      setSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "UNKNOWN_ERROR");
    } finally {
      setBusy(false);
    }
  }, []);

  return { permission, isSubscribed, busy, error, subscribe, unsubscribe, refresh };
};
