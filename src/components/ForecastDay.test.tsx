import { render, screen } from "@testing-library/react";
import { ForecastDay } from "./ForecastDay";

describe("ForecastDay", () => {
  const defaultProps = {
    dayLabel: "Mon",
    icon: "partly-cloudy-day",
    conditions: "Partly Cloudy",
    highTemp: 28.567,
    lowTemp: 18.234,
    precipProbability: 30,
  };

  it("renders day label", () => {
    render(<ForecastDay {...defaultProps} />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
  });

  it("renders weather emoji based on icon", () => {
    render(<ForecastDay {...defaultProps} icon="rainy" conditions="Rain" />);
    expect(screen.getByTestId("weather-emoji")).toHaveTextContent("🌧️");
  });

  it("renders freezing emoji for very cold days", () => {
    render(<ForecastDay {...defaultProps} highTemp={-5} />);
    expect(screen.getByTestId("weather-emoji")).toHaveTextContent("🥶");
  });

  it("renders high and low temperatures with 1 decimal", () => {
    render(<ForecastDay {...defaultProps} />);
    expect(screen.getByText("28.6°")).toBeInTheDocument();
    expect(screen.getByText("18.2°")).toBeInTheDocument();
  });

  it("shows conditions as title on emoji", () => {
    render(<ForecastDay {...defaultProps} />);
    expect(screen.getByTestId("weather-emoji")).toHaveAttribute("title", "Partly Cloudy");
  });

  it("renders precip probability when > 0", () => {
    render(<ForecastDay {...defaultProps} precipProbability={45} />);
    expect(screen.getByTestId("precip")).toHaveTextContent("45%");
  });

  it("does not render precip when 0", () => {
    render(<ForecastDay {...defaultProps} precipProbability={0} />);
    expect(screen.queryByTestId("precip")).not.toBeInTheDocument();
  });
});
