import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryView from "./HistoryView";

// Mock Recharts
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  CartesianGrid: () => <div />,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockHistory = {
  station_id: 123,
  obs: [
    {
      timestamp: 1681000000,
      air_temperature: 22,
      sea_level_pressure: 1013,
      wind_avg: 3.5,
    },
    {
      timestamp: 1681003600,
      air_temperature: 23,
      sea_level_pressure: 1014,
      wind_avg: 4.0,
    },
  ],
  status: { status_code: 0, status_message: "SUCCESS" },
};

describe("HistoryView", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("shows prompt when no stationId", () => {
    render(<HistoryView stationId={null} />);
    expect(screen.getByText("Select a station to view history.")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<HistoryView stationId={123} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders charts with history data", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHistory),
    });

    render(<HistoryView stationId={123} />);

    await waitFor(() => {
      expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();
    });

    expect(screen.getByText("Pressure (mb)")).toBeInTheDocument();
    expect(screen.getByText("Wind (m/s)")).toBeInTheDocument();
  });

  it("shows error on fetch failure", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    render(<HistoryView stationId={123} />);

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

    render(<HistoryView stationId={123} />);

    await waitFor(() => {
      expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();
    });

    mockFetch.mockClear();
    await user.click(screen.getByText("7d"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("station_id=123");
  });

  it("renders TimeRangeSelector with all options", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<HistoryView stationId={123} />);
    expect(screen.getByText("24h")).toBeInTheDocument();
    expect(screen.getByText("7d")).toBeInTheDocument();
    expect(screen.getByText("30d")).toBeInTheDocument();
    expect(screen.getByText("1y")).toBeInTheDocument();
  });
});
