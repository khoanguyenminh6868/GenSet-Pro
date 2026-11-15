// node --test suppliers/line-power.test.mjs — web/catalog.js linePower: every rating of a one-power product line, read
// from the row of its source table (dòng thật, 2026-11-16: AGG CU1250D5 hiện "1125–1125 kVA", mất ESP 1250).
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const line = (series, engine, min, rating, n) => ({ kind: "genset", series, engineModels: [engine], power: { min, max: min, unit: "kVA", rating, src: [n] }, src: [n] });

test("AGG: a table saved one cell per line gives ESP and PRP", () => {
  const t = { n: 2001, title: "AGG CU1250D5", header: ["Generator Model", "ESP (kVA/kW)", "PRP (kVA/kW)", "Engine Model"], rows: ["AGG CU1250D5", "1250/1000", "1125/900", "KTA38G9"] };
  const s = { id: "agg-power", role: "assembler", specTables: [t] }, p = line("AGG CU1250D5", "KTA38G9", 1125, "prime", 2001);
  assert.deepEqual(C.linePower(s, p), { standby: { kVA: 1250, kW: 1000 }, prime: { kVA: 1125, kW: 900 } });
  // The catalog use of that engine carries both too (Gợi ý cấu hình reads it).
  const u = C.fromSupplier({ ...s, productLines: [p] }).find((x) => x.model === "KTA38G9");
  assert.deepEqual(u.power, { standby: { kVA: 1250, kW: 1000 }, prime: { kVA: 1125, kW: 900 } });
  assert.equal(u.line, "1125/900");
});

test("deman: a row naming the model under Standby / Prime titles", () => {
  const t = { n: 2002, title: "", header: ["Genset Model  Standby Power  Prime Power          Engine Model       No. of     Details"], rows: ["DM41C         41kVA   33kW   38kVA   30kW         QSB3.9-G33         4          Contact  us"] };
  assert.deepEqual(C.linePower({ id: "d", specTables: [t] }, line("DM41C", "QSB3.9-G33", 38, "prime", 2002)), { standby: { kVA: 41, kW: 33 }, prime: { kVA: 38, kW: 30 } });
});

test("no pairing across columns of other models or of engine kWm", () => {
  // denyo: one row of several models' standby kVA, 88 and 110 are two models, not kVA / kW.
  const dn = { n: 2030, title: "", header: ["                                           DCA-60USI              DCA-100USI3                                  DCA-125USI3                     DCA-150USK3"],
    rows: ["(kVA)          Standby               55                     66    88                         110               110               138           138                   165"] };
  assert.equal(C.linePower({ id: "denyo", specTables: [dn] }, line("DCA-125USI3", "BI-4HK1X", 110, "standby", 2030)), null);
  // lister-petter: kWm 12 next to kWe 10 is not a standby pair; the titles name no rating.
  const lp = { n: 2012, title: "", header: ["Series       Model           engine power     engine power", "                             kWm    kWm       kWm             kWm   kWe   kVA      kWe        kVA"],
    rows: ["             LP311EVG1_s515  11          12   10              11.1  8          10  8.8        11"] };
  assert.equal(C.linePower({ id: "lp", specTables: [lp] }, line("LP311EVG1_s515", "LP311EVG1_s515", 10, "prime", 2012)), null);
});

test("a range or a figure the row does not hold gives nothing", () => {
  const t = { n: 1, title: "", header: ["Model | Standby kVA | Standby kW | Prime kVA | Prime kW"], rows: ["| X100 | 110 | 88 | 100 | 80 |"] };
  assert.equal(C.linePower({ specTables: [t] }, { series: "X100", power: { min: 100, max: 500, unit: "kVA", rating: "prime", src: [1] } }), null);
  assert.equal(C.linePower({ specTables: [t] }, line("X100", "X100", 105, "prime", 1)), null);
  // The line says standby 100 but the row puts 100 under prime: not shown.
  assert.equal(C.linePower({ specTables: [t] }, line("X100", "X100", 100, "standby", 1)), null);
  assert.deepEqual(C.linePower({ specTables: [t] }, line("X100", "X100", 100, "unspecified", 1)), { standby: { kVA: 110, kW: 88 }, prime: { kVA: 100, kW: 80 } });
});
