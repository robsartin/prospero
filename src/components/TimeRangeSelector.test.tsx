import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimeRangeSelector from "./TimeRangeSelector";

describe("TimeRangeSelector", () => {
  const defaultProps = {
    selected: "24h" as const,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onChange = jest.fn();
  });

  it("renders all range options", () => {
    render(<TimeRangeSelector {...defaultProps} />);
    expect(screen.getByText("24h")).toBeInTheDocument();
    expect(screen.getByText("7d")).toBeInTheDocument();
    expect(screen.getByText("30d")).toBeInTheDocument();
    expect(screen.getByText("1y")).toBeInTheDocument();
  });

  it("calls onChange with selected range", async () => {
    const user = userEvent.setup();
    render(<TimeRangeSelector {...defaultProps} />);
    await user.click(screen.getByText("7d"));
    expect(defaultProps.onChange).toHaveBeenCalledWith("7d");
  });

  it("highlights the selected range", () => {
    render(<TimeRangeSelector {...defaultProps} selected="30d" />);
    expect(screen.getByText("30d")).toHaveClass("bg-blue-500");
    expect(screen.getByText("24h")).not.toHaveClass("bg-blue-500");
  });
});
