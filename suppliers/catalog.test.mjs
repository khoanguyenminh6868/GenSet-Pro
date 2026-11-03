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

test("other figures: by column title, units from the second header line, only when the row lines up", () => {
  const s = rec("genset_oem", [{ n: 101, title: "Cummins", header: ["| Prime Power | Standby Power | Engine Model | Fuel Consumption | Cylinder | Displacement", "| KVA/KW | KVA/KW | | L/h"], rows: [
    "| AC24 | 20/17 | 24/19 | 4B3.9-G11 | 5.7 | 4L | 3.9 |", "| AC28 | 25/20 | 28/22 | QSB3.9-G31 | 6.1 | 4L | 3.9 | extra |"] }]);
  const [a, b] = C.fromSupplier(s);
  assert.deepEqual(a.specs.map((x) => [x.key, x.label, x.value]), [["fuel", "Fuel Consumption (L/h)", "5.7"], ["cyl", "Cylinder", "4L"], ["disp", "Displacement", "3.9"]]);
  // A cell more than the titles, at the end: laid over the row from the engine's cell (walkedSpecs), it lines up.
  assert.deepEqual(b.specs.map((x) => [x.key, x.value]), [["fuel", "6.1"], ["cyl", "4L"], ["disp", "3.9"]]);
  const bad = rec("genset_oem", [{ n: 102, title: "x", header: ["| Model | kVA | kW | Engine | Governing System"], rows: ["| AB100 | 100 | 80 | 6BTA5.9-G2 | 105×118"] }]);
  assert.deepEqual(C.fromSupplier(bad)[0].specs, []);
});

test("other figures on a single-model page, grouped per model in the catalog", () => {
  const s = rec("genset_oem", [{ n: 101, title: "Volvo 600kw", header: [], rows: ["Prime Power: 600KW/750KVA", "| Engine Model: | TWD1643GE", "| Displacement: | 16.12L", "| Bore and Stroke: | 144*165（mm）", "| Noise(LP1m): 100dB（A）", "| Alternator Efficiencies: | 95％"] }]);
  const cat = C.build([s]);
  const e = cat.engines.find((x) => x.model === "TWD1643GE");
  assert.ok(e, "engine read");
  const by = Object.fromEntries(e.specs.map((g) => [g.key, g.values[0].value]));
  assert.equal(by.disp, "16.12L"); assert.equal(by.bore, "144*165（mm）"); assert.equal(by.noise, "100dB（A）");
  assert.equal(by.eff, undefined, "an engine does not show alternator figures");
});

test("datasheet: a bare Model line belongs to the part whose heading it is under", () => {
  const rows = ["General Performance Data", "| Prime Power | 20KVA/16KW", "| Stand by Power | 22KVA/18KW", "Engine specification", "| Manufacturer | dongfeng Cummins", "| Model | 4B3.9-G11",
    "| Displacement | 3.9L", "| Compression ratio | 18.0:1", "Alternator specification", "| Model | UCI224F", "| Insulation class | H", "| Protection | IP23"];
  const cat = C.build([rec("genset_oem", [{ n: 1001, title: "Datasheet", header: [], rows }])]);
  const e = cat.engines.find((x) => x.model === "4B3.9-G11"), a = cat.alternators.find((x) => x.model === "UCI224F");
  assert.ok(e && a);
  assert.equal(e.make, "Cummins");
  assert.deepEqual(e.uses[0].power, { prime: { kVA: 20, kW: 16 }, standby: { kVA: 22, kW: 18 } });
  assert.equal(C.headingOf("| Brand | Cummins"), undefined);
  const by = Object.fromEntries(a.specs.map((g) => [g.key, g.values[0].value]));
  assert.equal(by.insul, "H"); assert.equal(by.ip, "IP23");
});

test("a header of several lines whose titles span columns: figures laid over the row from its known cells", () => {
  // jet-power n101: "Standby output" and "Prime Output" each over KVA | KW, the engine and alternator titles one line up.
  const jet = { id: "j", country: "CN", specTables: [{ n: 101, title: "50Hz SDEC Diesel Generator", header: [
    "| Model | 400V / 50Hz / 1500RPM | SDEC Diesel Engine | Alternator",
    "| Standby output | Prime Output | Model | Cylinder No. | Bore*Stroke | Displacement | Fuel Cons. | Brushless",
    "| KVA | KW | KVA | KW | (mm) | (L) | g/Kw.H"], rows: ["| SD-275 | 275 | 220 | 250 | 200 | 6DTAA8.9-G23 | 6L | 114×144 | 8.9 | 192 | JET274K"] }] };
  const u = C.build([jet]).engines[0].uses[0];
  assert.deepEqual(Object.fromEntries(u.specs.map((s) => [s.key, s.value])), { cyl: "6L", bore: "114×144", disp: "8.9", fuel: "192" });
  // A title over two cells after the engine ("Engine power" over prime and standby): what follows is not taken.
  const kel = { id: "k", country: "CN", specTables: [{ n: 116, title: "Gensets", header: [
    "| Gensets | Technical Data of Diesel Engine(50hz/1500rpm) | Alternator | Size & Weight",
    "| Model | Gensets power(KW/KVA) | Engine model | Engine power(kw) | Fuel consumption | Cylinder*Bore*Stroke | Displacement(L) | Compr-ession Ratio | Asp. | WANTONG | Rated Voltage(V) | Open Type Size(mm) | Weight(KG) | Silent Type Size(mm) | Weight(KG)"],
    rows: ["| WT-C1400 | 1000 | 1250 | 1100 | 1375 | KTA50-G3 | 1097 | 1207 | 210 | 271.02 | 16×159×159 | 50.3 | 13.9:1 | TC | WT-LV6G | 4950×2100×2320 | 8983 | 40HQ | 11000"] }] };
  const specs = Object.fromEntries((C.build([kel]).engines[0].uses[0].specs || []).map((s) => [s.key, s.value]));
  assert.equal(specs.fuel, undefined);
  assert.equal(specs.disp, undefined);
  // "Engine brand" is not the engine model's column.
  const ule = { id: "u", country: "CN", specTables: [{ n: 104, title: "Cummins 50Hz", header: [
    "| Genset Model | 60HZ | Diesel Engine | Alternator | Overall Size(mm) | Gross Weight(kg)",
    "| Power (kW) | Power (kVA) | Model | Engine brand | Rated Power(kW) | No. of Cylinder | Bore xStroke(mm) | Displacement (L) | Rated Fuel Consumption (L/h) | Model"],
    rows: ["| UC40GF | 32 | 40 | 4BT3.9-G2 | Cummins | 40 | 4 | 102*120 | 3.9 | 9.3 | S0L2-P1 | 1800x700x1200 | 810"] }] };
  const us = Object.fromEntries((C.build([ule]).engines[0].uses[0].specs || []).map((s) => [s.key, s.value]));
  assert.notEqual(us.cyl, "40");
  assert.equal(us.weight, "810");
});
