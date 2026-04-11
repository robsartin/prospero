import { render, screen } from "@testing-library/react";
import { ForecastDay } from "./ForecastDay";

describe("ForecastDay", () => {
  const defaultProps = {
    dayLabel: "Mon",
    conditions: "Partly Cloudy",
    highTemp: 28,
    lowTemp: 18,
    precipProbability: 30,
  };

  it("renders day label", () => {
    render(<ForecastDay {...defaultProps} />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
  });

  it("renders high and low temperatures", () => {
    render(<ForecastDay {...defaultProps} />);
    expect(screen.getByText("28°")).toBeInTheDocument();
    expect(screen.getByText("18°")).toBeInTheDocument();
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
