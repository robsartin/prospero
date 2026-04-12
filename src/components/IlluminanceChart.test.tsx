import { render, screen } from "@testing-library/react";
import IlluminanceChart from "./IlluminanceChart";

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

describe("IlluminanceChart", () => {
  it("renders line chart when data is present", () => {
    const data = [
      { time: "12:00", value: 10000 },
      { time: "13:00", value: 25000 },
    ];
    render(<IlluminanceChart data={data} />);
    expect(screen.getByTestId("illuminance-chart")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByText("Illuminance (lux)")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<IlluminanceChart data={[]} />);
    expect(screen.getByText("No illuminance data available.")).toBeInTheDocument();
  });
});
