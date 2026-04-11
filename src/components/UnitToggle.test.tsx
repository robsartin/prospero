import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UnitToggle from "./UnitToggle";
import { MetricUnitStrategy, ImperialUnitStrategy } from "@/lib/units";

const metric = new MetricUnitStrategy();
const imperial = new ImperialUnitStrategy();

describe("UnitToggle", () => {
  it("renders metric label from strategy", () => {
    render(<UnitToggle units={metric} onChange={jest.fn()} />);
    expect(screen.getByText("°C")).toBeInTheDocument();
  });

  it("renders imperial label from strategy", () => {
    render(<UnitToggle units={imperial} onChange={jest.fn()} />);
    expect(screen.getByText("°F")).toBeInTheDocument();
  });

  it("emits imperial strategy when currently metric", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<UnitToggle units={metric} onChange={onChange} />);
    await user.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "imperial" })
    );
  });

  it("emits metric strategy when currently imperial", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<UnitToggle units={imperial} onChange={onChange} />);
    await user.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "metric" })
    );
  });
});
