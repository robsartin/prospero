"use client";

import { useEffect, useRef, useState } from "react";
import { TempestWebSocket, type ConnectionState } from "@/lib/websocket";

export interface UseWeatherSocketOptions {
  token: string | null;
  deviceId: number | null;
}

export interface UseWeatherSocketResult {
  data: unknown | null;
  connectionState: ConnectionState;
}

export function useWeatherSocket({
  token,
  deviceId,
}: UseWeatherSocketOptions): UseWeatherSocketResult {
  const [data, setData] = useState<unknown | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("closed");
  const clientRef = useRef<TempestWebSocket | null>(null);

  useEffect(() => {
    if (!token || !deviceId) return;

    const client = new TempestWebSocket({
      token,
      deviceId,
      onMessage: setData,
      onStateChange: setConnectionState,
    });

    clientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [token, deviceId]);

  return { data, connectionState };
}
