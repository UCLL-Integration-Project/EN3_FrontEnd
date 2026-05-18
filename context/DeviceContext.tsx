"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { safeStorage } from "./safeStorage";

/* -------------------------------------------------------------------------
 * Tracks whether the account has a companion device linked.
 * CrossWave requires exactly one linked device to be usable, so the route
 * guards consult this to send device-less users into the setup flow.
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
};

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

const STORAGE_KEY = "crosswave.deviceLinked";

export const DeviceProvider = ({ children }: { children: ReactNode }) => {
  const [deviceLinked, setDeviceLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: replace with a backend call — "does this account have a device?".
    // Resolved via a promise so the shape matches the eventual fetch, and
    // via safeStorage so blocked storage can't strand the loading state.
    Promise.resolve(safeStorage.get(STORAGE_KEY) === "true").then((linked) => {
      setDeviceLinked(linked);
      setIsLoading(false);
    });
  }, []);

  const linkDevice = () => {
    safeStorage.set(STORAGE_KEY, "true");
    setDeviceLinked(true);
  };

  const unlinkDevice = () => {
    safeStorage.remove(STORAGE_KEY);
    setDeviceLinked(false);
  };

  return (
    <DeviceContext.Provider
      value={{ deviceLinked, isLoading, linkDevice, unlinkDevice }}
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
