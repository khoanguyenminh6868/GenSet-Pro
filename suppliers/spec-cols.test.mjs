// node --test suppliers/spec-cols.test.mjs — datasheets with the models in columns (one column per model): an engine maker's
// "Model" row names its engines, rows with a text value repeated per model stay one row, a row not matching the models is not used.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pdfText } from "./crawl-datasheets.mjs";
import { tablesOf } from "./crawl-specs.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(pathToFileURL(path.join(ROOT, "web", "catalog.js")).href);
const CAT = globalThis.GenbidCatalog;

const SHEET = `Engine data sheet
Model                      1106A-70TAG1      1106A-70TAG2      1106A-70TAG3
Engine brand               Perkins           Perkins           Perkins
Prime power kWm            140               156               176
Aspiration                 Turbocharged      Turbocharged      Turbocharged
Displacement l             7.01              7.01              7.01
Number of cylinders        6                 6`;
const read = (role, text) => {
  const t = tablesOf(pdfText(text));
  return CAT.fromSupplier({ id: "x", role, names: { en: "X", brands: [] }, specTables: t.map((x) => ({ n: 1001, title: "", header: x.header, rows: x.rows })) });
};

test("pdfText: the same text repeated per model stays in one row", () => {
  assert.match(pdfText(SHEET), /^\| Engine brand \| Perkins \| Perkins \| Perkins$/m);
});
test("engine maker's column datasheet: one engine per model column", () => {
  const e = read("engine_maker", SHEET).filter((o) => o.kind === "engine").map((o) => o.model);
  assert.deepEqual(e, ["1106A-70TAG1", "1106A-70TAG2", "1106A-70TAG3"]);
});
test("a row with fewer values than models (merged cells) gives no figure to any column", () => {
  const occ = read("engine_maker", SHEET).filter((o) => o.kind === "engine");
  assert.ok(occ.every((o) => !(o.specs || []).some((s) => s.key === "cyl")));
  assert.ok(occ.every((o) => (o.specs || []).some((s) => s.key === "disp" && s.value === "7.01")));
});
test("a maker that also names the engine in a row keeps its Model row as the genset", () => {
  const t = `Model              C165D5      C200D5\nEngine model       6CTAA8.3-G2  6CTAA8.3-G3\nPrime power kVA   165         200`;
  const occ = read("engine_maker", t).filter((o) => o.kind === "engine");
  assert.deepEqual(occ.map((o) => [o.model, o.genset]), [["6CTAA8.3-G2", "C165D5"], ["6CTAA8.3-G3", "C200D5"]]);
});
