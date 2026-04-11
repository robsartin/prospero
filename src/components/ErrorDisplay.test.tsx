import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorDisplay from "./ErrorDisplay";

describe("ErrorDisplay", () => {
  it("renders error message", () => {
    render(<ErrorDisplay message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders a weather damage image", () => {
    render(<ErrorDisplay message="Server error" />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", expect.stringMatching(/weather|storm/i));
  });

  it("renders a heading", () => {
    render(<ErrorDisplay message="Oops" />);
    expect(screen.getByRole("heading")).toHaveTextContent(/rough weather/i);
  });

  it("renders retry button when onRetry provided", async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    render(<ErrorDisplay message="Error" onRetry={onRetry} />);
    const btn = screen.getByRole("button", { name: /try again/i });
    await user.click(btn);
    expect(onRetry).toHaveBeenCalled();
  });

  it("does not render retry button when onRetry not provided", () => {
    render(<ErrorDisplay message="Error" />);
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });
});
