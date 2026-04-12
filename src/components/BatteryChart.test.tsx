import { render, screen } from "@testing-library/react";
import BatteryChart from "./BatteryChart";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  CartesianGrid: () => <div />,
}));

describe("BatteryChart", () => {
  it("renders line chart with percent data", () => {
    const data = [
      { time: "12:00", value: 80 },
      { time: "13:00", value: 72 },
    ];
    render(<BatteryChart data={data} />);
    expect(screen.getByTestId("battery-chart")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByText("Battery (%)")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<BatteryChart data={[]} />);
    expect(screen.getByText("No battery data available.")).toBeInTheDocument();
  });
});
