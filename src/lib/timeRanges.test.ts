import { getTimeRange, chunkTimeRange } from "./timeRanges";

const FIVE_DAYS = 5 * 86400;

describe("getTimeRange", () => {
  // Fix "now" to 2026-04-11 12:00:00 UTC (epoch 1776168000) for deterministic tests
  const now = 1776168000;

  it("today: midnight today to now", () => {
    const [start, end] = getTimeRange("today", now);
    expect(end).toBe(now);
    // start should be midnight UTC of the same day
    const startDate = new Date(start * 1000);
    expect(startDate.getUTCHours()).toBe(0);
    expect(startDate.getUTCMinutes()).toBe(0);
    expect(end - start).toBeLessThanOrEqual(86400);
  });

  it("week: 7 days ending now", () => {
    const [start, end] = getTimeRange("week", now);
    expect(end).toBe(now);
    expect(end - start).toBe(7 * 86400);
  });

  it("month: 30 days ending now", () => {
    const [start, end] = getTimeRange("month", now);
    expect(end).toBe(now);
    expect(end - start).toBe(30 * 86400);
  });

  it("last-month: first to last second of previous month", () => {
    const [start, end] = getTimeRange("last-month", now);
    const startDate = new Date(start * 1000);
    const endDate = new Date(end * 1000);
    // April 11 2026 → last month is March 2026
    expect(startDate.getUTCMonth()).toBe(2); // March = 2
    expect(startDate.getUTCDate()).toBe(1);
    expect(endDate.getUTCMonth()).toBe(2);
    expect(endDate.getUTCDate()).toBe(31);
  });

  it("year: 365 days ending now", () => {
    const [start, end] = getTimeRange("year", now);
    expect(end).toBe(now);
    expect(end - start).toBe(365 * 86400);
  });
});

describe("chunkTimeRange", () => {
  it("returns a single chunk for ranges <= 5 days", () => {
    const chunks = chunkTimeRange(1000, 1000 + 86400); // 1 day
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual([1000, 1000 + 86400]);
  });

  it("splits a 10-day range into 2 chunks", () => {
    const start = 1000;
    const end = start + 10 * 86400;
    const chunks = chunkTimeRange(start, end);
    expect(chunks).toHaveLength(2);
    expect(chunks[0][0]).toBe(start);
    expect(chunks[0][1]).toBe(start + FIVE_DAYS);
    expect(chunks[1][0]).toBe(start + FIVE_DAYS);
    expect(chunks[1][1]).toBe(end);
  });

  it("splits a 30-day range into 6 chunks", () => {
    const start = 1000;
    const end = start + 30 * 86400;
    const chunks = chunkTimeRange(start, end);
    expect(chunks).toHaveLength(6);
  });

  it("handles partial last chunk", () => {
    const start = 1000;
    const end = start + 7 * 86400; // 7 days = 1 full + 1 partial
    const chunks = chunkTimeRange(start, end);
    expect(chunks).toHaveLength(2);
    expect(chunks[1][1]).toBe(end);
  });

  it("covers the full range with no gaps", () => {
    const start = 1000;
    const end = start + 22 * 86400;
    const chunks = chunkTimeRange(start, end);
    expect(chunks[0][0]).toBe(start);
    expect(chunks[chunks.length - 1][1]).toBe(end);
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i][0]).toBe(chunks[i - 1][1]);
    }
  });
});
