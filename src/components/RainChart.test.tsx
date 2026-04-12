import { render, screen } from "@testing-library/react";
import RainChart from "./RainChart";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  Scatter: () => <div data-testid="scatter" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  CartesianGrid: () => <div />,
}));

describe("RainChart", () => {
  const mockData = [
    { time: "12:00", value: 0.5 },
    { time: "13:00", value: 1.2 },
  ];

  it("renders area chart with data", () => {
    render(<RainChart data={mockData} unit="mm" />);
    expect(screen.getByTestId("rain-chart")).toBeInTheDocument();
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });

  it("renders heading with unit", () => {
    render(<RainChart data={mockData} unit="mm" />);
    expect(screen.getByText("Rain (mm)")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<RainChart data={[]} unit="mm" />);
    expect(screen.getByText("No rain data available.")).toBeInTheDocument();
  });

  it("renders a hail legend note when any bucket has hail", () => {
    const hailData = [
      { time: "12:00", value: 0.5, precipType: 1 },
      { time: "13:00", value: 0.8, precipType: 2 },
    ];
    render(<RainChart data={hailData} unit="mm" />);
    expect(screen.getByTestId("hail-legend")).toBeInTheDocument();
  });

  it("does not render hail legend when all rain", () => {
    const rainOnly = [
      { time: "12:00", value: 0.5, precipType: 1 },
      { time: "13:00", value: 0.8, precipType: 1 },
    ];
    render(<RainChart data={rainOnly} unit="mm" />);
    expect(screen.queryByTestId("hail-legend")).not.toBeInTheDocument();
  });
});
