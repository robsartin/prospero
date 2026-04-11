const ICON_MAP: Record<string, string> = {
  "clear-day": "☀️",
  "clear-night": "🌙",
  "partly-cloudy-day": "⛅",
  "partly-cloudy-night": "🌤️",
  "cloudy": "☁️",
  "rainy": "🌧️",
  "possibly-rainy-day": "🌦️",
  "possibly-rainy-night": "🌦️",
  "thunderstorm": "⛈️",
  "snow": "🌨️",
  "possibly-snow-day": "🌨️",
  "possibly-snow-night": "🌨️",
  "sleet": "🧊",
  "foggy": "🌫️",
  "windy": "💨",
};

const CONDITIONS_PATTERNS: [RegExp, string][] = [
  [/thunder/i, "⛈️"],
  [/snow/i, "🌨️"],
  [/sleet|freez/i, "🧊"],
  [/rain/i, "🌧️"],
  [/fog|haz/i, "🌫️"],
  [/cloud/i, "☁️"],
  [/clear|sunny/i, "☀️"],
  [/wind/i, "💨"],
];

const VERY_COLD_THRESHOLD = 0;
const VERY_HOT_THRESHOLD = 38;
const FALLBACK_EMOJI = "🌤️";

export function getWeatherEmoji(
  icon: string,
  conditions: string,
  highTemp?: number
): string {
  if (highTemp != null && highTemp < VERY_COLD_THRESHOLD) return "🥶";
  if (highTemp != null && highTemp > VERY_HOT_THRESHOLD) return "🥵";

  const byIcon = ICON_MAP[icon];
  if (byIcon) return byIcon;

  for (const [pattern, emoji] of CONDITIONS_PATTERNS) {
    if (pattern.test(conditions)) return emoji;
  }

  return FALLBACK_EMOJI;
}
