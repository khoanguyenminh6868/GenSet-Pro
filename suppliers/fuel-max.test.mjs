// node --test suppliers/*.test.mjs — the fuel consumption the HSMT allows (Khoa, 2026-11-12): a row whose own figure
// (same load, in L/h) is over it is left out of candidates() like one under a minimum; a row with no such figure stays.
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | Fuel consumption 100% load (L/h) | Fuel consumption 75% load (L/h) | Fuel consumption (g/kWh) |";
const sup = (id, rows, header = H) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets 50Hz", header: [header], rows }] });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, hints) => candidates(C.build(list), { value: 400, unit: "kVA" }, hints, { suppliers: list });
const ids = (r) => r.top.map((x) => x.u.supplierId).sort();
const rows = [
  sup("low", ["| l-1 | 420 | 336 | WP13D405E200 | XY1 | 80 | 61 | 200 |"]),
  sup("high", ["| h-1 | 420 | 336 | WP13D385E200 | XY1 | 99 | 74 | 215 |"]),
  sup("none", ["| n-1 | 420 | 336 | YC6K520-D30 | XY1 | | | |"]),
  sup("gkwh", ["| g-1 | 420 | 336 | YC6MJ500L-D21 | XY1 | 230 g/kWh | | |"]),
];

test("fuel at 100% load over the HSMT's limit: the row is left out, with the reason; no figure or another unit: kept", () => {
  const h = free("Tiêu hao nhiên liệu ở 100% tải ≤ 90 L/h\n50 Hz");
  assert.equal(h.maxFuel, 90);
  const r = run(rows, h);
  assert.deepEqual(ids(r), ["gkwh", "low", "none"]);
  assert.deepEqual(r.dropped.map((x) => [x.u.supplierId, x.ruled]), [["high", ["fuel"]]]);
  assert.ok(r.all.every((x) => !x.fuelOver));
});

test("fuel at 75% load is compared with the 75% figure only", () => {
  const r = run(rows, free("Tiêu hao nhiên liệu ở 75% tải ≤ 70 L/h\n50 Hz"));
  assert.deepEqual(r.dropped.map((x) => [x.u.supplierId, x.ruled]), [["high", ["fuel75"]]]);
  // 100% limit 90: the row with 99 L/h at 100% goes, the one with 74 at 75% is not judged on it.
  assert.deepEqual(run(rows, free("Tiêu hao nhiên liệu ở 100% tải ≤ 90 L/h\n50 Hz")).dropped.map((x) => x.u.supplierId), ["high"]);
});

test("a figure equal to the limit stays; the engine the HSMT names stays with 300 points off", () => {
  assert.equal(run(rows, free("Tiêu hao nhiên liệu ở 100% tải ≤ 99 L/h\n50 Hz")).dropped.length, 0);
  const r = run(rows, free("Động cơ WP13D385E200\nTiêu hao nhiên liệu ở 100% tải ≤ 90 L/h\n50 Hz"));
  assert.equal(r.dropped.length, 0);
  const x = r.top.find((y) => y.u.supplierId === "high");
  assert.equal(x.named, true); assert.deepEqual(x.ruled, ["fuel"]); assert.equal(x.fuelOver, true); assert.match(x.why.join(" "), /tiêu hao 99 L\/h > 90 L\/h/);
});

test("no limit in the HSMT: nothing is left out", () => {
  const r = run(rows, free("50 Hz"));
  assert.equal(r.dropped.length, 0); assert.deepEqual(ids(r), ["gkwh", "high", "low", "none"]);
});

test("not judged: a bound (\"< 100\") and a figure no genset of this size burns (a kW / kVA pair under the heading)", () => {
  const list = [
    sup("bound", ["| b-1 | 420 | 336 | WP13D405E200 | XY1 | < 100 | | |"]),
    sup("pair", ["| p-1 | 420 | 336 | WP13D385E200 | XY1 | 336/420 | | |"]),
    sup("over", ["| o-1 | 420 | 336 | YC6K520-D30 | XY1 | 99 | | |"]),
  ];
  const r = run(list, free("Tiêu hao nhiên liệu ở 100% tải ≤ 90 L/h\n50 Hz"));
  assert.deepEqual(ids(r), ["bound", "pair"]);
  assert.deepEqual(r.dropped.map((x) => x.u.supplierId), ["over"]);
});

test("a heading that names no load is filed under 100% by the catalog but is not left out: the old 300 points off stay", () => {
  const H2 = "| Model | Prime kVA | Prime kW | Engine | Alternator | Fuel Consumption (L/h) |";
  const list = [sup("nl", ["| n-1 | 420 | 336 | WP13D405E200 | XY1 | 99 |"], H2), sup("fl", ["| f-1 | 420 | 336 | YC6K520-D30 | XY1 | 99 |"], H.replace("100% load", "Full-Load"))];
  const r = run(list, free("Tiêu hao nhiên liệu ở 100% tải ≤ 90 L/h\n50 Hz"));
  assert.deepEqual(ids(r), ["nl"]);
  const x = r.top[0];
  assert.equal(x.fuelOver, true); assert.equal(x.fuelNoLoad, true); assert.deepEqual(x.ruled, []);
  assert.deepEqual(r.dropped.map((d) => d.u.supplierId), ["fl"]);
});
