// node --test suppliers/spec-read.test.mjs — reading supplier tables (web/catalog.js SPECS, keyOf, model of a row).
// Each case is a label / value / line found in suppliers/cn (chuan-hoa-1, 2026-11-14).
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(pathToFileURL(path.join(ROOT, "web", "catalog.js")).href);
const CAT = globalThis.GenbidCatalog;
const fits = (label, value) => { const k = CAT.specKey(label); return k && CAT.SPEC[k].ok.test(value) ? k : null; };

test("oil: lube oil CONSUMPTION (g/kWh) is not the oil capacity", () => {
  for (const l of ["机油消耗率（g/kw.h）", "lube oil consumption at full", "lub. oil consumption rate,kw.h", "机油 耗率g/kw·h", "机油消耗率 Oil Consumption", "最大机油消耗量"])
    assert.notEqual(CAT.specKey(l), "oil", l);
  assert.equal(CAT.specKey("Oil system (L)"), "oil");
  assert.equal(CAT.specKey("润滑油 容量(L)"), "oil"); // 126 header cells, 223 rows (longkai-power)
});
test("eff: a gas genset's electrical / thermal / overall efficiency is not the alternator efficiency", () => {
  for (const l of ["electrical efficiency（η）", "electrical efficiency3) %", "thermal efficiency", "overall efficiency", "total efficiency"])
    assert.notEqual(CAT.specKey(l), "eff", l);
  assert.equal(CAT.specKey("Efficiency"), "eff");
  assert.equal(CAT.specKey("效率"), "eff");
});
test("speed: the torque column (peak torque, 最大扭矩) is not the speed", () => {
  for (const l of ["peak torque nm- rpm", "最大扭矩 N·m/r/min", "最大扭矩/转速（N.M/r/min）"]) assert.notEqual(CAT.specKey(l), "speed", l);
  assert.equal(CAT.specKey("Speed (rpm)"), "speed");
  assert.equal(CAT.specKey("转速"), "speed");
});
test("pf: 'cos' inside a word (técnicos) is not the power factor", () => {
  assert.notEqual(CAT.specKey("Electra Molins EMB-300 – datos técnicos (BAUDOUIN 6M16G300/5, LEROY SOMER TAL.046.ECC)"), "pf");
  for (const l of ["cos φ", "Cosφ", "COS PHI", "Rated cos"]) assert.equal(CAT.specKey(l), "pf", l);
});
test("cooling: a shifted column's text (ATS screen, control module, power, temperature) is not a cooling value", () => {
  for (const v of ["ATS auto load transfer screen", 'Control module with" three remote', "Prime power", "ambient temp", "Noise level dBA@7m", "temperature"])
    assert.equal(fits("Cooling System", v), null, v);
  for (const v of ["Water cooled", "Liquid (water + 50% glycol)", "radiator", "水冷 water cooled", "wassergekühlt", "Air-to-air", "air-water", "forced water cooling cycle"])
    assert.equal(fits("Cooling System", v), "cooling", v);
});
test("keywords: 吸气方式 → asp, 燃油率 → fuel, 润滑油 容量 → oil", () => {
  assert.equal(CAT.specKey("吸气方式"), "asp");
  assert.equal(CAT.specKey("吸气方式: Aspiration"), "asp");
  assert.equal(CAT.specKey("燃油率"), "fuel");
  assert.equal(fits("燃油率", "205"), "fuel");
});

test("pf: Power factor / 功率因数 labels (the word 'power' no longer drops them)", () => {
  for (const l of ["Power Factor", "功率因数", "额定功率因数", "Rated Power Factor(cosφ)", "功率因数 Power Factor", "Power factor (Cos Phi)"])
    assert.equal(fits(l, "0.8"), "pf", l);
  assert.equal(CAT.specKey("Rated power"), null);
  assert.equal(CAT.specKey("Prime Power (kW)"), null);
});
test("cooling: engine cooling only — aftercooling, charge air, piston and air/air cooling are other systems", () => {
  for (const l of ["Aftercooling", "Charge Air Cooling", "Piston Cooling", "Air/Air cooling", "Air/Water cooling", "Aftercooling Method"])
    assert.equal(CAT.specKey(l), "aircool", l);
  for (const l of ["Cooling System", "Cooling method", "冷却方式 Cooling system"]) assert.equal(CAT.specKey(l), "cooling", l);
});
test("fuel: a percentage is not a fuel figure (lees-power 'Gas Consumption' column sits over the efficiency column: '33%')", () => {
  assert.equal(fits("Gas Consumption", "33%"), null);
  assert.equal(fits("Gas Consumption", "12.2"), "fuel");
  assert.equal(fits("Fuel consumption", "35L/h"), "fuel");
});

