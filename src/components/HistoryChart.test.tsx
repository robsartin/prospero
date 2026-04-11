import { render, screen } from "@testing-library/react";
import HistoryChart from "./HistoryChart";

// Mock Recharts to avoid SVG rendering issues in jsdom
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  CartesianGrid: () => <div data-testid="grid" />,
}));

describe("HistoryChart", () => {
  const mockData = [
    { time: "12:00", value: 22 },
    { time: "13:00", value: 23 },
    { time: "14:00", value: 24 },
  ];

  it("renders chart with data", () => {
    render(<HistoryChart data={mockData} label="Temperature" unit="°C" />);
    expect(screen.getByTestId("history-chart")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("renders label and unit in heading", () => {
    render(<HistoryChart data={mockData} label="Temperature" unit="°C" />);
    expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<HistoryChart data={[]} label="Temperature" unit="°C" />);
    expect(screen.getByText("No history data available.")).toBeInTheDocument();
  });
});
