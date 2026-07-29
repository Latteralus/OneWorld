import { describe, expect, it } from "vitest";
import { parseCsv } from "../csv.js";

describe("parseCsv", () => {
  it("parses a simple header + rows into objects", () => {
    const rows = parseCsv("ident,name,type\nKBOI,Boise Air Terminal,medium_airport\n");
    expect(rows).toEqual([{ ident: "KBOI", name: "Boise Air Terminal", type: "medium_airport" }]);
  });

  it("handles quoted fields containing commas", () => {
    const rows = parseCsv('ident,name\nKBOI,"Boise, Air Terminal"\n');
    expect(rows[0]?.name).toBe("Boise, Air Terminal");
  });

  it("handles escaped double quotes inside quoted fields", () => {
    const rows = parseCsv('ident,name\nKBOI,"Boise ""Air"" Terminal"\n');
    expect(rows[0]?.name).toBe('Boise "Air" Terminal');
  });

  it("treats empty fields as null", () => {
    const rows = parseCsv("ident,icao_code\nKBOI,\n");
    expect(rows[0]?.icao_code).toBeNull();
  });

  it("handles CRLF line endings", () => {
    const rows = parseCsv("ident,name\r\nKBOI,Boise\r\nKMYL,McCall\r\n");
    expect(rows).toHaveLength(2);
    expect(rows[1]?.ident).toBe("KMYL");
  });

  it("returns an empty array for header-only input", () => {
    expect(parseCsv("ident,name\n")).toEqual([]);
  });
});