// chuan-hoa-1c (2026-11-14): reading errors left over from chuan-hoa-1 / 1b. Lines are from suppliers/cn.
const rec = (specTables, extra = {}) => ({ id: "x", country: "CN", role: "genset_oem", status: "partial", names: { en: "X", brands: [] }, productLines: [], sources: [], specTables, ...extra });
const specsOf = (r, re) => CAT.fromSupplier(r).filter((o) => re.test(o.line || "")).map((o) => o.specs.map((s) => `${s.key}=${s.value}`));
test("lees-power: the header has no title over the engine column, so no figure is laid under a title one column to the left", () => {
  // lees-power source 134 / 135: "Electrical Power KW" sits over the engine model, "Gas Consumption" over the efficiency (33%, 0.33).
  const hdr = ["| Model | Electrical Power KW | Electrical Efficiency | Gas Consumption | Open Type | Soundproof Type | Specifications", "| LEES | CUMMINS | n % | Nm3/h | Dimensions L×W×H (mm) | Weight (kg) | Dimensions L×W×H (mm) | Weight (kg)"];
  const r = rec([
    { n: 134, title: "t", header: hdr, rows: ["| LSC30NGE3 | QSB3.9-G35 | 30 | 33% | 12.2 | 1950×900×1250 | 925 | 2450×1006×1257 | 1350 | PDF"] },
    { n: 135, title: "t", header: ["| Model | Electrical Power KW | Electrical Efficiency (n %) | Gas Consumption | Open Type | Soundproof Type | Specifications", "| LEES | Kubota | Nm3/h | Dimensions L×W×H (mm) | Weight (kg) | Dimensions L×W×H (mm) | Weight (kg)"], rows: ["| LSK13NGE3 | WG1605N | 13 | 0.33 | 19.5 | 2100×950×1310 | 1125 | 2560×1100×1650 | 1480 | PDF"] },
  ]);
  for (const s of [...specsOf(r, /LSC30NGE3/), ...specsOf(r, /LSK13NGE3/)]) assert.ok(!s.some((x) => x.startsWith("fuel=")), s.join());
  assert.equal(CAT.fromSupplier(r).filter((o) => o.kind === "engine").length, 2);
});
test("model: a make before the model is dropped on the line read from a product line too (genesal-energy 'VOLVO TAD1642GE')", () => {
  const r = rec([{ n: 2007, title: "t", header: [], rows: ["33.0kVA / 26.4kW - Perkins 1103A-33G water cooled diesel engine close coupled to Mecc Alte brushless maintenance free alternator"] }],
    { productLines: [{ kind: "genset", series: "Perkins 1103A-33G", engineModels: ["Perkins 1103A-33G"], power: { min: 26.4, max: 26.4, unit: "kW", rating: "standby" }, src: [2007] }] });
  assert.deepEqual(CAT.fromSupplier(r).filter((o) => o.kind === "engine").map((o) => o.model), ["1103A-33G"]);
});
test("horizontal table: a make of two words before the code ('Volvo Penta TAD734GE') still names an engine row", () => {
  const r = rec([{ n: 1, title: "t", header: ["| Genset model | Prime kW | Engine model |"], rows: ["| AV250 | 200 | Volvo Penta TAD734GE |", "| CGM | 120 | Hyundai Infracore DM03VP |", "| X1 | 60 | Perkins 1103A-33G |"] }]);
  assert.deepEqual(CAT.fromSupplier(r).filter((o) => o.kind === "engine").map((o) => o.model), ["TAD734GE", "DM03VP", "1103A-33G"]);
  // a series word is not part of the make: no guess
  assert.equal(CAT.fromSupplier(rec([{ n: 1, title: "t", header: ["| Genset model | Prime kW | Engine model |"], rows: ["| v200F | 160 | FPT NEF N67 TEVP05.00 |"] }])).filter((o) => o.kind === "engine").length, 0);
});
test("runtime: 'Running time @ 75% PRP' and 'Fuel Tank running hours' are hours, not the 75% fuel consumption or the tank", () => {
  assert.equal(CAT.specKey("Running time @ 75% PRP"), "runtime"); // endress-stromerzeuger 1008: "| Running time @ 75% PRP | 5"
  assert.equal(CAT.specKey("Fuel Tank running hours:"), "runtime"); // acepow-fuan 112: "8/10/12H"
  assert.equal(CAT.specKey("Fuel tank Vol.(L):"), "tank");
  assert.equal(CAT.specKey("10 Hours Fuel Tank Capacity"), "tank"); // gb-power 1036: "120L" is a capacity
  assert.equal(CAT.specKey("Fuel Consumption 75% load"), "fuel75");
});
test("speed / voltage: a rating-condition title ('1500 rpm, 400V/50Hz/3P, 0.8PF') and 'Fre/Volt HZ/V 频率 /电压' are not speed / voltage", () => {
  for (const l of ["1500 rpm, 400V/50Hz/3P, 0.8PF", "1800 rpm, 380V/60Hz/3P, 0.8PF"]) assert.notEqual(CAT.specKey(l), "speed", l); // gtl-power 109 / 126: the values below are powers
  for (const l of ["Fre/Volt HZ/V 频率 /电压", "Frequency/Voltage"]) assert.notEqual(CAT.specKey(l), "voltage", l); // kangwo-guangdong 108: "| CCFJ30JW | 30 | 37.5 | 50/400 | ..."
  assert.equal(CAT.specKey("Speed (rpm)"), "speed");
  assert.equal(CAT.specKey("Rated voltage (V)"), "voltage");
});
test("dims: the engine's own size ('Engine Size(mm)') is not the genset's", () => {
  assert.equal(CAT.specKey("Engine Size(mm)"), null); // acepow-fuan 112: "770x520x680"
  assert.equal(CAT.specKey("Size"), "dims");
  assert.equal(CAT.specKey("Dimension(MM)L*W*H"), "dims");
});
test("fuel is the 100% load figure: a label naming another load (25%, 70%, 110%, 1/4) is not `fuel`", () => {
  // lees-power 1122…: "Fuel Consumption 25% load" next to 50% / 75%; lees-power "25%负载油耗"; "Cons. 70%"; "Fuel Consumption 110%";
  // hyundai-power-products "Fuel consumption @25/50/75/100% load" (one cell lists four levels)
  for (const l of ["Fuel Consumption 25% load", "25%负载油耗", "Cons. 70%", "Fuel Consumption 110%", "Fuel consumption @25/50/75/100% load", "Fuel consumption 1/4 load", "Fuel Consumption 80% load"])
    assert.notEqual(CAT.specKey(l), "fuel", l);
  for (const l of ["Fuel Cons. (100% Load)", "Cons 100% ( L/H )", "Fuel consumption @100% Load（L/h）", "100% 负载 燃油耗 （L/h）", "Full-Load Diesel Consumption (L/H)", "Fuel consumption (g/kW.h)", "Consumption", "燃油消耗率", "Fuel Consumption 100% Load", "Fuel Consumption Standby", "Min.specific fuel consumption at full load (g/kW.h)"])
    assert.equal(CAT.specKey(l), "fuel", l);
  assert.equal(CAT.specKey("Fuel Consumption 75% load"), "fuel75");
  assert.equal(CAT.specKey("Fuel Consumption 50% load"), "fuel50");
});
test("keyOf: a trailing * (footnote) is dropped; O/0 and I/1 stay apart", () => {
  assert.equal(CAT.keyOf("QSK19-G4*"), CAT.keyOf("QSK19-G4"));
  assert.equal(CAT.keyOf("QSK19-G4**"), "QSK19G4");
  assert.equal(CAT.keyOf("*Q"), "*Q");
  assert.notEqual(CAT.keyOf("6BTAA5.9-G2"), CAT.keyOf("6BTAA5.9-G2*0"));
  assert.notEqual(CAT.keyOf("1103A-33G"), CAT.keyOf("II03A-33G"));
  assert.notEqual(CAT.keyOf("6CTAA8.3-G2"), CAT.keyOf("6CTAA8.3-GZ"));
  assert.notEqual(CAT.keyOf("S4L2O"), CAT.keyOf("S4L20"));
});
test("horizontal table: a make before the engine model and a * after it are not part of the model", () => {
  const rec = { id: "x", country: "CN", role: "genset_oem", status: "partial", names: { en: "X", brands: [] }, productLines: [], sources: [],
    specTables: [{ n: 1, title: "Genset", header: ["| Genset model | Prime kW | Engine model |"], rows: ["| G100 | 80 | PERKINS 1103A-33G |", "| G200 | 160 | QSK19-G4* |"] }] };
  const e = CAT.fromSupplier(rec).filter((o) => o.kind === "engine").map((o) => o.model);
  assert.deepEqual(e, ["1103A-33G", "QSK19-G4"]);
});

