"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { safeStorage } from "./safeStorage";
import useAuth from "@hooks/useAuth";

/* -------------------------------------------------------------------------
 * Tracks whether the account has a companion device linked.
 * CrossWave requires exactly one linked device to be usable, so the route
 * guards consult this to send device-less users into the setup flow.
 *
 * Linked-state is *per account*: the storage key is scoped to the signed-in
 * user, so a second account on the same browser never inherits the previous
 * user's linked device and is correctly sent through setup.
 *
 * MOCK: linked-state is persisted in localStorage (so it survives an app
 * restart, matching the auth cache). Replace the initial read, linkDevice
 * and unlinkDevice with the backend device endpoints (e.g. GET/DELETE
 * /api/devices) when they exist.
 * ---------------------------------------------------------------------- */

type DeviceContextType = {
  deviceLinked: boolean;
  isLoading: boolean;
  linkDevice: () => void;
  unlinkDevice: () => void;
  deviceIp: string;
  setDeviceIp: (ip: string) => void;
  deviceName: string;
  setDeviceName: (name: string) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
};

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

const STORAGE_PREFIX  = "crosswave.deviceLinked";
const IP_PREFIX       = "crosswave.deviceIp";
const NAME_PREFIX     = "crosswave.deviceName";
const HAPTICS_PREFIX  = "crosswave.haptics";

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [deviceLinked, setDeviceLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceIp, setDeviceIpState] = useState("");
  const [deviceName, setDeviceNameState] = useState("");
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);

  // Storage keys scoped to the current account — null when signed out.
  const storageKey  = user ? `${STORAGE_PREFIX}:${user.username ?? user.email ?? "unknown"}` : null;
  const ipKey       = user ? `${IP_PREFIX}:${user.username ?? user.email ?? "unknown"}` : null;
  const nameKey     = user ? `${NAME_PREFIX}:${user.username ?? user.email ?? "unknown"}` : null;
  const hapticsKey  = user ? `${HAPTICS_PREFIX}:${user.username ?? user.email ?? "unknown"}` : null;

  useEffect(() => {
    // Wait for auth to resolve before deciding — the key depends on the user.
    if (authLoading) return;

    // TODO: replace with a backend call — "does this account have a device?".
    // Signed out (no key) → no linked device. Resolved via a promise so the
    // shape matches the eventual fetch, setState stays inside a callback, and
    // blocked storage (safeStorage) can't strand the loading state.
    Promise.resolve(
      storageKey ? safeStorage.get(storageKey) === "true" : false,
    ).then((linked) => {
      setDeviceLinked(linked);
      setIsLoading(false);
    });

    setDeviceIpState(ipKey ? (safeStorage.get(ipKey) ?? "") : "");
    setDeviceNameState(nameKey ? (safeStorage.get(nameKey) ?? "") : "");
    const stored = hapticsKey ? safeStorage.get(hapticsKey) : null;
    setHapticsEnabledState(stored === null ? true : stored === "true");
  }, [authLoading, storageKey, ipKey, nameKey, hapticsKey]);

  const linkDevice = () => {
    if (!storageKey) return;
    safeStorage.set(storageKey, "true");
    setDeviceLinked(true);
  };

  const unlinkDevice = () => {
    if (!storageKey) return;
    safeStorage.remove(storageKey);
    setDeviceLinked(false);
    if (ipKey) safeStorage.remove(ipKey);
    if (nameKey) safeStorage.remove(nameKey);
    if (hapticsKey) safeStorage.remove(hapticsKey);
    setDeviceIpState("");
    setDeviceNameState("");
    setHapticsEnabledState(true);
  };

  const setDeviceIp = (ip: string) => {
    if (ipKey) safeStorage.set(ipKey, ip);
    setDeviceIpState(ip);
  };

  const setDeviceName = (name: string) => {
    if (nameKey) safeStorage.set(nameKey, name);
    setDeviceNameState(name);
  };

  const setHapticsEnabled = (enabled: boolean) => {
    if (hapticsKey) safeStorage.set(hapticsKey, String(enabled));
    setHapticsEnabledState(enabled);
  };

  return (
    <DeviceContext.Provider
      value={{ deviceLinked, isLoading, linkDevice, unlinkDevice, deviceIp, setDeviceIp, deviceName, setDeviceName, hapticsEnabled, setHapticsEnabled }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export function useDevice() {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error("useDevice must be used within a DeviceProvider");
  return ctx;
}
