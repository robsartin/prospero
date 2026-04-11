import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimeRangeSelector from "./TimeRangeSelector";

describe("TimeRangeSelector", () => {
  const defaultProps = {
    selected: "today" as const,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onChange = jest.fn();
  });

  it("renders all range options", () => {
    render(<TimeRangeSelector {...defaultProps} />);
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("This Week")).toBeInTheDocument();
    expect(screen.getByText("Past Month")).toBeInTheDocument();
    expect(screen.getByText("Last Month")).toBeInTheDocument();
    expect(screen.getByText("Past Year")).toBeInTheDocument();
  });

  it("calls onChange with selected range id", async () => {
    const user = userEvent.setup();
    render(<TimeRangeSelector {...defaultProps} />);
    await user.click(screen.getByText("This Week"));
    expect(defaultProps.onChange).toHaveBeenCalledWith("week");
  });

  it("highlights the selected range", () => {
    render(<TimeRangeSelector {...defaultProps} selected="month" />);
    expect(screen.getByText("Past Month")).toHaveClass("bg-blue-500");
    expect(screen.getByText("Today")).not.toHaveClass("bg-blue-500");
  });
});
