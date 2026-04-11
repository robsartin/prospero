import { render, screen, waitFor, act } from "@testing-library/react";
import CurrentConditions from "./CurrentConditions";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const mockObservations = {
  station_id: 123,
  obs: [
    {
      air_temperature: 22.5,
      feels_like: 24,
      wind_avg: 3.2,
      wind_gust: 5.1,
      wind_direction: 180,
      relative_humidity: 65,
      dew_point: 15.5,
      sea_level_pressure: 1013,
      pressure_trend: "Rising",
      uv: 6,
      solar_radiation: 845,
      precip_accum_local_day: 0.5,
      lightning_strike_count: 2,
      lightning_strike_last_distance: 10,
      brightness: 50000,
    },
  ],
  status: { status_code: 0, status_message: "SUCCESS" },
};

describe("CurrentConditions", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("shows prompt when no stationId", () => {
    render(<CurrentConditions stationId={null} />);
    expect(screen.getByText("Select a station to view conditions.")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(<CurrentConditions stationId={123} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders metric cards with observation data", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockObservations),
    });

    render(<CurrentConditions stationId={123} />);

    await waitFor(() => {
      expect(screen.getByText("22.5")).toBeInTheDocument();
    });

    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("Feels 24°")).toBeInTheDocument();
    expect(screen.getByText("3.2")).toBeInTheDocument();
    expect(screen.getByText("65")).toBeInTheDocument();
    expect(screen.getByText("1013")).toBeInTheDocument();
  });

  it("shows error with weather image and retry on fetch failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<CurrentConditions stationId={123} />);

    await waitFor(() => {
      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    expect(screen.getByText(/rough weather/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("fetches from correct API endpoint", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockObservations),
    });

    render(<CurrentConditions stationId={456} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/observations?station_id=456",
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });
  });

  it("shows last-updated timestamp after data loads", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockObservations),
    });

    render(<CurrentConditions stationId={123} />);

    await waitFor(() => {
      expect(screen.getByTestId("last-updated")).toBeInTheDocument();
    });

    expect(screen.getByTestId("last-updated").textContent).toMatch(/Last updated:/);
  });

  it("auto-refreshes after 60 seconds", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockObservations),
    });

    render(<CurrentConditions stationId={123} />);

    await waitFor(() => {
      expect(screen.getByText("22.5")).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
