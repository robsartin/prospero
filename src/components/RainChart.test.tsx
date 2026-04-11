import { render, screen } from "@testing-library/react";
import RainChart from "./RainChart";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
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
});
