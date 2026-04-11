import { TempestWebSocket } from "./websocket";

class MockWebSocket {
  static OPEN = 1;
  static instances: MockWebSocket[] = [];

  url: string;
  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  sent: string[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.onclose?.();
  }
}

// @ts-expect-error -- mock WebSocket
global.WebSocket = MockWebSocket;

describe("TempestWebSocket", () => {
  let onMessage: jest.Mock;
  let onStateChange: jest.Mock;

  beforeEach(() => {
    MockWebSocket.instances = [];
    onMessage = jest.fn();
    onStateChange = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function createClient() {
    return new TempestWebSocket({
      token: "test-token",
      deviceId: 123,
      onMessage,
      onStateChange,
    });
  }

  it("connects to the correct URL", () => {
    const client = createClient();
    client.connect();

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toBe(
      "wss://ws.weatherflow.com/swd/data?token=test-token"
    );
    expect(onStateChange).toHaveBeenCalledWith("connecting");
  });

  it("sends listen_start on open", () => {
    const client = createClient();
    client.connect();

    const ws = MockWebSocket.instances[0];
    ws.onopen?.();

    expect(onStateChange).toHaveBeenCalledWith("open");
    expect(ws.sent).toHaveLength(1);
    const msg = JSON.parse(ws.sent[0]);
    expect(msg.type).toBe("listen_start");
    expect(msg.device_id).toBe(123);
  });

  it("parses incoming messages", () => {
    const client = createClient();
    client.connect();

    const ws = MockWebSocket.instances[0];
    ws.onopen?.();
    ws.onmessage?.({ data: JSON.stringify({ type: "obs_st", obs: [[1, 2, 3]] }) });

    expect(onMessage).toHaveBeenCalledWith({ type: "obs_st", obs: [[1, 2, 3]] });
  });

  it("sends listen_stop on disconnect", () => {
    const client = createClient();
    client.connect();

    const ws = MockWebSocket.instances[0];
    ws.onopen?.();
    client.disconnect();

    expect(ws.sent.length).toBeGreaterThanOrEqual(2);
    const stopMsg = JSON.parse(ws.sent[ws.sent.length - 1]);
    expect(stopMsg.type).toBe("listen_stop");
  });

  it("auto-reconnects on close with backoff", () => {
    const client = createClient();
    client.connect();

    const ws = MockWebSocket.instances[0];
    ws.onopen?.();

    // Simulate unexpected close
    ws.readyState = 3; // CLOSED
    ws.onclose?.();

    expect(onStateChange).toHaveBeenCalledWith("closed");

    // Advance timer for reconnect (1s initial delay)
    jest.advanceTimersByTime(1000);

    expect(MockWebSocket.instances).toHaveLength(2);
    expect(onStateChange).toHaveBeenCalledWith("connecting");

    // Clean up
    client.disconnect();
  });

  it("reports error state", () => {
    const client = createClient();
    client.connect();

    const ws = MockWebSocket.instances[0];
    ws.onerror?.();

    expect(onStateChange).toHaveBeenCalledWith("error");
    client.disconnect();
  });
});
