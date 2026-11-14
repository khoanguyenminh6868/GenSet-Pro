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
