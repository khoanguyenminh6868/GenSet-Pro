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
