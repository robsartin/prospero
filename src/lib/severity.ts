export type Severity =
  | "normal"
  | "cold"
  | "warm"
  | "hot"
  | "low"
  | "moderate"
  | "high"
  | "very-high"
  | "extreme"
  | "danger";

export type MetricType = "temperature" | "uv" | "wind" | "lightning";

export function getSeverity(metric: MetricType, value: number): Severity {
  switch (metric) {
    case "temperature":
      if (value > 38) return "hot";
      if (value > 30) return "warm";
      if (value < 5) return "cold";
      return "normal";

    case "uv":
      if (value >= 11) return "extreme";
      if (value >= 8) return "very-high";
      if (value >= 6) return "high";
      if (value >= 3) return "moderate";
      return "low";

    case "wind":
      if (value > 25) return "extreme";
      if (value > 15) return "high";
      return "normal";

    case "lightning":
      if (value > 0) return "danger";
      return "normal";
  }
}

export const SEVERITY_COLORS: Record<Severity, string> = {
  normal: "border-gray-200",
  cold: "border-blue-400",
  warm: "border-orange-400",
  hot: "border-red-500",
  low: "border-green-400",
  moderate: "border-yellow-400",
  high: "border-orange-400",
  "very-high": "border-red-400",
  extreme: "border-purple-500",
  danger: "border-red-500",
};
