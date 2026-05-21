"use client";

// NOTE: ws:// from an https:// origin is blocked by browsers (mixed content).
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
  customMsg: string;
  ts: number;
}

export function useDeviceWebSocket(deviceIp: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(1000);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);
  // Always reflects the latest IP so the onclose reconnect closure uses it.
  const ipRef = useRef(deviceIp);
  // Holds the latest `open` so forceReconnect can call it outside the effect.
  const openRef = useRef<(ip: string) => void>(() => {});

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
      const ws = new WebSocket(`ws://${ip}:${WS_PORT}`);
      ws.onopen = () => {
        backoffRef.current = 1000;
        setIsConnected(true);
      };
      ws.onclose = () => {
        setIsConnected(false);
        if (activeRef.current && ipRef.current) {
          reconnectRef.current = setTimeout(
            () => open(ipRef.current),
            backoffRef.current,
          );
          backoffRef.current = Math.min(backoffRef.current * 2, 30_000);
        }
      };
      ws.onerror = () => setIsConnected(false);
      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data as string);
          if (d.type === "data") setSensorData(d);
        } catch {
          /* malformed frame — ignore */
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
    activeRef.current = true;
    backoffRef.current = 1000;
    openRef.current(ip);
  }, []);

  return { isConnected, sensorData, sendMessage, sendCommand, forceReconnect };
}
