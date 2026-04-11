import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorPage from "./error";

describe("Error page", () => {
  it("renders error message", () => {
    render(<ErrorPage error={new Error("Test failure")} reset={jest.fn()} />);
    expect(screen.getByText("Test failure")).toBeInTheDocument();
  });

  it("renders weather damage image", () => {
    render(<ErrorPage error={new Error("Oops")} reset={jest.fn()} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("calls reset when retry clicked", async () => {
    const reset = jest.fn();
    const user = userEvent.setup();
    render(<ErrorPage error={new Error("Oops")} reset={reset} />);
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalled();
  });
});
