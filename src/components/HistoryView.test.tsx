import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryView from "./HistoryView";
import { ImperialUnitStrategy } from "@/lib/units";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  CartesianGrid: () => <div />,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

// API now returns TransformedObservation[] (camelCase, from transforms.ts)
const mockHistory = [
  {
    timestamp: 1681000000,
    airTemperature: 22,
    stationPressure: 1013,
    windAvg: 3.5,
    relativeHumidity: 65,
    rainAccumulated: 0.2,
  },
  {
    timestamp: 1681003600,
    airTemperature: 23,
    stationPressure: 1014,
    windAvg: 4.0,
    relativeHumidity: 60,
    rainAccumulated: 0.0,
  },
];

describe("HistoryView", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("shows prompt when no deviceId", () => {
    render(<HistoryView deviceId={null} />);
    expect(screen.getByText("Select a station to view history.")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<HistoryView deviceId={456} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders charts with history data", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHistory),
    });

    render(<HistoryView deviceId={456} />);

    await waitFor(() => {
      expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();
    });

    expect(screen.getByText("Pressure (mb)")).toBeInTheDocument();
    expect(screen.getByText("Wind (m/s)")).toBeInTheDocument();
    expect(screen.getByText("Humidity (%)")).toBeInTheDocument();
    expect(screen.getByText("Rain (mm)")).toBeInTheDocument();
  });

  it("uses imperial labels when units provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHistory),
    });

    render(<HistoryView deviceId={456} units={new ImperialUnitStrategy()} />);

    await waitFor(() => {
      expect(screen.getByText("Temperature (°F)")).toBeInTheDocument();
    });

    expect(screen.getByText("Pressure (inHg)")).toBeInTheDocument();
    expect(screen.getByText("Wind (mph)")).toBeInTheDocument();
    expect(screen.getByText("Rain (in)")).toBeInTheDocument();
  });

  it("fetches from /api/history with device_id", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHistory),
    });

    render(<HistoryView deviceId={456} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("device_id=456");
  });

  it("shows error on fetch failure", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    render(<HistoryView deviceId={456} />);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });
  });

  it("refetches when time range changes", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHistory),
    });

    render(<HistoryView deviceId={456} />);

    await waitFor(() => {
      expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();
    });

    mockFetch.mockClear();
    await user.click(screen.getByText("7d"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("device_id=456");
  });

  it("renders TimeRangeSelector with all options", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<HistoryView deviceId={456} />);
    expect(screen.getByText("24h")).toBeInTheDocument();
    expect(screen.getByText("7d")).toBeInTheDocument();
    expect(screen.getByText("30d")).toBeInTheDocument();
    expect(screen.getByText("1y")).toBeInTheDocument();
  });
});
