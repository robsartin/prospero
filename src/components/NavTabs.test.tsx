import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavTabs from "./NavTabs";

describe("NavTabs", () => {
  const defaultProps = {
    activeTab: "Current",
    onTabChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders three tab labels", () => {
    render(<NavTabs {...defaultProps} />);
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("Forecast")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("calls onTabChange when a tab is clicked", async () => {
    const user = userEvent.setup();
    render(<NavTabs {...defaultProps} />);
    await user.click(screen.getByText("Forecast"));
    expect(defaultProps.onTabChange).toHaveBeenCalledWith("Forecast");
  });

  it("highlights the active tab", () => {
    render(<NavTabs {...defaultProps} activeTab="History" />);
    const historyButton = screen.getByText("History");
    expect(historyButton).toHaveClass("border-blue-500");
    expect(historyButton).toHaveClass("text-blue-600");
  });

  it("does not highlight inactive tabs", () => {
    render(<NavTabs {...defaultProps} activeTab="Current" />);
    const forecastButton = screen.getByText("Forecast");
    expect(forecastButton).not.toHaveClass("border-blue-500");
    expect(forecastButton).toHaveClass("text-zinc-500");
  });
});