test("isCode: cells that are a value, not a model (Khoa 2026-11-17)", () => {
  for (const v of ["≤6S", "≤5S", "6-cylinder/inline", "12-cylinder/V-type", "4-Cylinder Series", "1-PHASE", "3-PHASE", "Self-excited,2-pole,single phase",
    "100% copper", "800(kW)", "330(KW)", "195(g/kw.h)", "208g /kwh", "300 W", "330+250 W", "250W", "1800k W", "Container 20'", "40GP container",
    "0,11 m3/s", "speed [1/min]", "50Hz/ 400V", "400V/230V", "700 cSt/50°C", "~14.5 gal/hr", "12 kg/h", "4 In-line", "Loading Qty(20GP/40HQ)"])
    assert.equal(CAT.isCode(v), false, v);
  // real models, some with a note or unit-like tail, stay
  for (const v of ["4045HFG20 (103kW)", "S4L1D-G4(360KW)", "UCI274C(80KW)", "6BT5.9-G2(G75E1)", "4BTA3.9-G2 (QC50/60E)", "LTP224S-52", "BW-274E", "TAD734GE", "12V4000G14F(3B)", "S16R-PTAA2-C /1684KW", "4DW91-29D /21KW", "6135HF475(C)"])
    assert.equal(CAT.isCode(v), true, v);
});
test("table row: a note after the engine code, or an empty engine cell, does not turn the alternator into the engine", () => {
  const rec = (header, rows) => ({ id: "x", country: "CN", role: "genset_oem", status: "partial", names: { en: "X", brands: [] }, productLines: [], sources: [], specTables: [{ n: 1, title: "Cummins Diesel Generator", header, rows }] });
  const of = (r, kind) => CAT.fromSupplier(r).filter((o) => o.kind === kind).map((o) => o.model);
  // bobig-power: "1104C-44TAG2 made in china" has three spaces (fails isCode); the alternator BW-274E must not take its place
  const b = rec(["| Gensets | Technical Data of Diesel Engine | Alternator | Size", "| Model | Gensets power(KW/KVA) | Engine model | Engine power/kw | BOBIG | Open type (MM) |"],
    ["| BP110 | 80 | 100 | 88 | 110 | 1104C-44TAG2 made in china | 81 | BW-274E | 1920*750*1250 | 2550*970*1280"]);
  assert.deepEqual(of(b, "engine"), ["1104C-44TAG2"]);
  assert.deepEqual(of(b, "alternator"), ["BW-274E"]);
  // landtop-fuzhou: governor column ("Mechanical") instead of an engine code, then the alternator LTP224S-50
  const l = rec(["| Genset Model | Genset Standby Power | Genset Prime Power | Governor Type | Engine Model | Alternator Model", "| KVA | KW | KVA | KW"],
    ["| LTP69KF | 69 | 55 | 63 | 50 | Mechanical | LTP224S-50"]);
  assert.deepEqual(of(l, "engine"), []);
  assert.deepEqual(of(l, "alternator"), ["LTP224S-50"]);
});

