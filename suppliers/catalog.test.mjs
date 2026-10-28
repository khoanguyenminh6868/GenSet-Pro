// node --test suppliers/*.test.mjs  — checks for the engine / alternator catalog the web builds (web/catalog.js).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const rec = (role, tables, names = { en: "Test Power" }) => ({ id: "t", role, status: "verified", names, specTables: tables });

test("model codes: engines and alternators yes, sizes, units and layouts no", () => {
  for (const c of ["4B3.9-G2", "2506C-E15TAG1", "WP13D385E200", "6M21G4D3/5", "HCI544C", "LSA50.2 M6", "BFM3 G1"]) assert.ok(C.isCode(c), c);
  for (const c of ["OP1700*750*1100", "150×185", "1500rpm", "50Hz", "4L/NA", "L4", "Stage IIIA", "IP23", "N/A", "DSE6120", "13.5L", "3 phase"]) assert.ok(!C.isCode(c), c);
});

test("genset row: engine, alternator, make from the column title, standby and prime pairs", () => {
  const s = rec("genset_oem", [{ n: 101, title: "Diesel generators", header: ["| Genset Model | Standby Power | Prime Power | Engine Model | Alternator Model", "| kW/kVa | kW/kVa | Perkins | Stamford"], rows: ["| SQP500 | 400/500 | 360/450 | 2506C-E15TAG1 | HCI544C | USA | 3400"] }]);
  const o = C.fromSupplier(s);
  const e = o.find((x) => x.kind === "engine"), a = o.find((x) => x.kind === "alternator");
  assert.equal(e.model, "2506C-E15TAG1");
  assert.equal(a.model, "HCI544C");
  assert.deepEqual(e.makes.map((m) => [m.name, m.via]), [["Perkins", "tiêu đề cột"]]);
  assert.deepEqual(a.makes.map((m) => m.name), ["Stamford"]);
  assert.deepEqual(e.power, { standby: { kVA: 500, kW: 400 }, prime: { kVA: 450, kW: 360 } });
  assert.equal(e.genset, "SQP500");
});

test("no make unless a source states it", () => {
  const s = rec("genset_oem", [{ n: 101, title: "Generator set", header: ["| Model | kVA | kW | Engine"], rows: ["| AB100 | 100 | 80 | 6BTA5.9-G2"] }]);
  const [e] = C.fromSupplier(s);
  assert.equal(e.model, "6BTA5.9-G2");
  assert.deepEqual(e.makes, []);
  assert.deepEqual(e.power, { rated: { kVA: 100, kW: 80 } });
});

test("single-model page: first value wins, related models further down ignored", () => {
  const s = rec("genset_oem", [{ n: 101, title: "30kVA", header: [], rows: ["Model: EPS30CUA-3S | 30kVA | 3-Phase | 50Hz/60Hz", "| Power (kVA) | 30", "| Engine Model | 4B3.9-G1", "Power(kVA): 13", "Power(kVA): 55"] }]);
  const [e] = C.fromSupplier(s);
  assert.equal(e.model, "4B3.9-G1");
  assert.equal(e.power.rated.kVA, 30);
});

test("needs from an analysis and top 3 by the closest power at or above it", () => {
  const need = C.needsOf([{ item: "Công suất liên tục (PRP)", text: "≥ 500 kVA, 50Hz" }, { item: "Động cơ", text: "Động cơ Cummins hoặc tương đương" }, { item: "Đầu phát", text: "Stamford" }]);
  assert.equal(need.kVA, 500); assert.equal(need.rating, "prime"); assert.equal(need.freq, 50);
  assert.deepEqual(need.engineBrands, ["Cummins"]); assert.deepEqual(need.altBrands, ["Stamford"]);
  const s = rec("genset_oem", [{ n: 101, title: "Cummins gensets", header: ["| Model | Standby kVA | kW | Prime kVA | kW | Cummins engine | Alternator"], rows: [
    "| A1 | 550 | 440 | 500 | 400 | KTA19-G3 | HCI544C", "| A2 | 688 | 550 | 625 | 500 | KTAA19-G6A | HCI544E", "| A3 | 440 | 352 | 400 | 320 | NTA855-G4 | HCI444F"] }]);
  const cat = C.build([s]);
  const top = C.suggest(cat, need, "engine").map((x) => x.entry.model);
  assert.deepEqual(top, ["KTA19-G3", "KTAA19-G6A"]);
});

test("the real records build a catalog", () => {
  const recs = fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8")));
  const cat = C.build(recs);
  assert.ok(cat.engines.length > 500, `${cat.engines.length} engines`);
  assert.ok(cat.alternators.length > 100, `${cat.alternators.length} alternators`);
  for (const e of [...cat.engines, ...cat.alternators]) for (const u of e.uses) assert.ok(u.supplierId && u.n, e.model);
});
