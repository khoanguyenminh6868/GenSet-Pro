// node --test suppliers/*.test.mjs — the minimums of a tender of several sizes go only to the size whose text states them
// (2026-11-12, soát ngưỡng: nhóm "ngưỡng của cỡ khác"). Excerpts of the 4 tenders found wrong, word for word.
import test from "node:test";
import assert from "node:assert/strict";
import { hintsOf, minsForSize, sizeBlocks, sizesOf, technicalPart } from "./config-bot.mjs";

const head = "Chương V. Yêu cầu kỹ thuật\n";
const run = (text, label, ...caps) => { const ss = sizesOf([caps.join("; ")]), s = ss.find((x) => x.label === label || `${x.cap.value} ${x.cap.unit}` === label); return minsForSize(technicalPart(head + text), s, ss); };

test("'>' is a sign: '> 42,0 kVA' opens the block of 42 kVA; '>3.71ít' (OCR) is not read as a figure, and 3.3 L of 30 kVA is not given to it", () => {
  const text = ["1. Máy phat điện Diesel 30KVA/3pha, kèm ATS, vo cách âm", "3 | Công suất liên tục (100% tải) >30,0KVA/24KW Đạt Không đạt",
    "II | Yêu câu vê động cơ", "6 Tong dung tich xilanh > 3.3 lit Dat Khong dat",
    "2. Máy phát điện Diesel 42kVA/ 3pha, kèm ATS, vỏ cách âm", "3 | Công suất liên tục (100% tải) | > 42,0 kVA/ 33,6 KW Đạt Không đạt",
    "II | Yêu câu vê động cơ", "6 | Tong dung tích xilanh >3.71ít Đạt Không đạt"].join("\n");
  assert.equal(run(text, "30 kVA", "30 kVA", "42 kVA").mins.minDisp, 3.3);
  const b = run(text, "42 kVA", "30 kVA", "42 kVA");
  assert.equal(b.mins.minDisp, null);
  assert.equal(b.how.minDisp, "of another size");
});

test("a heading naming one size opens its block: '1.3.2. Điều chuyển Máy phát điện 22kVA' takes nothing of the 40 kVA genset", () => {
  const text = ["1.3. Yêu cầu về kỹ thuật", "1.3.1. Máy phát điện chạy dầu 40kVA - 3 pha: Áp dụng theo TCKT", "Công suất liên tục (Min) 40 kVA / 32 kW",
    "Số xy lanh – Kiểu bố trí ≥ 4 – Thẳng hàng", "Tổng dung tích xy lanh ≥ 2.3 L",
    "1.3.2. Điều chuyển Máy phát điện 22kVA Hub Quận 8 đến Hub Bến Lức", "- Tháo dỡ, vận chuyển và lắp đặt lại"].join("\n");
  const a = run(text, "22 kVA", "22 kVA", "40 kVA").mins, b = run(text, "40 kVA", "22 kVA", "40 kVA").mins;
  assert.deepEqual([a.minDisp, a.minCyl], [null, null]);
  assert.deepEqual([b.minDisp, b.minCyl, b.minPrime?.kVA], [2.3, 4, 40]);
});

test("headings 'Máy phát điện 20KVA' / 'Máy phát điện 10,5kVA': 2.197 L is of 20 kVA only", () => {
  const text = ["Máy phát điện 20KVA", "Công suất liên tục: 17.2kw/1500rpm", "Dung tích xy lanh", "2.197 L",
    "Máy phát điện 10,5kVA", "Công suất liên tục: 12.8kw/1500rpm", "Dung tích nước làm mát:", "8.6 L"].join("\n");
  assert.equal(run(text, "20 kVA", "10,5 kVA", "20 kVA").mins.minDisp, 2.197);
  assert.equal(run(text, "10.5 kVA", "10,5 kVA", "20 kVA").mins.minDisp, null);
});

test("the label then the figure, no sign ('Công suất liên tục: 15kVA/ 12kW', 'Công suất dự phòng: 5.8kW'): the 1.758 L of 15 kVA is not the 5 kW's", () => {
  const text = ["* Thông số tổ máy", "- Công suất liên tục: 15kVA/ 12kW", "- Công suất dự phòng: 16.5kVA /13.2 kW", "- Dung tích xy lanh: > 1.758 lit",
    "2 Máy phát | * Thong số tổ máy", "- Công suât liên tục: SkW", "- Công suất dự phòng: 5.8kW", "- Dung tích động cơ: > 456cc"].join("\n");
  assert.equal(run(text, "15 kVA", "15 kVA", "5 kW").mins.minDisp, 1.758);
  assert.equal(run(text, "5 kW", "15 kVA", "5 kW").mins.minDisp, null);
});

