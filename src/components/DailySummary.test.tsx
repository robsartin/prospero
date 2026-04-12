import { render, screen } from "@testing-library/react";
import DailySummary from "./DailySummary";
import type { StationObservation } from "@/lib/types";

describe("DailySummary", () => {
  const obs: Partial<StationObservation> = {
    air_temperature: 22.567,
    precip_accum_local_day: 2.567,
    wind_gust: 12.345,
  };

  it("renders temperature as integer", () => {
    render(<DailySummary observation={obs as StationObservation} />);
    expect(screen.getByText(/23°/)).toBeInTheDocument();
  });

  it("renders rain with 2 decimals", () => {
    render(<DailySummary observation={obs as StationObservation} />);
    expect(screen.getByText(/2\.57/)).toBeInTheDocument();
    expect(screen.getByText(/Rain/i)).toBeInTheDocument();
  });

  it("renders peak gust with 1 decimal", () => {
    render(<DailySummary observation={obs as StationObservation} />);
    expect(screen.getByText(/12\.3/)).toBeInTheDocument();
    expect(screen.getByText(/Gust/i)).toBeInTheDocument();
  });

  it("handles null values gracefully", () => {
    const partial: Partial<StationObservation> = {
      air_temperature: null as unknown as number,
      precip_accum_local_day: null as unknown as number,
      wind_gust: null as unknown as number,
    };
    render(<DailySummary observation={partial as StationObservation} />);
    const summary = screen.getByTestId("daily-summary");
    expect(summary.textContent).toContain("--");
  });
});
