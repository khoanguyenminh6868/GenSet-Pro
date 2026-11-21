// node --test suppliers/*.test.mjs — a genset of 30 kVA or less (24 kW) has the band 100%..140%, a larger one 100%..120%
// (Khoa, 2026-11-12): the candidates, Tìm NCC (fitsCap, engineRows, mergeFind) and the text of catalog.md.
import test from "node:test";
import assert from "node:assert/strict";
import { bandOf, candidates, catalogMd, hintsOf, fitsCap, engineRows, mergeFind, NEAR_LOW, NEAR_HIGH, SMALL_KVA } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const ENG = ["WP10D264E200", "WP10D238E200", "WP12D317E200", "WP13D385E200", "WP13D405E200", "YC6A245L-D21"];
const rec = (id, kva, eng) => ({ id, role: "genset_maker", country: "CN", confidence: "high", names: { en: id }, specTables: [{ n: 2001, title: "Weichai gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine"], rows: [`| ${id}-1 | ${kva} | ${+(kva * 0.8).toFixed(4)} | ${eng}`] }] });
const free = () => ({ ...hintsOf("Chương V. Yêu cầu kỹ thuật\n50 Hz"), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const got = (cap, rows) => { const list = rows.map(([kva, i]) => rec(`s${String(kva).replace(".", "_")}`, kva, ENG[i])); return candidates(C.build(list), cap, free(), { suppliers: list, makeCap: 0 }).top.map((r) => r.u.supplierId).sort(); };

test("bandOf: 30 kVA and 24 kW are small (140%), 30.1 kVA and 24.1 kW are not (120%)", () => {
  assert.equal(SMALL_KVA, 30);
  const hi = (cap) => bandOf(cap).high;
  assert.equal(hi({ value: 30, unit: "kVA" }), 1.4); assert.equal(hi({ value: 5, unit: "kVA" }), 1.4); assert.equal(hi({ value: 24, unit: "kW" }), 1.4);
  assert.equal(hi({ value: 30.1, unit: "kVA" }), NEAR_HIGH); assert.equal(hi({ value: 31, unit: "kVA" }), 1.2); assert.equal(hi({ value: 24.1, unit: "kW" }), 1.2);
  assert.equal(hi(null), NEAR_HIGH); assert.equal(bandOf({ value: 30, unit: "kVA" }).low, NEAR_LOW);
  assert.match(bandOf({ value: 30, unit: "kVA" }).text, /140%/); assert.match(bandOf({ value: 400, unit: "kVA" }).text, /120%/);
});

test("candidates: 30 kVA takes a row of 42 kVA, not 42.1; 31 kVA does not take 38 kVA but 37.2", () => {
  assert.deepEqual(got({ value: 30, unit: "kVA" }, [[29.8, 0], [29.9, 4], [30, 1], [42, 2], [42.1, 3]]), ["s29_9", "s30", "s42"]);
  assert.deepEqual(got({ value: 31, unit: "kVA" }, [[30.8, 0], [37.2, 1], [38, 2]]), ["s37_2"]);
  assert.deepEqual(got({ value: 400, unit: "kVA" }, [[398, 0], [480, 1], [481, 2], [560, 3]]), ["s398", "s480"]);
});

test("candidates: 24 kW takes 33.6 kW, not 33.7; 24.1 kW takes up to 28.92 kW (36 kVA is 28.8 kW)", () => {
  assert.deepEqual(got({ value: 24, unit: "kW" }, [[30, 0], [42, 1], [42.2, 2]]), ["s30", "s42"]);
  assert.deepEqual(got({ value: 24.1, unit: "kW" }, [[30, 0], [36, 1], [37.5, 2]]), ["s30", "s36"]);
});

test("catalog.md says the band of the size", () => {
  const list = [rec("a", 30, ENG[0])];
  assert.match(catalogMd(C.build(list), { value: 30, unit: "kVA" }, free(), { suppliers: list }).md.split("\n")[0], /từ 100% đến 140%/);
  assert.match(catalogMd(C.build(list), { value: 400, unit: "kVA" }, free(), { suppliers: list }).md.split("\n")[0], /từ 100% đến 120%/);
});

test("Tìm NCC: the same band (fitsCap, engineRows, mergeFind)", () => {
  const line = (min, max) => ({ productLines: [{ power: { unit: "kVA", min, max } }] }), cap = { value: 30, unit: "kVA" };
  assert.equal(fitsCap(line(42, 60), cap), true); assert.equal(fitsCap(line(42.1, 60), cap), false);
  assert.equal(fitsCap(line(100, 400), { value: 31, unit: "kVA" }), false); assert.equal(fitsCap(line(37.2, 60), { value: 31, unit: "kVA" }), true);
  assert.equal(fitsCap(line(33.6, 50), { value: 24, unit: "kW" }), false, "units differ: a kVA line for a kW size");
  assert.equal(engineRows(rec("x", 42, ENG[0]), cap).length, 1); assert.equal(engineRows(rec("x", 42.1, ENG[0]), cap).length, 0);
  assert.equal(engineRows(rec("y", 38, ENG[0]), { value: 31, unit: "kVA" }).length, 0); assert.equal(engineRows(rec("y", 37.2, ENG[0]), { value: 31, unit: "kVA" }).length, 1);
  assert.equal(engineRows(rec("z", 42, ENG[0]), { value: 24, unit: "kW" }).length, 1); assert.equal(engineRows(rec("z", 42.2, ENG[0]), { value: 24, unit: "kW" }).length, 0);
  const result = { origin: "cn", configs: [] };
  const out = mergeFind(result, [rec("m42", 42, ENG[0]), rec("m43", 43, ENG[1]), rec("m30", 30, ENG[2])], { cap, origin: "cn" });
  assert.deepEqual(out.created.map((c) => c.supplierId).sort(), ["m30", "m42"]);
});
