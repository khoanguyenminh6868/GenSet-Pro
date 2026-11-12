// node --test suppliers/*.test.mjs — more of the 2026-11-12 audit (kiem-rong.md): the hand-checked wrong thresholds and rows left
// out for them. Every text is the HSMT's own.
import test from "node:test";
import assert from "node:assert/strict";
import { engineMins, powerMins, hintsOf, plausible, candidates, withoutOtherEquipment } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "Chương V. Yêu cầu kỹ thuật\n";

test("a label with a hyphen, the combustion chamber, 'Piston' and a garbled OCR label are the engine's displacement", () => {
  assert.equal(engineMins("Dung tích xy-lanh ≤ 12,5 lít").maxDisp, 12.5);               // IB2200032133
  assert.equal(engineMins("- Dung tích xy-lanh: ≥ 21.927 lít").minDisp, 21.927);        // IB2200065274
  assert.equal(engineMins("Dung tích buồng đốt\n≥ 4,4 lít").minDisp, 4.4);               // IB2200001635
  assert.equal(engineMins("+ Số xi lanh (Piston): ≥ 6;\n+ Tổng dung tích Piston: ≥ 12.78 lít;\n+ Đầy đủ các cảm biến theo động cơ;").minDisp, 12.78); // IB2600315904
  assert.equal(engineMins("Dung tích x l nh ≤ 1.5 lít Đạt Không đạt").maxDisp, 1.5);   // IB2500189935 (OCR)
  assert.equal(engineMins("Tổng dung tích xy-\n- ≥78 L\n").minDisp, 78);                  // IB2300188511
  // "Tổng dung tích" with no part, among the lines of the cylinders (IB2400503492, IB2300305099)
  assert.equal(engineMins("9   Hành trình piston         ≥ 185 mm\n10 Tổng dung tích            ≥ 19.6 lít\n11 Tỷ số nén: ≥ 15:1\n").minDisp, 19.6);
  assert.equal(engineMins("7      Tỷ số nén                               ≤17.1 : 1\n8      Tổng dung tích                          ≤11.051 lít\n9 Điều tốc Điện tử\n").maxDisp, 11.051);
  // ...but not when it is alone among other things (a tank, "Dung tích: ≥ 30 Lít" under a battery)
  assert.equal(engineMins("- Ắc quy: 24V\n- Dung tích: ≥ 30 Lít\n- Công suất: ≤2500W\n").minDisp, null);
});

test("the words of a coolant or a tank are looked for around the label, not in the whole line (IB2500456429)", () => {
  const line = "-Động cơ diesel lai: Công suất động cơ lai, 62kW; Vòng quay, 1500 vòng/phút; Đường kính xi lanh, 105mm; Hành trình piston, 124mm; Dung tích xi lanh 4,3 lít; Motor khởi động DC24V; Kiểu làm mát: Heat exchanger; Loại điều tốc: Điều tốc điện tử.";
  assert.equal(engineMins(line).minDisp, 4.3);
  // a tank of the genset (IB2500110812, IB2500110816): "Dung tích ≥ 2.000 lít" is no engine's
  assert.equal(engineMins("KÈM] Dung tích ≥ 2.000 lít + Đạt: Đáp ứng yêu\n").minDisp, null);
  // "Số xy lanh <6." is fewer than 6, not at least 6 (IB2300278731); "<3" (IB2300293753)
  assert.equal(engineMins("- Số xy lanh: <6.\n").minCyl, null);
  assert.equal(engineMins("8     Số xy lanh                               <3 yêu cầu\n").minCyl, null);
});

test("the sections of a forklift or a crane in a tender with a genset are not the genset's (IB2300230061)", () => {
  const text = ["3.2.1. Yêu cầu về kỹ thuật cụ thể cho xe nâng:", "26   Số xy lanh/dung tích xy lanh               ≥ 4/3318cm3", "28   Dung tích thùng dầu thủy lực               ≥ 58 lít",
    "3.2.2. Yêu cầu về kỹ thuật cụ thể cho máy phát điện:", "3.3    Dung tích xy-lanh          ≤ 5.9 lít", "3.2.3 Yêu cầu kỹ thuật cụ thể cho cầu trục", "- Động cơ hộp giảm tốc 0.75 kw chạy chân cầu trục", "6 xy lanh ≥ 3"].join("\n");
  const m = engineMins(text);
  assert.equal(m.minDisp, null); assert.equal(m.minCyl, null); assert.equal(m.maxDisp, 5.9);
  assert.match(withoutOtherEquipment(text), /máy phát điện/);
  assert.doesNotMatch(withoutOtherEquipment(text), /3318cm3/);
  assert.equal(withoutOtherEquipment(text).split("\n").length, text.split("\n").length, "the lines are kept");
  // The text of a tender of one genset only is as it was.
  assert.equal(withoutOtherEquipment("Yêu cầu kỹ thuật cho tổ máy phát điện\nDung tích xi lanh ≥ 9 L"), "Yêu cầu kỹ thuật cho tổ máy phát điện\nDung tích xi lanh ≥ 9 L");
});

test("a prime read only from the engine's or the alternator's section is kept only when it is the size (IB2300266461: 42 kVA for 40)", () => {
  const text = H + "I. Yêu cầu chung\n- Điện áp 400V\nII. Yêu cầu đối với động cơ\n- Kiểu 4 kỳ\nIII. Yêu cầu đối với đầu phát\n- Công suất liên tục ≥ 42 kVA\n";
  const mp = powerMins(text).minPrime;
  assert.equal(mp?.kVA, 42); assert.equal(mp?.fromOther, true);
  const h = hintsOf(text);
  assert.equal(plausible(h, { value: 40, unit: "kVA" }).minPrime, null);
  assert.equal(plausible(h, { value: 42, unit: "kVA" }).minPrime?.kVA, 42);
  // the genset's own section gives it as before
  assert.equal(powerMins(H + "I. Tổ máy phát điện\n- Công suất liên tục ≥ 400 kVA\n").minPrime?.fromOther, undefined);
  // a name before "Công suất liên tục" is not a figure of a suffix label (IB2300237033)
  assert.equal(powerMins("1 Máy phát điện 400KVA Công suất liên tục: 400 kVA Nhà thầu tự chào\nCông suất dự phòng: 440 kVA\n").minPrime?.kVA, 400);
});

test("rows left out say how many sources gave the figure (one table row alone, for the audit)", () => {
  const t = (row) => [{ n: 101, title: "Yuchai gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator | Displacement (L) |"], rows: [row] }];
  const list = [{ id: "s", country: "CN", confidence: "high", specTables: t("| S-1 | 275 | 220 | WP10D264E200 | XY274K | 9.7 |") }];
  const hints = { ...hintsOf(H + "Dung tích xy lanh ≥ 11,05 L\n50 Hz"), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] };
  const r = candidates(C.build(list), { value: 250, unit: "kVA" }, hints, { suppliers: list });
  assert.equal(r.dropped.length, 1);
  assert.equal(r.dropped[0].src.disp.sources >= 1, true);
  assert.equal(typeof r.dropped[0].src.disp.n, "number");
});
