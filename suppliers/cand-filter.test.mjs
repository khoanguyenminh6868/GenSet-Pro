// node --test suppliers/*.test.mjs — the candidates' hard filters (Khoa, 2026-11-12): power band 100% to 120% of the
// HSMT's size; a row under a minimum of the HSMT is left out, unless the HSMT names its engine model.
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, keepOf, NEAR_LOW, NEAR_HIGH } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const t = (header, rows) => [{ n: 101, title: "Gensets 50Hz", header: [header], rows }];
const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | Displacement (L) | Cylinders |";
const sup = (id, rows, conf = "high") => ({ id, country: "CN", confidence: conf, specTables: t(H, rows) });
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (list, cap, hints, o = {}) => candidates(C.build(list), cap, hints, { suppliers: list, ...o });
const ids = (r) => r.top.map((x) => x.u.supplierId).sort();

test("power band: 100% (less 0.5% of rounding) to 120% of the HSMT's size, edges included", () => {
  assert.equal(NEAR_LOW, 0.995); assert.equal(NEAR_HIGH, 1.2);
  const list = [["a", 397], ["b", 398], ["c", 400], ["d", 480], ["e", 481], ["f", 600]].map(([id, kva], i) => sup(id, [`| ${id}-1 | ${kva} | ${kva * 0.8} | ${["WP10D264E200", "WP13D385E200", "WP13D405E200", "YC6K520-D30", "YC6MJ500L-D21", "YC6C1020-D31"][i]} | XY1 | 12 | 6 |`]));
  assert.deepEqual(ids(run(list, { value: 400, unit: "kVA" }, free("50 Hz"))), ["b", "c", "d"]);
  // 250 × 1.2 and 600 × 1.2 are not exact in floating point: the edge row still counts.
  assert.deepEqual(ids(run([sup("x", ["| x-1 | 300 | 240 | WP13D385E200 | XY1 | 12 | 6 |"]), sup("y", ["| y-1 | 720 | 576 | YC6K520-D30 | XY1 | 12 | 6 |"])], { value: 250, unit: "kVA" }, free("50 Hz"))), ["x"]);
  assert.deepEqual(ids(run([sup("y", ["| y-1 | 720 | 576 | YC6K520-D30 | XY1 | 12 | 6 |"])], { value: 600, unit: "kVA" }, free("50 Hz"))), ["y"]);
});

test("a row under a minimum is left out for each of them: displacement, cylinders, prime, largest displacement", () => {
  const cap = { value: 400, unit: "kVA" };
  const list = [sup("ok", ["| o-1 | 420 | 336 | WP13D405E200 | XY1 | 15 | 8 |"]), sup("bad", ["| b-1 | 420 | 336 | WP10D264E200 | XY1 | 9.7 | 6 |"])];
  let r = run(list, cap, free("Dung tích xy lanh ≥ 14,5 L\n50 Hz"));
  assert.deepEqual(ids(r), ["ok"]); assert.deepEqual(r.dropped.map((x) => [x.u.supplierId, x.ruled]), [["bad", ["disp"]]]);
  r = run(list, cap, free("Số xy lanh: ≥ 8 xy lanh\n50 Hz"));
  assert.deepEqual(ids(r), ["ok"]); assert.deepEqual(r.dropped.map((x) => x.ruled), [["cyl"]]);
  r = run(list, cap, free("Dung tích xi lanh ≤ 12,5 L\n50 Hz"));
  assert.deepEqual(ids(r), ["bad"]); assert.deepEqual(r.dropped.map((x) => [x.u.supplierId, x.ruled]), [["ok", ["maxDisp"]]]);
  // The row's standby (440) is in the band; its prime (380) is under the 400 kVA the HSMT asks.
  const sb = (id, row) => ({ id, country: "CN", confidence: "high", specTables: t("| Model | Standby kVA | Standby kW | Prime kVA | Prime kW | Engine | Alternator |", [row]) });
  const pl = [sb("ok", "| o-1 | 484 | 387 | 440 | 352 | WP13D405E200 | XY1 |"), sb("lo", "| l-1 | 418 | 334 | 380 | 304 | WP13D385E200 | XY1 |")];
  r = run(pl, cap, free("Công suất liên tục ≥ 400 kVA (Prime)\n50 Hz"));
  assert.deepEqual(ids(r), ["ok"]); assert.deepEqual(r.dropped.map((x) => x.ruled), [["prime"]]);
});

test("the HSMT names the engine: the row under a minimum stays, 600 points off, with the reason", () => {
  const list = [sup("n", ["| n-1 | 420 | 336 | WP10D264E200 | XY1 | 9.7 | 6 |"]), sup("p", ["| p-1 | 420 | 336 | WP13D405E200 | XY1 | 15 | 8 |"])];
  const r = run(list, { value: 400, unit: "kVA" }, free("Động cơ WP10D264E200\nDung tích xy lanh ≥ 14,5 L\n50 Hz"));
  assert.deepEqual(ids(r), ["n", "p"]); assert.equal(r.dropped.length, 0);
  const n = r.top.find((x) => x.u.supplierId === "n");
  assert.equal(n.named, true); assert.deepEqual(n.ruled, ["disp"]); assert.match(n.why.join(" "), /dung tích 9.7 L < 14.5 L/);
  assert.ok(n.score > 0 && n.score < 1000);
});

test("sources that disagree, or none that gives the figure: the row is not left out", () => {
  const cap = { value: 400, unit: "kVA" }, hints = free("Dung tích xy lanh ≥ 14,5 L\n50 Hz");
  // The same engine, 9.7 L in one supplier's row and 15 L in another's.
  const two = [sup("a", ["| a-1 | 420 | 336 | WP13D385E200 | XY1 | 9.7 | 6 |"]), sup("b", ["| b-1 | 420 | 336 | WP13D385E200 | XY1 | 15 | 6 |"])];
  let r = run(two, cap, hints);
  assert.deepEqual(ids(r), ["a", "b"]); assert.equal(r.dropped.length, 0);
  const none = [sup("c", ["| c-1 | 420 | 336 | YC6K520-D30 | XY1 | | |"])];
  r = run(none, cap, hints);
  assert.deepEqual(ids(r), ["c"]); assert.equal(r.dropped.length, 0);
});

test("a row of the last run (keep) under a minimum is still left out", () => {
  const cap = { value: 400, unit: "kVA" };
  const list = [sup("ok", ["| o-1 | 420 | 336 | WP13D405E200 | XY1 | 15 | 8 |"]), sup("bad", ["| b-1 | 420 | 336 | WP10D264E200 | XY1 | 9.7 | 6 |"])];
  const hints = free("Dung tích xy lanh ≥ 14,5 L\n50 Hz");
  const keep = keepOf({ configs: [{ engine: { model: "WP10D264E200" }, suppliers: [{ supplierId: "bad" }] }] });
  assert.equal(keep.size, 1);
  assert.deepEqual(ids(run(list, cap, hints, { sync: { need: 2, parts: ["engine", "alternator", "controller"] }, keep })), ["ok"]);
});
