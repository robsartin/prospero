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

    await user.click(screen.getByText("History"));
    expect(defaultProps.onTabChange).toHaveBeenCalledWith("History");
  });

  it("highlights the active tab with different styling", () => {
    render(<NavTabs {...defaultProps} activeTab="Forecast" />);

    const forecastTab = screen.getByText("Forecast");
    const currentTab = screen.getByText("Current");

    expect(forecastTab.className).not.toEqual(currentTab.className);
    expect(forecastTab).toHaveAttribute("aria-selected", "true");
    expect(currentTab).toHaveAttribute("aria-selected", "false");
  });
});
