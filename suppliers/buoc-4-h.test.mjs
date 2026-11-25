// node --test suppliers/buoc-4-h.test.mjs — buoc-4-h (25/11/2026): readers of genset.ambient, genset.overload, alternator.altitude,
// alternator.type (web/catalog.js SPECS ambient / overload / altitude / altType, partKey; web/spec-norm.js altitude). Cases are
// rows of suppliers/cn, read from the files so the source text stays verbatim.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const f of ["conversions.js", "catalog.js", "spec-norm.js"]) await import(pathToFileURL(path.join(ROOT, "web", f)).href);
const CAT = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
const sup = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "suppliers", "cn", `${id}.json`), "utf8"));
const fits = (label, value) => { const k = CAT.specKey(label); return k && CAT.SPEC[k].ok.test(value) ? k : null; };
const specOf = (recs, key) => recs.map((o) => `${o.kind} ${o.model} ${o.genset ?? ""} = ${(o.specs || []).filter((s) => s.key === key).map((s) => s.value).join(" ; ")}`);

test("ambient: site temperature / altitude labels; radiator, start, storage, engine coolant limit, 'Höhe' are not", () => {
  for (const [l, v] of [["Altitude", "≤1000m"], ["环境温度", "≤40 ℃"], ["海拔高度", "≤1000M"], ["海拔要求", "≤1000 m"], ["Ambient Temp", "≤40 C"], ["Standard Ambient Temperature", "40°C"],
    ["Altitude Condition", "≤1000m"], ["Reference Site Altitude", "≤ 1000 m"], ["Ambient temperature(℃)", "40"]])
    assert.equal(fits(l, v), "ambient", l);
  // "Operating temperature": specKeyOf stops labels with "rating" (opeRATING) before SPECS; mostly a controller's range (Deep Sea, ComAp).
  for (const l of ["Operating temperature", "Operating Temperature", "Operating temperature (min/max) (2)"]) assert.equal(CAT.specKey(l), null, l);
  for (const l of ["Ambient capacity of radiator……………………………50℃", "Min Ambient for Unaided Start", "Min Ambient Temp for Unaided Cold Start", "Max. allowable operating temperature",
    "Ambient temperature (storage)......................-30 to 80 °C / -22 to 176 °F", "海拔功率修正表", "Ambient temperature and altitude derating", "Höhe 1)", "Noise / Ambient", "toAftercoolers @ 25°C Ambient (℃)"])
    assert.notEqual(CAT.specKey(l), "ambient", l);
  assert.equal(CAT.specKey("Noise / Ambient"), "noise"); // unchanged
});

test("overload: the set's overload capability; a protection, timeout, ANSI code, overload power column are not", () => {
  for (const [l, v] of [["过载能力", "1.5倍2分钟"], ["过载能力", "过载 10%一小时"], ["Overload capability", "110% 1h in 12h"]]) assert.equal(fits(l, v), "overload", `${l} ${v}`);
  for (const l of ["Overload (real power)", "Overload Timeout", "Overload protection", "Current overload", "Overload Action", "过载 功率(kw)", "Load shed via overload # levels", "Overload Measurement"])
    assert.notEqual(CAT.specKey(l), "overload", l);
  assert.equal(fits("Overload", "32"), null); // comap: ANSI 32, no capability
});

test("altType: alternator type labels; a bare Type / 类型 and a cell that is a model or a genset kind are not", () => {
  for (const [l, v] of [["Alternator Type:", "Brushless, Self-Exciting"], ["Alternator type", "Self-excited,2-pole,single phase"], ["AlternatorType", "Brushless, 3 Phase"], ["电机类型", "无刷三相交流同步发电机"], ["Alternator Type", "Brushless sel-excited"]])
    assert.equal(fits(l, v), "altType", l);
  for (const l of ["Type", "类型", "类 型", "型式", "Type:"]) assert.notEqual(CAT.specKey(l), "altType", l);
  assert.equal(fits("Alternator type", "ECP32 2S4 C"), null); // endress: the alternator's code
  assert.equal(fits("Generator type", "Silent Gasoline / LPG/NG Generator"), null); // slong: a genset kind
});

test("altType keeps 'Alternator type | <code>' as the alternator's model (endress n109: 34 records before the key)", () => {
  const recs = CAT.fromSupplier(sup("endress-stromerzeuger")).filter((o) => o.n === 109 && o.kind === "alternator");
  assert.deepEqual(recs.map((o) => o.model), ["ECP32 2S4 C"]);
  assert.equal(recs[0].specs.some((s) => s.key === "altType"), false);
});

test("altType of a table across: each model gets its own column (victory n130, 50 Hz and 60 Hz tables)", () => {
  const recs = CAT.fromSupplier(sup("victory-generator")).filter((o) => o.n === 130);
  const got = specOf(recs, "altType").sort();
  assert.deepEqual(got, [
    "engine LT620 VT11000ME = Self-excited,2-pole,single phase",
    "engine LT620 VT11000ME = Self-excited,2-pole,single phase",
    "engine LT620 VT11000ME = Self-excited,4-pole, three phases",
    "engine LT620 VT11000ME-3 = Self-excited,4-pole, three phases",
  ]);
  // The single-phase model never takes the three-phase type of the next column (50 Hz table).
  const t50 = recs.filter((o) => o.table === recs.find((x) => x.genset === "VT11000ME-3").table);
  assert.deepEqual(specOf(t50, "altType").sort(), ["engine LT620 VT11000ME = Self-excited,2-pole,single phase", "engine LT620 VT11000ME-3 = Self-excited,4-pole, three phases"]);
});

test("altitude under the 'Alternator' heading is the alternator's; in the set's part it is the set's ambient (huali n2005 / n2008)", () => {
  const recs = CAT.fromSupplier(sup("huali-shandong"));
  const n2008 = recs.filter((o) => o.n === 2008), n2005 = recs.filter((o) => o.n === 2005);
  assert.deepEqual(specOf(n2008.filter((o) => o.kind === "alternator"), "altitude"), ["alternator HLF-400  = ≤ 1000 m"]);
  assert.deepEqual(specOf(n2008, "ambient"), ["engine 2506C-E15TAG2  = ", "alternator HLF-400  = "]);
  assert.deepEqual(specOf(n2005, "ambient"), ["engine 1106A-70TAG4  = ≤ 1000 m", "alternator HLF150  = ≤ 1000 m"]);
  assert.deepEqual(specOf(n2005, "altitude"), ["engine 1106A-70TAG4  = ", "alternator HLF150  = "]);
  // Models without the line get nothing (n2006 HLF200 writes no altitude).
  for (const o of recs.filter((x) => x.n !== 2005 && x.n !== 2008)) assert.equal((o.specs || []).some((s) => s.key === "altitude" || s.key === "ambient"), false, `${o.n} ${o.model}`);
});

test("spec-norm altitude: the figure and the operator; metres only when written", () => {
  const n = (value, label = "Altitude Requirement", header = []) => SN.normalize({ key: "altitude", label, value }, { header });
  const a = n("≤ 1000 m");
  assert.equal(a.num, 1000); assert.equal(a.unit, "m"); assert.equal(a.op, "≤"); assert.deepEqual(a.missing, []);
  assert.equal(n("1000", "Altitude(m)").unit, "m");
  const b = n("1000");
  assert.equal(b.num, 1000); assert.equal(b.unit, null); assert.ok(b.missing.includes("unit"));
  assert.ok(n("0 to 4000 m with derating").missing.includes("value"));
  assert.equal(n("1,000m").num, 1000);
});