test("walkedSpecs: a power title over two cells (kVA | kW) does not shift the titles after it (rà soát lệch cột 18/11/2026)", () => {
  const rec = (header, rows) => ({ id: "x", country: "CN", role: "genset_oem", status: "partial", names: { en: "X", brands: [] }, productLines: [], sources: [], specTables: [{ n: 1, title: "柴油发电机组", header, rows }] });
  const sp = (r) => CAT.fromSupplier(r).map((o) => Object.fromEntries((o.specs || []).map((s) => [s.key, s.value])));
  const H = ["| 机组型号 Genset Model | 主用功率（主用） | 备用功率（备用） | 电流（主用）Power(A) | 电流（备用）Power(A) | 净重 Net Weight (kg) | 外形尺寸 Overall Dimensions L*W*H(m) | 品牌 Brand | 发 动 机型号 Engine Type", "| KW | KVA | KW | KVA"];
  // yingtai-group n2002: the weight was read as 36 (the prime current) on a 710 kg set
  const [a] = sp(rec(H, ["| 20GF | 20 | 25 | 22 | 27.5 | 36 | 39.6 | 710 | 1.7*0.9*1.4 | 4B3.9-G2"]));
  assert.equal(a.weight, "710");
  assert.equal(a.dims, "1.7*0.9*1.4");
  // one pair is no kVA / kW of one rating (330 | 375 | 380 | 475): the walk from the left is still a cell off and
  // gives nothing; the weight is the one read back from the engine's cell, never a current (594, 675)
  for (const [row, kg] of [["| 330GF | 330 | 375 | 380 | 475 | 594 | 675 | 2850 | 3.3*1.15*2.15 | QSZ13-G7", "2850"], ["| 64GF | 64 | 75 | 88 | 88 | 115.2 | 126.7 | 1180 | 1.9*0.9*1.4 | WP4.1D80E200", "1180"]])
    assert.ok([kg, undefined].includes(sp(rec(H, [row]))[0]?.weight), row);
  // xinzhengfa n101: "输出功率" over KVA | KW, the kW was read as the current
  const [x] = sp(rec(["| 机组型号 | 输出功率 | 额定 电流A | 频率/转速 Hz/RPM | 柴油机型号 | 机组外型尺寸(L × B × H)mm | 机组重量Kg", "| KVA | KW"], ["| ZF24GF | 30 | 24 | 33.2 | 50/1500 | K4100D | 1800 × 750 × 1100 | 810"]));
  // chat-luong-3 (WCHK): 33.2 A fits neither 30 kVA nor 24 kW at a 400 V set (43 A), so the read by position is left
  // out; never the kW (24) as before.
  assert.ok(["33.2", undefined].includes(x.current), x.current);
  assert.equal(x.weight, "810");
  // yingtai-jiangsu n114: a row with the speed cell left out, 1200 is the speed from the left and the weight from the right: neither
  const [g] = sp(rec(["| 机组型号 Genset Model | 输出功率（主用） | 备用功率（备用） | 电流Power(A) | 额定转速 | 净重 Net Weight (kg) | 外形尺寸 Overall Dimensions L*W*H(m) | 发动 机型号 Engine Type | 缸数 Number of", "| KW | KVA | KW | KVA"], ["| 64GF-A | 64 | 80 | 75 | 83 | 115.2 | 1200 | 2.35*1.0*1.5 | YC6G180N-D30 | 4"]));
  assert.equal(g.speed, undefined);
  assert.equal(g.weight, undefined);
});

