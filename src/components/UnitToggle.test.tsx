import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UnitToggle from "./UnitToggle";

describe("UnitToggle", () => {
  it("renders with current unit system", () => {
    render(<UnitToggle system="metric" onChange={jest.fn()} />);
    expect(screen.getByText("°C")).toBeInTheDocument();
  });

  it("shows imperial label when imperial", () => {
    render(<UnitToggle system="imperial" onChange={jest.fn()} />);
    expect(screen.getByText("°F")).toBeInTheDocument();
  });

  it("calls onChange when clicked", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<UnitToggle system="metric" onChange={onChange} />);
    await user.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith("imperial");
  });

  it("toggles back to metric from imperial", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<UnitToggle system="imperial" onChange={onChange} />);
    await user.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith("metric");
  });
});
