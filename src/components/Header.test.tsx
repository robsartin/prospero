import { render, screen } from "@testing-library/react";
import Header from "./Header";

describe("Header", () => {
  it('renders "Prospero" title', () => {
    render(<Header />);
    expect(screen.getByText("Prospero")).toBeInTheDocument();
  });

  it("renders children in the header", () => {
    render(<Header><span>Station Picker</span></Header>);
    expect(screen.getByText("Station Picker")).toBeInTheDocument();
  });
});