test("label sheet with no part headings (himoinsa, hipower): the Model beside the engine lines is the engine, Starting power is not the output (rà soát 18/11/2026)", () => {
  const rec = (rows) => ({ id: "x", country: "CN", role: "genset_oem", status: "partial", names: { en: "X", brands: [] }, productLines: [], sources: [], specTables: [{ n: 1, title: "16.3 kVA Generator set Diesel HYW-20 M5 Soundproof", header: [], rows }] });
  const out = CAT.fromSupplier(rec(["Rated Engine Output: 16,4kW prp ; 18kW standby", "Model: 4TNV88BGGEH", "Engine Type: 4-stroke diesel", "Bore and Stroke: 88 x 90 mm", "Displacement: 2,19 L", "Fuel Consumption 100% PRP: 4,27 l/h", "Model: S1L2.J1", "Cooling Air Flow: 0,8 m3/s", "Starting power: 1,4 kW", "Starting power: 1,9 CV", "Fuel Tank: 100 L", "Weight with liquids in radiator and sump: 818 kg"]));
  assert.deepEqual(out.map((o) => [o.kind, o.model, o.genset, o.power]), [["engine", "4TNV88BGGEH", null, null], ["alternator", "S1L2.J1", null, null]]);
  // an engine named with its cycle keeps its model (hosem-power)
  const h = CAT.fromSupplier({ ...rec(["| Engine Model | Yanmar 4TNV88-GLE 4 Cycle", "| Prime Power | 20kVA 16kW"]), specTables: [{ n: 1, title: "20kVA Yanmar generator", header: [], rows: ["| Engine Model | Yanmar 4TNV88-GLE 4 Cycle", "| Alternator Model | S0L2-P1", "| Prime Power | 20kVA"] }] });
  assert.ok(h.some((o) => o.other === "Yanmar 4TNV88-GLE 4 Cycle" || /4TNV88-GLE/.test(o.model)));
});
test("label sheet: the kVA of the genset and the kW of its engine, on two lines, are not one output (longkai, rà soát 18/11/2026)", () => {
  const rec = (rows) => ({ id: "x", country: "CN", role: "genset_oem", status: "partial", names: { en: "X", brands: [] }, productLines: [], sources: [], specTables: [{ n: 1, title: "Datasheet", header: [], rows }] });
  const pw = (rows) => CAT.fromSupplier(rec(rows))[0]?.power;
  assert.deepEqual(pw(["| Model | LG250SC", "| Rated prime power | kva | 312.5", "| Engine Model | SC12E420D2", "| Prime power | KW | 280"]).prime, { kVA: 312.5 });
  assert.deepEqual(pw(["| Model | LG250SC", "| Rated prime power | kva | 312.5", "| Engine Model | SC12E420D2", "| Prime power | KW | 250"]).prime, { kW: 250, kVA: 312.5 });
});

