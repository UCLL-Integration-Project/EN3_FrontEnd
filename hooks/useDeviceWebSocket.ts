"use client";

// NOTE: insecure websocket connections from an https:// origin are blocked by browsers (mixed content).
// This works on http://localhost:8080 (dev) and over an HTTP deployment.
// For production over HTTPS you need a WSS endpoint or a reverse proxy.

import { useState, useEffect, useRef, useCallback } from "react";

const WS_PORT = 81;

export interface SensorData {
  ax: number;
  ay: number;
  az: number;
  rfCount: number;
  rfMessages: string[];
  batteryPct: number;  // 0-100, or -1 when sensor not available
  vcc: number;         // supply voltage in volts, 0 when not connected
  customMsg: string;
  ts: number;
}

export interface DevicePreferences {
  autoConnect: boolean;
  backgroundSync: boolean;
  notifications: boolean;
  haptics: boolean;
  doNotDisturb: boolean;
}

export interface DeviceInfo {
  model: string;
  mac: string;
  name: string;
  firmware: string;
  prefs?: DevicePreferences;
}

const MAX_RECONNECT_ATTEMPTS = 12;

export function useDeviceWebSocket(deviceIp: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isUnreachable, setIsUnreachable] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [lastNameAck, setLastNameAck] = useState<{ status: string; name?: string; reason?: string } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(200);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);
  // Always reflects the latest IP so the onclose reconnect closure uses it.
  const ipRef = useRef(deviceIp);
  // Holds the latest `open` so forceReconnect can call it outside the effect.
  const openRef = useRef<(ip: string) => void>(() => {});
  // Commands queued while not yet authenticated — flushed on authAck.
  const cmdQueueRef = useRef<string[]>([]);
  // Mirrors isAuthenticated state as a ref so sendCommand can read it synchronously.
  const isAuthRef = useRef(false);

  useEffect(() => {
    ipRef.current = deviceIp;
  }, [deviceIp]);

  useEffect(() => {
    function open(ip: string) {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      const prev = wsRef.current;
      if (prev) {
        prev.onopen = prev.onclose = prev.onerror = prev.onmessage = null;
        prev.close();
      }
      const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // nosemgrep: javascript.lang.security.detect-insecure-websocket.detect-insecure-websocket
      const ws = new WebSocket(`${protocol}//${ip}:${WS_PORT}`);
      ws.onopen = () => {
        backoffRef.current = 200;  // reset to fast retry on next disconnect
        setIsConnected(true);
      };
      ws.onclose = () => {
        setIsConnected(false);
        setIsAuthenticated(false);
        isAuthRef.current = false;
        cmdQueueRef.current = [];
        if (activeRef.current && ipRef.current) {
          setReconnectAttempts((prev) => {
            const next = prev + 1;
            if (next >= MAX_RECONNECT_ATTEMPTS) {
              setIsUnreachable(true);
            }
            reconnectRef.current = setTimeout(
              () => open(ipRef.current),
              backoffRef.current,
            );
            // Short initial retries (200→400→800ms) then cap at 10s for sustained outages
            backoffRef.current = Math.min(backoffRef.current * 2, 10_000);
            return next;
          });
        }
      };
      ws.onerror = () => setIsConnected(false);
      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data as string);
          if (d.type === "data") setSensorData(d);
          else if (d.type === "device") {
            setDeviceInfo({ model: d.model, mac: d.mac, name: d.name, firmware: d.firmware, prefs: d.prefs });
            if (d.token) {
              setSessionToken(d.token);
              // Auto-authenticate with token
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(`AUTH:${d.token}`);
              }
            }
            // Reset reconnect attempts on successful connection
            setReconnectAttempts(0);
            setIsUnreachable(false);
          } else if (d.type === "authAck") {
            if (d.status === "ok") {
              setIsAuthenticated(true);
              isAuthRef.current = true;
              // Flush any commands that were queued before auth completed
              const queued = cmdQueueRef.current.splice(0);
              queued.forEach((cmd) => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  wsRef.current.send(cmd);
                }
              });
            } else {
              console.warn("[WS] AUTH failed:", d);
            }
          } else if (d.type === "nameAck") {
            setLastNameAck({ status: d.status, name: d.name, reason: d.reason });
          } else if (d.type === "error") {
            console.warn("[WS] Device error:", d.reason);
          }
        } catch (err) {
          console.warn("[WS] malformed frame, ignored:", (e.data as string)?.slice(0, 120), err);
        }
      };
      wsRef.current = ws;
    }

    openRef.current = open;

    if (!deviceIp) return;

    activeRef.current = true;
    backoffRef.current = 1000;
    open(deviceIp);

    return () => {
      activeRef.current = false;
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      const ws = wsRef.current;
      if (ws) {
        ws.onopen = ws.onclose = ws.onerror = ws.onmessage = null;
        ws.close();
        wsRef.current = null;
      }
      setIsConnected(false);
    };
  }, [deviceIp]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(`MSG:${text}`);
    }
  }, []);

  const sendCommand = useCallback((cmd: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(cmd);
    }
  }, []);

  const forceReconnect = useCallback(() => {
    const ip = ipRef.current;
    if (!ip) return;
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    setIsUnreachable(false);
    setReconnectAttempts(0);
    backoffRef.current = 200;
    activeRef.current = true;
    openRef.current(ip);
  }, []);

  return { isConnected, isAuthenticated, sensorData, deviceInfo, isUnreachable, reconnectAttempts, sessionToken, lastNameAck, sendMessage, sendCommand, forceReconnect };
}