test("no block found for every size: a minimum outside the blocks is not given to a size (null and a short note); the prime still must be the size", () => {
  const text = ["I. TỔ MÁY", "- Công suất liên tục ≥ 30 kVA", "- Dung tích xy lanh ≥ 2,5 lít"].join("\n");
  const withCommon = ["Yêu cầu chung", "- Số xy lanh ≥ 4 xy lanh", text].join("\n"), r = run(withCommon, "12 kVA", "12 kVA", "30 kVA");
  assert.equal(r.mins.minCyl, null);
  assert.equal(r.how.minCyl, "size unknown");
  assert.ok(r.note.length <= 300 && /số xi lanh/.test(r.note) && /12 kVA/.test(r.note));
  // With the block of every size found, the common text goes to each as before.
  const both = ["Yêu cầu chung", "- Số xy lanh ≥ 4 xy lanh", "I. TỔ MÁY", "- Công suất liên tục ≥ 12 kVA", "II. TỔ MÁY", "- Công suất liên tục ≥ 30 kVA", "- Dung tích xy lanh ≥ 2,5 lít"].join("\n");
  const s = run(both, "12 kVA", "12 kVA", "30 kVA");
  assert.deepEqual([s.mins.minCyl, s.mins.minDisp, s.note], [4, null, null]);
  // hintsOf carries the note (catalog.md shows it).
  const ss = sizesOf(["12 kVA; 30 kVA"]);
  assert.match(hintsOf(head + withCommon, "", { size: ss[0], sizes: ss }).sizeNote || "", /không dùng để loại/);
  assert.equal(hintsOf(head + withCommon, "", { size: ss[0], sizes: ss }).minCyl, null);
});

test("a heading naming two sizes, a statement of the engine, a maximum: open no block of a size", () => {
  const ss = sizesOf(["30 kVA; 42 kVA"]);
  const runs = (l) => sizeBlocks(technicalPart(head + l), ss).runs.map((r) => r.size);
  assert.deepEqual(runs("Máy phát điện 30, 42kVA"), []);
  assert.deepEqual(runs("Máy phát điện 30 kVA và 42 kVA"), [-1]);
  assert.deepEqual(runs("2. Máy phát điện 10,5kVA"), [-1]);
  // A count in a list (IB2400125924) is no heading.
  assert.deepEqual(runs("6 máy phát điện 42KVA - 1pha (có vỏ chống ồn, ATS)"), []);
  assert.deepEqual(runs("- Tổ máy phát điện 42kVA bao gồm:"), [1]);
  assert.deepEqual(runs(" − Tổ máy phát điện 42kVA bao gồm:"), [1]);
  // Its prime and standby (IB2400427929): the size of the prime.
  assert.deepEqual(runs("Máy phát điện chạy dầu công suất liên tục/dự phòng 30kVA/33kVA 3 pha"), [0]);
  assert.deepEqual(runs("Máy phát điện chạy dầu công suất 30kVA/60kVA"), [-1]);
  // "12,5 ±0,5 KVA" (IB2600477305) is 12,5 kVA, in a heading and in a statement.
  const ts = sizesOf(["12,5 kVA; 15 kVA"]), tr = (l) => sizeBlocks(technicalPart(head + l), ts).runs.map((r) => r.size);
  assert.deepEqual(tr("A Yêu cầu đối với tổ máy phát điện 12,5 ±0,5 KVA"), [0]);
  assert.deepEqual(tr("3 Công suất liên tục ≥ 12.5 ±0.5KVA Đạt Không đạt"), [0]);
  assert.deepEqual(sizeBlocks(technicalPart(head + "2. Máy phát điện 10,5kVA"), sizesOf(["10,5 kVA; 20 kVA"])).runs.map((r) => r.size), [0]);
  assert.deepEqual(runs("II Yêu cầu về động cơ\n3 Công suất liên tục của động cơ 30 kVA"), []);
  assert.deepEqual(runs("Công suất dự phòng tối đa 42 kVA"), []);
  assert.deepEqual(runs("- Công suất liên tục: 42 kVA"), [1]);
});
