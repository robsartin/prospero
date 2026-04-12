interface WindArrowProps {
  cx: number;
  cy: number;
  direction: number | null;
  size?: number;
  color?: string;
}

/**
 * SVG arrow indicating wind direction. Rendered inside a Recharts
 * chart as a custom dot. Arrow points in the direction wind is
 * blowing TO (meteorological: direction value is where wind comes FROM,
 * so the arrow is rotated by `direction` degrees — 0° = from north = arrow points down).
 */
export function WindArrow({
  cx,
  cy,
  direction,
  size = 8,
  color = "#1e40af",
}: WindArrowProps) {
  if (direction == null) return null;

  const half = size / 2;

  return (
    <g transform={`translate(${cx},${cy}) rotate(${direction})`}>
      <polygon
        points={`0,${-half} ${half / 2},${half} ${-half / 2},${half}`}
        fill={color}
        stroke="none"
      />
    </g>
  );
}
