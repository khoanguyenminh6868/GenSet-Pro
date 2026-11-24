// node --test suppliers/*.test.mjs — a document's lines are not cut at a fixed count (Khoa 24/11/2026):
// sheetOf (crawl-datasheets.mjs, was 250) and the one-model spec sheet of tablesOf (crawl-specs.mjs, was 60).
import test from "node:test";
import assert from "node:assert/strict";
import { sheetOf } from "./crawl-datasheets.mjs";
import { tablesOf } from "./crawl-specs.mjs";

test("sheetOf keeps every spec line of a sheet longer than 250 lines", () => {
  const body = Array.from({ length: 300 }, (_, i) => `| Power item ${i} | ${i + 1} kW`);
  const rows = sheetOf(["Engine specification", "| Model | 4B3.9-G11", ...body].join("\n"));
  assert.ok(rows.length >= 302, `còn ${rows.length} dòng`);
  assert.ok(rows.includes(body[299]));
});

test("tablesOf keeps every line of a one-model spec sheet longer than 60 lines", () => {
  const body = Array.from({ length: 80 }, (_, i) => `Engine item ${i}: ${i + 1} units`);
  const [sheet] = tablesOf(["Prime power: 100 kVA", "Standby power: 110 kVA", ...body].join("\n")).filter((t) => t.sheet);
  assert.equal(sheet.rows.length, 82);
  assert.equal(sheet.rows.at(-1), body[79]);
});