test("engine and alternator are not swapped (acepow, cldj-fujian, longkai, tecnogen; rà soát 18/11/2026)", () => {
  const rec = (header, rows, title = "Diesel Generator") => ({ id: "x", country: "CN", role: "genset_oem", status: "partial", names: { en: "X", brands: [] }, productLines: [], sources: [], specTables: [{ n: 1, title, header, rows }] });
  const of = (r, kind) => CAT.fromSupplier(r).filter((o) => o.kind === kind).map((o) => o.model);
  // acepow-fuan n109: its own alternator BC184E stands before the engine
  const a = rec(["| 3Phases/50Hz/400V/PF=0.8 | | Brand | Engine", "| Generating Sets | Acepow | Model | Prime | Standby"], ["| 18.0 | 22.5 | 19.8 | 24.8 | BC184E | ISUZU | JE493DB-04 | 21 | 23"]);
  assert.deepEqual([of(a, "engine"), of(a, "alternator")], [["JE493DB-04"], ["BC184E"]]); // no alternator title: BC184E is not the engine; acepow's BC1xx code is read as the alternator (lech-cot-8; other codes before the engine are not)
  // acepow-fuan n114: the titles give the order, "Alternator" before "Engine model"
  const b = rec(["| Genset Model | Frequency | Kw | Kva | Alternator | Engine model | Rated Power", "| Rated | Standby | Rated | Standby | Model"], ["| APYD-9 | 60HZ | 9 | 9.9 | 11.3 | 12.4 | APS164B | YD380D | 12KW/1800rpm"]);
  assert.deepEqual([of(b, "engine"), of(b, "alternator")], [["YD380D"], ["APS164B"]]);
  // cldj-fujian n101: 发电机型号 before 发动机型号
  const c = rec(["| 机组型号 | 输出功率 kw KVA | 电流（A） | 发电机型号 | 发动机型号 | 缸径(mm) *行程(mm) | 缸数"], ["| CLS-80 | 60/80 | 108 | CLG-224F | SC4H95D2 | 105*124 | 4"]);
  assert.deepEqual([of(c, "engine"), of(c, "alternator")], [["SC4H95D2"], ["CLG-224F"]]);
  // the genset title is not the alternator title: engine first stays
  const g = rec(["| 发电机组型号 | 发动机型号 | 发电机型号"], ["| CLS-80 | SC4H95D2 | CLG-224F"]);
  assert.deepEqual([of(g, "engine"), of(g, "alternator")], [["SC4H95D2"], ["CLG-224F"]]);
  // tecnogen: a set of two engines gives no engine (the controller SCP8610 was read as one)
  const t = rec(["| Model | kVA LTP | kVA PRP | Engine | Controller"], ["| VO1100TSX-C20 | 1100 | 1000 | 2 x TAD1641GE | SCP8610"]);
  assert.deepEqual(of(t, "engine"), []);
  // the same with a code written with spaces (Scania "DC13 072A 02 14")
  const t2 = rec(["| Model | kVA LTP | kVA PRP | Engine | Controller"], ["| SA1100TSX-D20 | 1100 | 1000 | 2 x DC13 072A 02 14 | SCP8610"]);
  assert.deepEqual(of(t2, "engine"), []);
  // longkai datasheet (two-column PDF): "Engine-SDEC" in front of another line starts the engine part
  const l = rec([], ["| Model | LG250SC", "Alternator", "| Rated prime power | kva | 312.5", "| Model | LONGKAI | LK444E", "| Engine-SDEC | Power factor | 0.8", "| Model | SC12E420D2", "| Prime power | KW | 280"], "Datasheet");
  assert.deepEqual([of(l, "engine"), of(l, "alternator")], [["SC12E420D2"], ["LK444E"]]);
  // acepow: two "label: | value" pairs on one line
  const p = rec([], ["| Engine Model: | 404A-22G1 | Alternator Model: | TAL-A40-F"], "Datasheet");
  assert.deepEqual([of(p, "engine"), of(p, "alternator")], [["404A-22G1"], ["TAL-A40-F"]]);
});

test("saneSpecs: figures the row's own output rules out are left out (rà soát 18/11/2026, mục A5)", () => {
  const rec = (header, rows) => ({ id: "x", country: "CN", role: "genset_oem", status: "partial", names: { en: "X", brands: [] }, productLines: [], sources: [], specTables: [{ n: 1, title: "Diesel Generator", header, rows }] });
  const sp = (r) => Object.fromEntries((CAT.fromSupplier(r)[0]?.specs || []).map((s) => [s.key, s.value]));
  // eastern-lion-fuan n121: "Engine power (kW)" = 19408 on a 10 kW set; mamo-power: a real one stays
  const H = ["| Model | Prime power (kW) | Prime power (kVA) | Standby power (kW) | Standby power (kVA) | Engine model | Engine power (kW) | Alternator model"];
  assert.equal(sp(rec(H, ["| GFS-P14 | 10 | 13 | 11 | 14 | 403A-15G1 | 19408 | El 164C"])).engPower, undefined);
  assert.equal(sp(rec(H, ["| GFS-P14 | 10 | 13 | 11 | 14 | 403A-15G1 | 13.3 | El 164C"])).engPower, "13.3");
  // taihai-taizhou n105: 62 under "g/kw.h" is no g/kWh
  const T = ["| 机组型号 | 常用功率 (kVA) | 常用功率 (kW) | 发动机型号 | 缸数 | 燃油消耗量 (g/kw.h) | 重量 (kg)"];
  const t = sp(rec(T, ["| TH-320GF | 400 | 320 | 2206A-E13TAG3 | 6 | 62 | 3385"]));
  assert.equal(t.fuel, undefined);
  assert.equal(t.weight, "3385");
  assert.equal(sp(rec(T, ["| TH-320GF | 400 | 320 | 2206A-E13TAG3 | 6 | 205 | 3385"])).fuel, "205");
  // a weight under 2,5 kg per kVA is no weight of the set
  assert.equal(sp(rec(T, ["| TH-320GF | 400 | 320 | 2206A-E13TAG3 | 6 | 205 | 594"])).weight, undefined);
});

