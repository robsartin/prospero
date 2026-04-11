import { render, screen } from "@testing-library/react";
import { ForecastDay } from "./ForecastDay";

describe("ForecastDay", () => {
  const defaultProps = {
    dayLabel: "Mon",
    conditions: "Partly Cloudy",
    highTemp: 28.567,
    lowTemp: 18.234,
    precipProbability: 30,
  };

  it("renders day label", () => {
    render(<ForecastDay {...defaultProps} />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
  });

  it("renders high and low temperatures with 1 decimal", () => {
    render(<ForecastDay {...defaultProps} />);
    expect(screen.getByText("28.6°")).toBeInTheDocument();
    expect(screen.getByText("18.2°")).toBeInTheDocument();
  });

  it("renders conditions text", () => {
    render(<ForecastDay {...defaultProps} />);
    expect(screen.getByText("Partly Cloudy")).toBeInTheDocument();
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
