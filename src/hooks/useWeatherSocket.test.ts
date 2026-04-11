import { renderHook, act } from "@testing-library/react";
import { useWeatherSocket } from "./useWeatherSocket";

// Mock the TempestWebSocket class
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
let capturedOnMessage: ((data: unknown) => void) | null = null;
let capturedOnStateChange: ((state: string) => void) | null = null;

jest.mock("@/lib/websocket", () => ({
  TempestWebSocket: jest.fn().mockImplementation((opts: {
    onMessage: (data: unknown) => void;
    onStateChange: (state: string) => void;
  }) => {
    capturedOnMessage = opts.onMessage;
    capturedOnStateChange = opts.onStateChange;
    return { connect: mockConnect, disconnect: mockDisconnect };
  }),
}));

describe("useWeatherSocket", () => {
  beforeEach(() => {
    mockConnect.mockReset();
    mockDisconnect.mockReset();
    capturedOnMessage = null;
    capturedOnStateChange = null;
  });

  it("returns null data and closed state initially", () => {
    const { result } = renderHook(() =>
      useWeatherSocket({ token: null, deviceId: null })
    );
    expect(result.current.data).toBeNull();
    expect(result.current.connectionState).toBe("closed");
  });

  it("connects when token and deviceId are provided", () => {
    renderHook(() =>
      useWeatherSocket({ token: "test-token", deviceId: 123 })
    );
    expect(mockConnect).toHaveBeenCalled();
  });

  it("updates data when message received", () => {
    const { result } = renderHook(() =>
      useWeatherSocket({ token: "test-token", deviceId: 123 })
    );

    act(() => {
      capturedOnMessage?.({ type: "obs_st", obs: [[1, 2]] });
    });

    expect(result.current.data).toEqual({ type: "obs_st", obs: [[1, 2]] });
  });

  it("disconnects on unmount", () => {
    const { unmount } = renderHook(() =>
      useWeatherSocket({ token: "test-token", deviceId: 123 })
    );
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("does not connect without token", () => {
    renderHook(() =>
      useWeatherSocket({ token: null, deviceId: 123 })
    );
    expect(mockConnect).not.toHaveBeenCalled();
  });
});
