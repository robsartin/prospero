export type ConnectionState = "connecting" | "open" | "closed" | "error";

export interface TempestWebSocketOptions {
  token: string;
  deviceId: number;
  onMessage: (data: unknown) => void;
  onStateChange: (state: ConnectionState) => void;
}

const WS_URL = "wss://ws.weatherflow.com/swd/data";
const MAX_RECONNECT_DELAY = 30000;

export class TempestWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;

  constructor(private options: TempestWebSocketOptions) {}

  connect(): void {
    this.closed = false;
    this.options.onStateChange("connecting");

    const url = `${WS_URL}?token=${this.options.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.options.onStateChange("open");
      this.sendListenStart();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.options.onMessage(data);
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      if (!this.closed) {
        this.options.onStateChange("closed");
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.options.onStateChange("error");
    };
  }

  disconnect(): void {
    this.closed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.sendListenStop();
      this.ws.close();
      this.ws = null;
    }
    this.options.onStateChange("closed");
  }

  private sendListenStart(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "listen_start",
          device_id: this.options.deviceId,
          id: `prospero-${this.options.deviceId}`,
        })
      );
    }
  }

  private sendListenStop(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "listen_stop",
          device_id: this.options.deviceId,
          id: `prospero-${this.options.deviceId}`,
        })
      );
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      MAX_RECONNECT_DELAY
    );
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      if (!this.closed) {
        this.connect();
      }
    }, delay);
  }
}
