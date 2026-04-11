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
      air_temperature: 22.567,
      feels_like: 24.321,
      wind_avg: 3.267,
      wind_gust: 5.189,
      wind_direction: 180,
      relative_humidity: 65.4,
      dew_point: 15.567,
      sea_level_pressure: 1013.256,
      pressure_trend: "Rising",
      uv: 6.789,
      solar_radiation: 845,
      precip_accum_local_day: 0.567,
      lightning_strike_count: 2,
      lightning_strike_last_distance: 10.8,
      brightness: 50123.7,
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

  it("renders metric cards with formatted precision", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockObservations),
    });

    render(<CurrentConditions stationId={123} />);

    await waitFor(() => {
      expect(screen.getByText("22.6")).toBeInTheDocument(); // temp: 1 decimal
    });

    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("Feels 24.3°")).toBeInTheDocument(); // feels: 1 decimal
    expect(screen.getByText("3.3")).toBeInTheDocument();          // wind: 1 decimal
    expect(screen.getByText("65")).toBeInTheDocument();           // humidity: integer
    expect(screen.getByText("1013.3")).toBeInTheDocument();       // pressure: 1 decimal
    expect(screen.getByText("6.79")).toBeInTheDocument();         // uv: 2 decimals
    expect(screen.getByText("0.57")).toBeInTheDocument();         // rain: 2 decimals
    expect(screen.getByText("50124")).toBeInTheDocument();        // brightness: integer
    expect(screen.getByText("Last 11 km")).toBeInTheDocument();   // lightning distance: integer
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
      expect(screen.getByText("22.6")).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
