import { render, screen } from "@testing-library/react";
import HistorySkeleton from "./HistorySkeleton";

describe("HistorySkeleton", () => {
  it("renders a status region with accessible label", () => {
    render(<HistorySkeleton />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-label", "Loading history");
  });

  it("preserves a 'loading' testid for back-compat", () => {
    render(<HistorySkeleton />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("renders animated placeholders for each chart slot", () => {
    const { container } = render(<HistorySkeleton />);
    const pulses = container.querySelectorAll(".animate-pulse");
    expect(pulses.length).toBeGreaterThanOrEqual(6);
  });
});
