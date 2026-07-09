import type { ExportTable } from "./aggregate";

function escapeCsv(field: string): string {
  return /[",\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field;
}

export function toCsv(table: ExportTable): string {
  const header = table.columns.map((c) => escapeCsv(c.header)).join(",");
  const lines = table.rows.map((row) =>
    table.columns
      .map((c) => {
        const value = row[c.key];
        return value == null ? "" : escapeCsv(String(value));
      })
      .join(",")
  );
  return [header, ...lines].join("\n");
}

export function toJson(table: ExportTable): string {
  return JSON.stringify(table.rows, null, 2);
}
