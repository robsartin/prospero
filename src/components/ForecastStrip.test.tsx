import { render, screen, waitFor } from "@testing-library/react";
import ForecastStrip from "./ForecastStrip";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockForecast = {
  forecast: {
    daily: [
      {
        day_start_local: 1681171200, // Mon April 11
        day_num: 11,
        month_num: 4,
        conditions: "Clear",
        icon: "clear-day",
        sunrise: 1681191000,
        sunset: 1681236000,
        air_temp_high: 28,
        air_temp_low: 18,
        precip_probability: 10,
        precip_icon: "chance-rain",
        precip_type: "rain",
      },
      {
        day_start_local: 1681257600, // Tue April 12
        day_num: 12,
        month_num: 4,
        conditions: "Rainy",
        icon: "rainy",
        sunrise: 1681277400,
        sunset: 1681322400,
        air_temp_high: 22,
        air_temp_low: 15,
        precip_probability: 80,
        precip_icon: "rain",
        precip_type: "rain",
      },
    ],
    hourly: [],
  },
  status: { status_code: 0, status_message: "SUCCESS" },
};

describe("ForecastStrip", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("shows prompt when no stationId", () => {
    render(<ForecastStrip stationId={null} />);
    expect(screen.getByText("Select a station to view forecast.")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<ForecastStrip stationId={123} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders forecast days", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockForecast),
    });

    render(<ForecastStrip stationId={123} />);

    await waitFor(() => {
      expect(screen.getByTestId("forecast-strip")).toBeInTheDocument();
    });

    expect(screen.getByText("28.0°")).toBeInTheDocument();
    expect(screen.getByText("18.0°")).toBeInTheDocument();
    const emojis = screen.getAllByTestId("weather-emoji");
    expect(emojis).toHaveLength(2);
    expect(emojis[0]).toHaveAttribute("title", "Clear");
    expect(emojis[1]).toHaveAttribute("title", "Rainy");
  });

  it("shows error on fetch failure with weather image and retry", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    render(<ForecastStrip stationId={123} />);

    await waitFor(() => {
      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    expect(screen.getByText(/rough weather/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});
