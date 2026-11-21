// node --test suppliers/*.test.mjs — the minimums of the HSMT of each size of a tender of several sizes (Khoa, 2026-11-12,
// IB2600594596: "≥ 14,5 L, ≥ 8 xi lanh" under 400 kVA, "≥ 9 L, ≥ 6 xi lanh" under 300 kVA: two values, none given).
import test from "node:test";
import assert from "node:assert/strict";
import { hintsOf, engineMins, minsForSize, sizeBlocks, sizesOf, technicalPart } from "./config-bot.mjs";

const head = "Chương V. Yêu cầu kỹ thuật\n";
const block = (kva, { cyl, disp, fuel } = {}) => [`I. TỔ MÁY PHÁT ĐIỆN ${kva}KVA`, `- Công suất liên tục ≥ ${kva} kVA`, `- Công suất dự phòng ≥ ${Math.round(kva * 1.1)} kVA`,
  "II. Yêu cầu đối với động cơ", ...(cyl ? [`- Số xy lanh: ≥ ${cyl} xy lanh`] : []), ...(disp ? [`- Dung tích xy lanh ≥ ${disp} L`] : []),
  ...(fuel ? [`- Tiêu hao nhiên liệu ở 100% tải ≤ ${fuel} Lít/giờ`] : []), "III. Yêu cầu đối với đầu phát", "- Cấp cách điện H"].join("\n");
const sizes = (...kva) => sizesOf([kva.map((k) => `${k} kVA`).join("; ")]);
const two = sizes(300, 400);
const mins = (text, size, ss = two, extra = "") => minsForSize(technicalPart(head + text), ss.find((s) => s.kva === size), ss, extra);

test("each size reads the minimums of its own block; the whole text gives none", () => {
  const text = [block(400, { cyl: 8, disp: 14.5 }), block(300, { cyl: 6, disp: 9 })].join("\n");
  assert.equal(engineMins(head + text).minDisp, null);
  const a = mins(text, 300).mins, b = mins(text, 400).mins;
  assert.deepEqual([a.minDisp, a.minCyl], [9, 6]);
  assert.deepEqual([b.minDisp, b.minCyl], [14.5, 8]);
  assert.deepEqual([a.minPrime?.kVA, b.minPrime?.kVA], [300, 400]);
  // hintsOf: the sizing is what takes it; with none (one size, or no sizing) the whole text is read as before.
  assert.equal(hintsOf(head + text, "", { size: two[0], sizes: two }).minDisp, 9);
  assert.equal(hintsOf(head + text, "", { size: two[1], sizes: two }).minCyl, 8);
  assert.equal(hintsOf(head + text).minDisp, null);
  assert.equal(hintsOf(head + text, "", { size: two[0], sizes: [two[0]] }).minDisp, null);
});

test("the fuel limits and the prime minimum of a size are those of its block", () => {
  const text = [block(300, { fuel: 66 }), block(400, { fuel: 91 })].join("\n");
  assert.equal(mins(text, 300).mins.maxFuel, 66);
  assert.equal(mins(text, 400).mins.maxFuel, 91);
});

test("a minimum common to the tender (outside every block) goes to every size", () => {
  const text = "- Số xy lanh: ≥ 6 xy lanh\n" + [block(300), block(400)].join("\n");
  assert.equal(mins(text, 300).mins.minCyl, 6);
  assert.equal(mins(text, 400).mins.minCyl, 6);
  assert.equal(mins(text, 400).how.minCyl, "common");
});

test("a minimum only in the block of another size is not taken: none (never another size's)", () => {
  const text = [block(300), block(400, { disp: 14.5 })].join("\n");
  assert.equal(mins(text, 400).mins.minDisp, 14.5);
  const small = mins(text, 300);
  assert.equal(small.mins.minDisp, null);
  assert.equal(small.how.minDisp, "of another size");
  // The whole text gave 14.5 for both sizes: that was another size's minimum on the 300 kVA run.
  assert.equal(engineMins(head + text).minDisp, 14.5);
});

test("blocks of one size that disagree: none; one that agrees: that", () => {
  const text = [block(300, { disp: 9 }), block(400, { disp: 14.5 }), block(400, { disp: 12 })].join("\n");
  assert.equal(mins(text, 400).mins.minDisp, null);
  assert.equal(mins(text, 400).how.minDisp, "own: disagree");
  assert.equal(mins(text, 300).mins.minDisp, 9);
  const same = [block(300, { disp: 9 }), block(400, { disp: 14.5 }), block(400, { disp: 14.5 })].join("\n");
  assert.equal(mins(same, 400).mins.minDisp, 14.5);
});

