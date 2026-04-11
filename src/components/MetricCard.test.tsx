import { render, screen } from "@testing-library/react";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("renders label and value", () => {
    render(<MetricCard label="Temperature" value={72.4} unit="°F" />);
    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("72.4")).toBeInTheDocument();
  });

  it("renders unit", () => {
    render(<MetricCard label="Wind" value={8.2} unit="mph" />);
    expect(screen.getByText("mph")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<MetricCard label="Temperature" value={72} unit="°F" icon="🌡" />);
    expect(screen.getByTestId("metric-card-icon")).toHaveTextContent("🌡");
  });

  it("does not render icon when not provided", () => {
    render(<MetricCard label="Temperature" value={72} unit="°F" />);
    expect(screen.queryByTestId("metric-card-icon")).not.toBeInTheDocument();
  });

  it("renders secondary text when provided", () => {
    render(
      <MetricCard label="Temperature" value={72} unit="°F" secondary="Feels 74°" />
    );
    expect(screen.getByTestId("metric-card-secondary")).toHaveTextContent("Feels 74°");
  });

  it("does not render secondary when not provided", () => {
    render(<MetricCard label="Temperature" value={72} unit="°F" />);
    expect(screen.queryByTestId("metric-card-secondary")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <MetricCard label="Test" value={0} unit="x" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders string values", () => {
    render(<MetricCard label="Conditions" value="Sunny" unit="" />);
    expect(screen.getByText("Sunny")).toBeInTheDocument();
  });

  it("applies severity border color when provided", () => {
    const { container } = render(
      <MetricCard label="Temp" value={40} unit="°C" severityColor="border-red-500" />
    );
    expect(container.firstChild).toHaveClass("border-red-500");
  });

  it("uses default border when no severity", () => {
    const { container } = render(
      <MetricCard label="Temp" value={20} unit="°C" />
    );
    expect(container.firstChild).toHaveClass("border-gray-200");
  });
});
