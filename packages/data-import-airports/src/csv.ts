import type { RawSourceRow } from "./types.js";

/**
 * Minimal RFC4180 CSV parser (quoted fields, embedded commas, escaped `""`
 * quotes, CRLF or LF line endings). No external dependency - the OurAirports
 * export is well-formed, so a full grammar/streaming parser isn't needed.
 */
export function parseCsv(text: string): RawSourceRow[] {
  const rows = parseRows(text);
  if (rows.length === 0) return [];

  const header = rows[0]!;
  return rows.slice(1).map((row) => {
    const record: RawSourceRow = {};
    header.forEach((column, index) => {
      const value = row[index];
      record[column] = value === undefined || value === "" ? null : value;
    });
    return record;
  });
}

function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}
