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

test("header tweaks: a shifted row is not taken as lined up; open and silent columns give the open one; T2 is an emission level", () => {
  // hanyang n107: "Engine power" over rated and standby, so the row has one cell more than the titles.
  const hy = { id: "h", country: "CN", specTables: [{ n: 107, title: "Yuchai", header: [
    "| Crew Type | Engine model | Engine power | Number of cylinders | Bore-to-stroke ratio (mm) | Displacement (L) | Fuel consumption (g/kWh) | External dimensions Length × Width × Height (mm) | Weight (kg) | Emission standards",
    "| Rated Power (kW) | Standby Power (kW)"], rows: ["| HY-550 | YC6TD840-D31 | 560 | 616 | 6 | 152*180 | 19.6 | 195 | 3600*1500*2200 | 5300 | T3"] }] };
  const s1 = Object.fromEntries(C.build([hy]).engines[0].uses[0].specs.map((s) => [s.key, s.value]));
  assert.equal(s1.engPower, undefined, "560 or 616: the title is over both");
  assert.deepEqual([s1.cyl, s1.disp, s1.fuel, s1.weight, s1.emission], ["6", "19.6", "195", "5300", "T3"]);
  // gtl n101: open and silent size and weight under one title line each.
  const gtl = { id: "g", country: "CN", specTables: [{ n: 101, title: "Cummins", header: [
    "| Model | 1500 rmp/400v 3P 4W/50HZ/0.8PF | Engine Type | Dimensions(LxWxH)&Weight",
    "| Prime Power | Standby Power | Open Genset | Silent Genset",
    "| KVA | KW | KVA | KW | Dimension(mm) | weight(kg) | Dimension(mm) | weight(kg)"], rows: ["| CCW-1250T5 | 1250 | 1000 | 1375 | 1100 | KTA50-G3 | 5000*2060*2500 | 9400 | 6058*2438*2591 | 15000"] }] };
  const s2 = Object.fromEntries(C.build([gtl]).engines[0].uses[0].specs.map((s) => [s.key, s.value]));
  assert.deepEqual([s2.dims, s2.weight], ["5000*2060*2500", "9400"]);
});

test("a label table listing gensets one after the other is one genset per 'Genset Model' line; 油机 / 动力型号 name the engine", () => {
  const sm = { id: "s", country: "CN", specTables: [{ n: 101, title: "Supermaly", header: [], rows: [
    "| Genset Model：SC700GFK", "| Power：625KVA", "| Model: KTAA19-G6A", "| Power: 762.5KVA", "| Model: HC534FS",
    "| Genset Model：SC85GFK", "| Power：75KVA", "| Model: 4BTA3.9-G11", "| Model: UC224F"] }] };
  const eng = C.fromSupplier(sm).filter((x) => x.kind === "engine").map((x) => [x.genset, x.model, x.other, x.power?.rated?.kVA]);
  assert.deepEqual(eng, [["SC700GFK", "KTAA19-G6A", "HC534FS", 625], ["SC85GFK", "4BTA3.9-G11", "UC224F", 75]]);
  const kp = { id: "k", country: "CN", specTables: [{ n: 101, title: "康明斯", header: [], rows: [
    "| 机组型号 | | KPC1375 | KPC1500", "| 额定功率 | KW/KVA | 1000/1250 | 1100/1375", "| 动力型号 | | KTA50-G3 | KTA50-G8"] }] };
  assert.deepEqual(C.fromSupplier(kp).filter((x) => x.kind === "engine").map((x) => x.model), ["KTA50-G3", "KTA50-G8"]);
});

test("a one-model datasheet whose table gives no engine: the product line's one engine, with the table row of its power", () => {
  const s = { ...rec("genset_oem", [{ n: 2003, title: "Industrial Generator Set - D440 — Generator sets ratings", header: ["Hz  kWe kVA Amps kWe                                            kVA"], rows: ["400/230  50  352 440 635                                       320       400"] }], { en: "Rehlko" }),
    productLines: [{ kind: "genset", series: "D440", fuel: "diesel", power: { min: 400, max: 400, unit: "kVA", rating: "prime", src: [2003] }, engineMakes: ["DOOSAN / HYUNDAI"], engineModels: ["P158LE"], src: [2003] },
      { kind: "genset", series: "Diesel Generators", fuel: "diesel", power: { min: 15, max: 4000, unit: "kW", rating: "unspecified", src: [2003] }, engineModels: [], src: [2003] }] };
  const o = C.fromSupplier(s);
  assert.equal(o.length, 1);
  assert.deepEqual([o[0].kind, o[0].model, o[0].genset, o[0].n, o[0].power], ["engine", "P158LE", "D440", 2003, { prime: { kVA: 400 } }]);
  assert.equal(o[0].line, s.specTables[0].rows[0]);
  assert.deepEqual(o[0].makes.map((m) => m.name), ["Doosan", "Hyundai"]);
  // A table row naming the engine wins: nothing from the product line then.
  const t = { ...s, specTables: [{ n: 2003, title: "D440", rows: ["| Engine ref. | P158LE", "| Prime power (kVA) | 400"] }] };
  assert.equal(C.fromSupplier(t).filter((x) => x.kind === "engine").length, 1);
  assert.ok(!C.fromSupplier(t)[0].fromLine);
});