test("a statement of power that fits two sizes belongs to none: its block is of no size", () => {
  const ss = sizes(370, 420);
  // The standby of 440 kVA is 119% of 370 and 105% of 420.
  const text = ["I. TỔ MÁY", "- Công suất dự phòng ≥ 440 kVA", "II. Yêu cầu đối với động cơ", "- Dung tích xy lanh ≥ 14,5 L"].join("\n");
  const { runs } = sizeBlocks(technicalPart(head + text), ss);
  assert.deepEqual(runs.map((r) => r.size), [-1]);
  assert.equal(mins(text, 370, ss).mins.minDisp, null);
  assert.equal(mins(text, 420, ss).mins.minDisp, null);
});

test("prime within 0.5% and standby from 100% to 120% of the size belong to it; a smaller or larger one does not", () => {
  const ss = sizes(300, 400);
  const run = (line) => sizeBlocks(technicalPart(head + `I. TỔ MÁY\n${line}\nII. Yêu cầu đối với động cơ\n- Số xy lanh: ≥ 6 xy lanh`), ss).runs.map((r) => r.size);
  assert.deepEqual(run("- Công suất liên tục ≥ 400 kVA"), [1]);
  assert.deepEqual(run("- Công suất liên tục ≥ 398 kVA"), [1]);
  assert.deepEqual(run("- Công suất liên tục ≥ 380 kVA"), [-1]);
  assert.deepEqual(run("- Công suất dự phòng ≥ 480 kVA"), [1]);
  assert.deepEqual(run("- Công suất dự phòng ≥ 481 kVA"), [-1]);
});

// 2026-11-12 (mins-size-2): with no block of the size its minimum cannot be placed: none, and a note (was: the whole text).
test("a tender with no statement of power: no size takes the minimum; the extra requests are outside the blocks", () => {
  const text = "- Dung tích xy lanh ≥ 4 L";
  assert.equal(mins(text, 300).mins.minDisp, null);
  assert.equal(mins(text, 400).mins.minDisp, null);
  assert.match(mins(text, 300).note, /dung tích xi lanh tối thiểu/);
  const extra = mins([block(300), block(400)].join("\n"), 300, two, "Số xy lanh ≥ 5 xy lanh");
  assert.equal(extra.mins.minCyl, 5);
});

test("a minimum every other block repeats, one value, goes to the size whose own text gave none (IB2300245556)", () => {
  const ss = sizes(8.5, 10, 12), pick = (text, kva) => minsForSize(technicalPart(head + text), ss.find((s) => s.kva === kva), ss, "");
  // The 12 kVA section states no power the code takes: its engine lines stay in the block of 10 kVA.
  const text = [block(8.5, { cyl: 4, disp: 2.3 }), block(10, { cyl: 4, disp: 2.3 }), "II. Yêu cầu đối với động cơ", "- Số xy lanh: ≥ 4 xy lanh"].join("\n");
  const r = pick(text, 12);
  assert.deepEqual([r.mins.minCyl, r.mins.minDisp, r.how.minCyl], [4, 2.3, "agreed"]);
  assert.equal(pick(text, 12).mins.minPrime, null);
  assert.equal(pick(text, 8.5).how.minCyl, "own");
  // Two values: none. One block alone: none.
  const differ = [block(8.5, { cyl: 4 }), block(10, { cyl: 3 })].join("\n");
  assert.equal(pick(differ, 12).mins.minCyl, null);
  assert.equal(pick([block(8.5, { cyl: 4 }), block(10)].join("\n"), 12).mins.minCyl, null);
  // The statements of the other blocks are not at least half of the blocks: none (a machine whose figure shows twice).
  assert.equal(pick([block(8.5, { cyl: 4 }), block(10), block(12), block(8.5, { cyl: 4 })].join("\n"), 10).mins.minCyl, null);
});

test("a list of items with the power right after its label, no sign: the block of each (IB2300363623, 15 kVA and 5 kW)", () => {
  const ss = sizesOf(["Hàng mục 1: 15 kVA/12 kW liên tục; Hàng mục 2: 5 kW liên tục"]);
  assert.equal(ss.length, 2);
  const text = ["* Thông số tổ máy", "- Công suất liên tục: 15kVA/ 12kW", "- Công suất dự phòng: 16.5kVA /13.2 kW", "* Động cơ", "- Dung tích xy lanh: > 1.758 lit",
    "* Thông số tổ máy", "- Công suất dự phòng: 5.8kW", "* Động cơ", "- Công suất động cơ: 11HP"].join("\n");
  const big = ss.find((s) => s.cap.unit === "kVA"), small = ss.find((s) => s.cap.unit === "kW");
  assert.equal(minsForSize(technicalPart(head + text), big, ss, "").mins.minDisp, 1.758);
  assert.equal(minsForSize(technicalPart(head + text), small, ss, "").mins.minDisp, null);
  assert.equal(minsForSize(technicalPart(head + text), big, ss, "").mins.minPrime?.kVA, 15);
});
