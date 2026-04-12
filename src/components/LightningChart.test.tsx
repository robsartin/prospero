import { render, screen } from "@testing-library/react";
import LightningChart from "./LightningChart";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  CartesianGrid: () => <div />,
}));

describe("LightningChart", () => {
  it("renders bar chart when strikes occurred", () => {
    const data = [
      { time: "12:00", value: 0 },
      { time: "13:00", value: 3 },
    ];
    render(<LightningChart data={data} />);
    expect(screen.getByTestId("lightning-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByText("Lightning (strikes)")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<LightningChart data={[]} />);
    expect(screen.getByText("No lightning strikes in this period.")).toBeInTheDocument();
  });

  it("shows empty state when all zeros", () => {
    const data = [
      { time: "12:00", value: 0 },
      { time: "13:00", value: 0 },
    ];
    render(<LightningChart data={data} />);
    expect(screen.getByText("No lightning strikes in this period.")).toBeInTheDocument();
  });
});