test("fuel at 75 % and 50 % load: keys of their own; a one-model sheet's two units keep the L/h one; the load named before a figure decides (2026-11-09)", () => {
  const s = rec("genset_oem", [{ n: 101, title: "GF150", header: [], rows: ["Prime Power: 150KVA/120KW", "| Engine Model: | 6BTAA5.9-G12", "| 75%Prime | 199g/KW.h | 35L/h | GB252 | GB/T2820", "| 100%Prime | 205g/KW.h | 45L/h |", "| Fuel consumption 50% (of the Prime Power) | 24 L / h"] },
    { n: 102, title: "GF200", header: [], rows: ["Prime Power: 200KVA/160KW", "| Engine Model: | 6CTAA8.3-G2", "| 燃油消耗 CONSUMPTION (L/h) | 75% 功率 | 75% prime power | 31.2 | 50% 功率 | 50% prime power | 22.1"] }]);
  const [a, b] = C.fromSupplier(s);
  assert.deepEqual(Object.fromEntries(a.specs.map((x) => [x.key, x.value])), { fuel75: "35L/h", fuel: "45L/h", fuel50: "24 L / h" });
  assert.deepEqual(Object.fromEntries(b.specs.map((x) => [x.key, x.value])), { fuel75: "31.2", fuel50: "22.1" });
  // Column titles: "Fuel 75% load" beside the full-load column.
  const t = rec("genset_oem", [{ n: 103, title: "x", header: ["| Model | Prime kVA | Engine | Fuel 75% load | Fuel Consumption", "| | | | L/h | L/h"], rows: ["| X150 | 150 | 6BTAA5.9-G12 | 25 | 33 |"] }]);
  assert.deepEqual(Object.fromEntries(C.fromSupplier(t)[0].specs.map((x) => [x.key, x.value])), { fuel75: "25", fuel: "33" });
});

test("partsIn reads the engine, alternator and controller a won goods row names", () => {
  const p = (t) => C.partsIn(t).map((x) => `${x.kind}:${x.make || "-"}:${x.model}`);
  assert.deepEqual(p("POWERED BY MITSUBISHI - Model: MS825L - Ðộng cơ: Mitsubishi - Model: S6R2-PTAA-C - Thương hiệu Nhât/Sx China - Ðầu phát: Leroy Somer - Model TAL-A49-B - Bộ điều khiển: Deepsea DSE7320 MKII - UK"),
    ["engine:Mitsubishi:S6R2-PTAA-C", "alternator:Leroy-Somer:TAL-A49-B", "controller:Deep Sea:DSE7320 MKII"]);
  assert.deepEqual(p("Động cơ Weichai WP10D264E200, Đầu phát Weichai WHA-250-4/0.4, Điện áp ra 3P-4W- 220/380VAC"), ["engine:Weichai:WP10D264E200", "alternator:-:WHA-250-4/0.4"]);
  // A series word apart from its code, a make after "Nhãn hiệu".
  assert.deepEqual(p("Đầu phát : LEROYSOMER; + Model : TAL A44K + Xuất xứ : China"), ["alternator:Leroy-Somer:TAL A44K"]);
  assert.deepEqual(p("Đầu Phát: • Model: KR274FS • Nhãn hiệu: Kokuro • Xuất xứ: Trung Quốc"), ["alternator:Kokuro:KR274FS"]);
  // "Đầu máy phát" is the alternator, not part of the engine before it.
  assert.deepEqual(p("Động cơ Diesel Perkins 1106A-70TG1 (đồng bộ theo tổ máy) Đầu máy phát điện Mecc Alte ECP34-2M/4"), ["engine:Perkins:1106A-70TG1", "alternator:Mecc Alte:ECP34-2M/4"]);
  // No code: voltages, powers, sizes, I/O counts and pipes are not models.
  assert.deepEqual(p("Đầu phát điện: + Công suất 250ekW + Điện áp: 400V/50HZ/3 pha"), []);
  assert.deepEqual(p("Bộ điều khiển: + Tích hợp 9DI/8DO và 4AI, cài đặt tùy chọn"), []);
  assert.deepEqual(p("động cơ (kW/rpm): 17kW/1.500rpm - Điều chỉnh tốc độ: Điện tử - 12VDC"), []);
  assert.deepEqual(p("Tủ điều khiển bơm dầu - Ống tiếp dầu DN50 dài 10m"), []);
});
