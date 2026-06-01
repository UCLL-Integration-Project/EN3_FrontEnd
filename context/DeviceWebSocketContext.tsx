"use client";

import { createContext, useContext, ReactNode } from "react";
import { useDeviceWebSocket, SensorData, DeviceInfo } from "@hooks/useDeviceWebSocket";
import { useDevice } from "@context/DeviceContext";

interface DeviceWebSocketContextType {
  isConnected: boolean;
  isAuthenticated: boolean;
  isUnreachable: boolean;
  sensorData: SensorData | null;
  deviceInfo: DeviceInfo | null;
  lastNameAck: { status: string; name?: string; reason?: string } | null;
  sendCommand: (cmd: string) => void;
  sendMessage: (text: string) => void;
  forceReconnect: () => void;
}

const DeviceWebSocketContext = createContext<DeviceWebSocketContextType | null>(null);

export function DeviceWebSocketProvider({ children }: { children: ReactNode }) {
  const { deviceIp, deviceLinked } = useDevice();
  const ws = useDeviceWebSocket(deviceLinked ? deviceIp : "");

  return (
    <DeviceWebSocketContext.Provider value={ws}>
      {children}
    </DeviceWebSocketContext.Provider>
  );
}

export function useDeviceWS(): DeviceWebSocketContextType {
  const ctx = useContext(DeviceWebSocketContext);
  if (!ctx) throw new Error("useDeviceWS must be used within DeviceWebSocketProvider");
  return ctx;
}
