import { toCsv, toJson } from "./serialize";
import type { ExportTable } from "./aggregate";

const table: ExportTable = {
  columns: [
    { key: "date", header: "date" },
    { key: "rain", header: "Rain (mm)" },
  ],
  rows: [
    { date: "2026-01-01", rain: 0.3 },
    { date: "2026-01-02", rain: null },
  ],
};

describe("serialize", () => {
  it("renders CSV with header and rows, null as empty cell", () => {
    expect(toCsv(table)).toBe("date,Rain (mm)\n2026-01-01,0.3\n2026-01-02,");
  });

  it("escapes fields containing commas or quotes per RFC 4180", () => {
    const t: ExportTable = {
      columns: [{ key: "date", header: "date" }, { key: "note", header: "Note, and \"q\"" }],
      rows: [{ date: "2026-01-01", note: "a,b" }],
    };
    expect(toCsv(t)).toBe('date,"Note, and ""q"""\n2026-01-01,"a,b"');
  });

  it("renders JSON as the rows array", () => {
    expect(JSON.parse(toJson(table))).toEqual(table.rows);
  });
});
