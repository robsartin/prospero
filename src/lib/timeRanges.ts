export type TimeRange = "today" | "week" | "month" | "last-month" | "year";

const DAY = 86400;
const MAX_CHUNK = 5 * DAY;

/**
 * Returns [start, end] epoch seconds for a named time range.
 * @param now - current epoch seconds (injectable for testing)
 */
export function getTimeRange(
  range: TimeRange,
  now: number = Math.floor(Date.now() / 1000)
): [number, number] {
  switch (range) {
    case "today": {
      const d = new Date(now * 1000);
      d.setUTCHours(0, 0, 0, 0);
      return [Math.floor(d.getTime() / 1000), now];
    }
    case "week":
      return [now - 7 * DAY, now];
    case "month":
      return [now - 30 * DAY, now];
    case "last-month": {
      const d = new Date(now * 1000);
      const firstOfThisMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
      const firstOfLastMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1));
      const lastOfLastMonth = new Date(firstOfThisMonth.getTime() - 1000);
      return [
        Math.floor(firstOfLastMonth.getTime() / 1000),
        Math.floor(lastOfLastMonth.getTime() / 1000),
      ];
    }
    case "year":
      return [now - 365 * DAY, now];
  }
}

/**
 * Splits a time range into chunks of at most 5 days (Tempest API limit).
 */
export function chunkTimeRange(
  start: number,
  end: number
): [number, number][] {
  const chunks: [number, number][] = [];
  let cursor = start;
  while (cursor < end) {
    const chunkEnd = Math.min(cursor + MAX_CHUNK, end);
    chunks.push([cursor, chunkEnd]);
    cursor = chunkEnd;
  }
  return chunks;
}
