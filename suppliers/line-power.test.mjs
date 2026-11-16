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

// Dòng thật, 2026-11-16: ~280 dòng máy một model ghi mỗi mức trên một dòng nhãn, ~45 dòng Cat dưới tiêu đề "Standby  Prime".
test("one-model datasheet: labelled prime and standby lines", () => {
  // ade-power: "| Standby Power Rating | 330 kVA / 264 kW", "| Prime Power Rating | 300 kVA / 240 kW".
  const ade = { n: 2001, title: "Cummins Power Generation C330D5 330 kVA Generator Specification", header: [], rows: ["| Standby Power Rating | 330 kVA / 264 kW", "| Prime Power Rating | 300 kVA / 240 kW", "| Voltage | 400 V"] };
  assert.deepEqual(C.linePower({ id: "ade", specTables: [ade] }, line("C330D5", "QSL9-G5", 300, "prime", 2001)), { prime: { kVA: 300, kW: 240 }, standby: { kVA: 330, kW: 264 } });
  // coelmo: unit in the label, figure in the next cell; the engine's gross ESP kWm is not the genset's.
  const co = { n: 2001, title: "COELMO PDT256AG2 - 500 kVA (Serie Stazionari, datasheet)", header: ["PDT256AG2 - 500 kVA"],
    rows: ["Potenza PRP (kVA)        500                           Potenza PRP (kW)               400", "Potenza ESP (kVA)        550                           Potenza ESP (kW)               440",
      "Marca Motore             PERKINS                       Potenza Lorda ESP (kWm)        495"] };
  assert.deepEqual(C.linePower({ id: "co", specTables: [co] }, line("PDT256AG2", "2506A-E15TAG2", 500, "prime", 2001)), { prime: { kVA: 500, kW: 400 }, standby: { kVA: 550, kW: 440 } });
  // depco: both ratings on one line, each after its own word.
  const de = { n: 2001, title: "Cummins QSZ13-G3 Ranges 550 kva Diesel Generator", header: ["| Details Generator Set | GenSet Model | DPK-DC-550 | Type | Silent"], rows: ["| Prime output | 400kW/500kVA | Standby output | 440kW/550kVA"] };
  assert.deepEqual(C.linePower({ id: "de", specTables: [de] }, line("DPK-DC-550", "QSZ13-G3", 500, "prime", 2001)), { prime: { kW: 400, kVA: 500 }, standby: { kW: 440, kVA: 550 } });
});

test("labelled lines that do not name one figure per rating give nothing", () => {
  // krauter: one line per rating across 13 models.
  const kr = { n: 2003, title: "Container-Module 300 bis 2.800 kVA", header: ["MODELLE    715C    880C    1000C"], rows: ["Leistung PRP (kVA)  650  800  909", "Leistung ESP (kVA)  715  880  1000"] };
  assert.equal(C.linePower({ id: "kr", specTables: [kr] }, line("715C", "12V2000G25", 715, "standby", 2003)), null);
  // fudiankang title: the rating word after its figure; only that line, the others still read.
  const fdk = { n: 2001, title: "FDK-CC1500/H1", header: ["FDK-CC1500/H1: 1100KW/1375KVA Prime, 1200KW/1500KVA Standby, Three-Phase."], rows: [] };
  assert.equal(C.linePower({ id: "fdk", specTables: [fdk] }, line("FDK-CC1500/H1", "KTA50-G8", 1500, "standby", 2001)), null);
  // plus-power: "Prime/Standby Power@50Hz:" names no single rating.
  const pp = { n: 2012, title: "Cummins 4BTA3.9-G2 50Hz/60kVA", header: [], rows: ["Prime/Standby Power@50Hz:", "60kVA/66kVA"] };
  assert.equal(C.linePower({ id: "pp", specTables: [pp] }, line("PC66", "4BTA3.9-G2", 60, "prime", 2012)), null);
  // A table not naming the line's model is another model's sheet.
  const other = { ...co(), title: "GMS42CS" };
  assert.equal(C.linePower({ id: "o", specTables: [other] }, line("GMS30CS", "4B3.9-G1", 30, "prime", 2001)), null);
  function co() { return { n: 2001, title: "", header: [], rows: ["| PRP | 30 kVA / 24 kW", "| ESP | 33 kVA / 26 kW"] }; }
});

test("Cat: figures under Standby / Prime column titles of a kVA table", () => {
  const t = { n: 2001, title: "Cat diesel generator sets 50 Hz, 6.8 – 250 kVA ratings (three phase, 1500 rpm)",
    header: ["                 kVA                   Generator Set", "            Standby       Prime  Model                       Engine  Configuration"],
    rows: ["   9.5           8.5    DE9.5E3                     C1.1    R96/EU Stage IIIA Equivalent"] };
  const s = { id: "caterpillar", role: "assembler", specTables: [t] }, p = line("DE9.5E3", "C1.1", 8.5, "prime", 2001);
  assert.deepEqual(C.linePower(s, p), { prime: { kVA: 8.5 }, standby: { kVA: 9.5 } });
  // deman: standby in kVA, prime in kW — no two figures in the line's unit.
  const dm = { n: 2033, title: "", header: ["Genset Model  Standby Power  Prime Power  Engine Model  No. of  Details"], rows: ["DM250C  250kVA  200kW  /  /  6CTAA8.3-G9  6  Contact  us"] };
  assert.equal(C.linePower({ id: "dm", specTables: [dm] }, line("DM250C", "6CTAA8.3-G9", 250, "standby", 2033)), null);
});