// buoc-4 PR A (24/11/2026): labels of keys that already exist; lines are real (suppliers/cn).
test("thd: the telephone factors THF / TIF are not the harmonic distortion", () => {
  for (const l of ["电话谐波系数 THF", "Telephone harmonic factor - THF", "Telephone harmonic coefficient THF", "THF", "Telephone Influence Factor (TIF)"]) // shanhua n1001, mecc-alte 1007, kc-generatorset n101, hyundai-power-products 5001, xinhengxin-fujian 1002
    assert.notEqual(CAT.specKey(l), "thd", l);
  assert.equal(CAT.specKey("Total harmonic distortion"), "thd");
  assert.equal(CAT.specKey("THD"), "thd");
});
test("oil / coolant: a label with 'capacity' naming the oil or coolant is the volume, a power / tank capacity stays out", () => {
  for (const l of ["Oil capacity(L) :", "Oil Capacity (L)", "Engine oil capacity", "Lube Oil Capacity (L)", "Total Oil Capacity", "Lubricating oil capacity"]) // acepow-fuan n102, cameo-power n106, tecgen-fujian n101, kigerpower n2001, powerpack n101, gtl-power n105
    assert.equal(CAT.specKey(l), "oil", l);
  for (const l of ["Coolant capacity(L) :", "Radiator coolant capacity (liter)", "Coolant Capacity (L)"]) // acepow-fuan n102, mahindra-powerol n2004
    assert.equal(CAT.specKey(l), "coolant", l);
  for (const l of ["Capacity (kVA):", "Alternator Capacity:", "Rated Capacity", "Fuel Tank Capacity:", "Engine Capacity (L)", "Cooling System Capacity"]) // acepow-fuan n102 / n148, dingbo n101, cgen-alternator n2001, hosem-power n1001, genlitec n1013
    assert.notEqual(["oil", "coolant"].includes(CAT.specKey(l)), true, l);
  assert.equal(CAT.specKey("Fuel Tank Capacity:"), "tank");
  assert.equal(CAT.specKey("Capacity (kVA):"), null);
});
test("compr / disp / start: Chinese labels 压缩比, 排气量, 启动方式, 起动方式", () => {
  assert.equal(fits("压缩比", "17.25:1 17.25:1"), "compr"); // cat-tianjin n2001
  assert.equal(fits("排气量 (L)", "12.5"), "disp"); // bdadl-shanghai n133
  assert.equal(fits("启动方式", "电启动"), "start"); // kusing-guangzhou n2002, hengke-jiangsu n2001
  assert.equal(fits("起动方式", "电起动"), "start"); // chenxing-weifang n101
});

