// node --test suppliers/*.test.mjs — Tìm NCC takes the same power band as the candidates (Khoa, 2026-11-12): 100% (less
// 0.5% of rounding) to 120% of the tender's power, in fitsCap, engineRows and mergeFind.
import test from "node:test";
import assert from "node:assert/strict";
import { fitsCap, engineRows, mergeFind, NEAR_LOW, NEAR_HIGH } from "./config-bot.mjs";

const head = ["| Model | Prime kVA | Prime kW | Engine"];
const ENG = ["WP10D264E200", "WP10D238E200", "WP12D317E200", "WP13D385E200", "WP13D405E200"];
// One supplier a row (kVA), the engine of each different.
const rec = (id, kva, eng) => ({ id, role: "genset_maker", names: { en: id }, specTables: [{ n: 2001, title: "Weichai gensets", header: head, rows: [`| ${id}-1 | ${kva} | ${kva * 0.8} | ${eng}`] }] });
const rows = [[397, ENG[0]], [398, ENG[1]], [400, ENG[2]], [480, ENG[3]], [481, ENG[4]]];

test("the band constants: 0.995 and 1.2", () => {
  assert.equal(NEAR_LOW, 0.995); assert.equal(NEAR_HIGH, 1.2);
});

test("fitsCap: a product line whose range reaches into 100%..120% fits; one that stops at 397 or starts at 481 does not", () => {
  const line = (min, max) => ({ productLines: [{ power: { unit: "kVA", min, max } }] }), cap = { value: 400, unit: "kVA" };
  assert.equal(fitsCap(line(100, 397), cap), false);
  assert.equal(fitsCap(line(100, 398), cap), true);
  assert.equal(fitsCap(line(480, 900), cap), true);
  assert.equal(fitsCap(line(481, 900), cap), false);
  // 250 × 1.2 is not exact in floating point: a line starting at 300 still fits. The old 140% took 481…560 in.
  assert.equal(fitsCap(line(300, 900), { value: 250, unit: "kVA" }), true);
  assert.equal(fitsCap(line(520, 560), cap), false);
});

test("engineRows: the rows from 398 to 480 kVA for a tender of 400", () => {
  const got = rows.map(([kva, eng]) => engineRows(rec(`s${kva}`, kva, eng), { value: 400, unit: "kVA" }).length);
  assert.deepEqual(got, [0, 1, 1, 1, 0]);
  assert.equal(engineRows(rec("x", 300, ENG[0]), { value: 250, unit: "kVA" }).length, 1, "250 × 1.2 = 300 counts");
  // A tender of several sizes: a row in the band of any of them.
  assert.equal(engineRows(rec("y", 481, ENG[0]), [{ value: 400, unit: "kVA" }, { value: 450, unit: "kVA" }]).length, 1);
});

test("mergeFind: a row from 398 to 480 kVA (not 397, not 481) makes a configuration for a tender of 400", () => {
  const records = rows.map(([kva, eng]) => rec(`s${kva}`, kva, eng));
  const result = { origin: "cn", configs: [] };
  const out = mergeFind(result, records, { cap: { value: 400, unit: "kVA" }, origin: "cn" });
  assert.deepEqual(out.created.map((c) => c.supplierId).sort(), ["s398", "s400", "s480"]);
  assert.deepEqual(result.configs.map((c) => c.suppliers[0].supplierId).sort(), ["s398", "s400", "s480"]);
});
