import { render } from "@testing-library/react";
import { WindArrow } from "./WindArrow";

describe("WindArrow", () => {
  it("renders an SVG with rotation matching wind direction", () => {
    const { container } = render(
      <svg>
        <WindArrow cx={100} cy={50} direction={180} />
      </svg>
    );
    const g = container.querySelector("g");
    expect(g).toBeInTheDocument();
    expect(g?.getAttribute("transform")).toContain("rotate(180");
  });

  it("renders nothing when direction is null", () => {
    const { container } = render(
      <svg>
        <WindArrow cx={100} cy={50} direction={null} />
      </svg>
    );
    expect(container.querySelector("g")).not.toBeInTheDocument();
  });

  it("renders at correct position", () => {
    const { container } = render(
      <svg>
        <WindArrow cx={200} cy={75} direction={90} />
      </svg>
    );
    const g = container.querySelector("g");
    expect(g?.getAttribute("transform")).toContain("translate(200,75)");
  });

  it("rotates 0° for north wind (arrow points down — wind FROM north)", () => {
    const { container } = render(
      <svg>
        <WindArrow cx={0} cy={0} direction={0} />
      </svg>
    );
    const g = container.querySelector("g");
    expect(g?.getAttribute("transform")).toContain("rotate(0");
  });
});
