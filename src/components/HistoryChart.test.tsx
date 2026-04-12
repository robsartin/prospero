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
  Line: ({ dataKey }: { dataKey?: string }) => (
    <div data-testid="line" data-datakey={dataKey} />
  ),
  Legend: () => <div data-testid="legend" />,
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
    render(<HistoryChart data={mockData} label="Temperature" unit="°C" precision={1} />);
    expect(screen.getByTestId("history-chart")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("accepts precision prop without error", () => {
    render(<HistoryChart data={mockData} label="Rain" unit="mm" precision={2} />);
    expect(screen.getByTestId("history-chart")).toBeInTheDocument();
  });

  it("accepts domain prop without error", () => {
    render(<HistoryChart data={mockData} label="Temp" unit="°C" domain={[10, 30]} />);
    expect(screen.getByTestId("history-chart")).toBeInTheDocument();
  });

  it("renders label and unit in heading", () => {
    render(<HistoryChart data={mockData} label="Temperature" unit="°C" />);
    expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<HistoryChart data={[]} label="Temperature" unit="°C" />);
    expect(screen.getByText("No history data available.")).toBeInTheDocument();
  });

  it("renders one line per series when series prop provided", () => {
    const multiData = [
      { time: "12:00", value: 22, heatIndex: 28, windChill: null, wetBulb: 20 },
      { time: "13:00", value: 23, heatIndex: 29, windChill: null, wetBulb: 21 },
    ];
    render(
      <HistoryChart
        data={multiData}
        label="Temperature"
        unit="°C"
        series={[
          { dataKey: "value", label: "Air", color: "#ef4444" },
          { dataKey: "heatIndex", label: "Heat index", color: "#f59e0b" },
          { dataKey: "wetBulb", label: "Wet bulb", color: "#3b82f6" },
        ]}
      />
    );
    const lines = screen.getAllByTestId("line");
    expect(lines).toHaveLength(3);
    expect(lines.map((l) => l.getAttribute("data-datakey"))).toEqual([
      "value",
      "heatIndex",
      "wetBulb",
    ]);
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("renders a single line with dataKey=value when series prop omitted", () => {
    render(<HistoryChart data={mockData} label="Temperature" unit="°C" />);
    const lines = screen.getAllByTestId("line");
    expect(lines).toHaveLength(1);
    expect(lines[0].getAttribute("data-datakey")).toBe("value");
  });
});