// PR C (buoc-4-c, 24/11/2026): alternator labels, and the labels they were wrongly taken as.
test("alternator: poles / bearing / wires / overspeed / pitch / TIF / THF have their own key; Wires is not phase", () => {
  for (const [l, k] of [["Poles", "poles"], ["No of Poles", "poles"], ["Pole number", "poles"], ["No.of bearings", "bearing"], ["Bearing", "bearing"],
    ["Wires", "wires"], ["Wires:", "wires"], ["No of Leads", "wires"], ["Number of wires", "wires"], ["Overspeed: rpm", "overspeed"], ["MAXIMUM OVERSPEED", "overspeed"],
    ["Winding Pitch", "pitch"], ["Telephone Influence Factor (TIF)", "tif"], ["电话谐波系数 THF", "thf"], ["Telephone harmonic factor (THF)", "thf"],
    ["Cooling Air Flow", "airflow"], ["Alternator fan air flow", "airflow"]]) assert.equal(CAT.specKey(l), k, l);
  assert.equal(CAT.specKey("Phase / Wires"), "phase"); // "3-Phase, 4-Wire" is the phase
  assert.equal(fits("Wires", "12"), "wires");
});
test("alternator: poles / bearing labels of another thing, engine / radiator air flow, are not read as the alternator's", () => {
  for (const l of ["Drive end bearing / Lubrication 驱动端轴承/润滑", "Main bearings", "Engine air flow", "Combustion Air Flow Prime", "Radiator Cooling Airflow:", "Intake air flow", "No of Pole and Phase", "Phase / Poles"])
    assert.ok(!["poles", "bearing", "airflow"].includes(CAT.specKey(l)), l);
});
test("AVR: 'Voltage regulator' / 'AVR model' is the AVR type (not vreg / excit); 'Voltage regulation' stays vreg", () => {
  for (const l of ["Voltage regulator", "Voltage regulator type", "AVR model", "AVR Model:", "AVR Type", "调压器"]) assert.equal(CAT.specKey(l), "avr", l);
  assert.equal(CAT.specKey("AVR"), "excit"); // the bare label is mixed (SHUNT / R150 / ±3 kV): kept as before
  assert.equal(CAT.specKey("Voltage regulation"), "vreg");
  assert.equal(CAT.specKey("Voltage regulation, steady state"), "vreg");
  assert.equal(CAT.specKey("Excitation system"), "excit");
  for (const v of ["A.V.R.", "AVR (Electronic)", "MX321", "R150", "type IC", "固态"]) assert.equal(fits("Voltage regulator", v), "avr", v);
  for (const v of ["±3 kV", "+/- 10 V DC", "Yes", "3,1", "SHUNT", "±1%"]) assert.equal(fits("AVR type", v), null, v); // not an AVR type
  assert.equal(CAT.specKey("AVR make"), null); // a brand
});
test("short circuit: sustained current / capacity is `scirc`; SCR (ratio), protection and the rated-current key stay apart", () => {
  for (const l of ["Sustained Short Circuit", "Short Circuit Capacity**", "短路电流", "短路能力", "Short circuit current"]) assert.equal(CAT.specKey(l), "scirc", l);
  for (const l of ["Short circuit ratio", "Short Circuit Ratio (SCR)", "Short circuit protection"]) assert.notEqual(CAT.specKey(l), "scirc", l);
  assert.notEqual(CAT.specKey("短路电流"), "current");
  assert.equal(CAT.specKey("Rated current"), "current");
});
test("THF is not the THD: the telephone factors have their own keys", () => {
  for (const l of ["电话谐波系数 THF", "THF", "Telephone Harmonic Factor"]) assert.notEqual(CAT.specKey(l), "thd", l);
  assert.equal(CAT.specKey("Total Harmonic Distortion THD"), "thd");
});

// PR D (buoc-4-d, 25/11/2026): engine labels. Fuel system, electrical voltage, HP, cycle.
test("engine: injection system / electrical system voltage / HP labels have their own key; starting voltage is not `start`", () => {
  for (const [l, k] of [["Fuel System", "fuelsys"], ["Injection System", "fuelsys"], ["Injection", "fuelsys"], ["燃油系统", "fuelsys"], ["High-pressure fuel injection", "fuelsys"],
    ["Engine Electrical System", "elecv"], ["Starting Voltage", "elecv"], ["Starter Voltage", "elecv"], ["Starter motor voltage", "elecv"], ["Cranking Motor Voltage", "elecv"],
    ["起动机电压 Start Motor Voltage (V)", "elecv"], ["Gross hp", "engPower"], ["Net hp", "engPower"], ["ENGINE HP", "engPower"], ["Output(hp)", "engPower"],
    ["Power Output# (HP)", "engPower"], ["BHP", "engPower"], ["CV", "engPower"], ["Cycle", "engType"]]) assert.equal(CAT.specKey(l), k, l);
  assert.equal(CAT.specKey("Starting System"), "start");
  assert.equal(CAT.specKey("启动方式"), "start");
});
test("engine: labels that only look like the new keys stay out (kW / rpm pairs, models, tractor HP, auxiliary / system voltage)", () => {
  for (const l of ["Gross kW (hp)", "Hp/Kw", "Rated Output (ps/rpm)", "HP-K880", "HP (recommended) tractor power", "11HP(8.1KW)", "HP/CYLINDERS:", "System Voltage", "Auxiliary voltage", "Combustion System", "Fuel supply connection size"])
    assert.ok(!["fuelsys", "elecv", "engPower"].includes(CAT.specKey(l)), l);
  assert.equal(CAT.specKey("Max Power (kW/Hp)"), "engPower"); // old key, unchanged
});
test("engine: cells of the new keys (a maker's own code, a unit, a controller's 'Control System') do not fit", () => {
  assert.equal(fits("Fuel System", "Common rail"), "fuelsys");
  assert.equal(fits("Fuel System", "High pressure common rail system"), "fuelsys");
  assert.equal(fits("Injection System", "Direct"), "fuelsys");
  for (const v of ["Control System", "ECR", "Backup fuel consumption rate", "Maximum fuel pump flow (l/h)"]) assert.equal(fits("Fuel System", v), null, v);
  assert.equal(fits("Starting Voltage", "DC24V"), "elecv");
  assert.equal(fits("Starting Voltage", "24"), "elecv");
  for (const v of ["V", "12V/24V", "Electric", "380"]) assert.equal(fits("Starting Voltage", v), null, v);
  assert.equal(fits("Cycle", "4 Stroke"), "engType");
  assert.equal(fits("Cycle", "4-cycle"), "engType");
});
