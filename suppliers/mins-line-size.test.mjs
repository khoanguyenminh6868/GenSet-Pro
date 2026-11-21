// Ngưỡng của gói nhiều cỡ: dòng tự ghi tên máy thuộc đúng cỡ đó dù đứng trong khối khác; "không ít hơn N xi lanh" là tối thiểu.
// Các dòng theo mẫu chữ HSMT thật (IB2400114476, IB2300260615, IB2300108940, IB2300305914).
import test from "node:test";
import assert from "node:assert/strict";
import { minsForSize, engineMins } from "./config-bot.mjs";

const size = (v) => ({ kva: v, cap: { value: v, unit: "kVA" }, label: `${v} kVA` });

test("dòng 'Máy 12 kVA' đứng trong khối 45 kVA không thành ngưỡng của 45 kVA", () => {
  const sizes = [size(12), size(45)];
  const t = [
    "Máy phát điện 12 kVA",
    "Công suất liên tục ≥ 12 kVA",
    "Máy phát điện 45 kVA",
    "Công suất liên tục ≥ 45 kVA",
    "Máy 12 kVA/1 pha: Động cơ - xi lanh: ≥ 3 xi lanh thẳng hàng; tổng dung tích ≤ 1,826 lít",
    "Máy 45 kVA/3 pha: Động cơ - xi lanh: ≥ 4 xi lanh thẳng hàng; tổng dung tích ≥ 4,5 lít",
  ].join("\n");
  const big = minsForSize(t, sizes[1], sizes).mins, small = minsForSize(t, sizes[0], sizes).mins;
  assert.equal(big.maxDisp, null);
  assert.equal(big.minDisp, 4.5);
  assert.equal(big.minCyl, 4);
  assert.equal(small.maxDisp, 1.826);
});

test("dòng 'Phần 1 - Máy 500 kVA' trong khối 2000 kVA thuộc 500 kVA", () => {
  const sizes = [size(500), size(2000)];
  const t = ["Máy phát điện 500 kVA", "Công suất liên tục ≥ 500 kVA", "Máy phát điện 2000 kVA", "Công suất liên tục ≥ 2000 kVA", "Phần 1 - Máy 500 kVA: Động cơ - dung tích xi lanh: < 20 lít"].join("\n");
  assert.equal(minsForSize(t, sizes[1], sizes).mins.maxDisp, null);
  assert.equal(minsForSize(t, sizes[0], sizes).mins.maxDisp, 20);
});

test("số ghi mức dự phòng của cỡ (Máy 11 kVA của cỡ 10) vẫn về đúng cỡ đó", () => {
  const sizes = [size(10), size(20)];
  const t = ["Máy phát điện 20 kVA", "Công suất liên tục ≥ 20 kVA", "Mục 1 - Máy 20/22 kVA: Động cơ - dung tích xilanh: ≥ 2.197 L", "Mục 2 - Máy 11 kVA/11 kW: Động cơ - số xy lanh: 2 xi lanh"].join("\n");
  const big = minsForSize(t, sizes[1], sizes).mins;
  assert.equal(big.minCyl, null);
  assert.equal(big.minDisp, 2.197);
  assert.equal(minsForSize(t, sizes[0], sizes).mins.minCyl, 2);
});

test("dòng không ghi tên máy vẫn theo khối như cũ", () => {
  const sizes = [size(100), size(200)];
  const t = ["Máy phát điện 100 kVA", "Công suất liên tục ≥ 100 kVA", "Số xi lanh: ≥ 4", "Máy phát điện 200 kVA", "Công suất liên tục ≥ 200 kVA", "Số xi lanh: ≥ 6"].join("\n");
  assert.equal(minsForSize(t, sizes[0], sizes).mins.minCyl, 4);
  assert.equal(minsForSize(t, sizes[1], sizes).mins.minCyl, 6);
});

test("dung tích của thùng nhiên liệu (cùng vế câu) không thành dung tích xi lanh", () => {
  assert.equal(engineMins("Phần A - Máy 8.5 kVA: Thùng nhiên liệu, thời gian vận hành: Thùng thép đặt trong vỏ cách âm, dung tích ≥ 55 lít").minDisp, null);
  assert.equal(engineMins("Máy 30 kVA - Động cơ: xilanh: ≥ 4 xilanh, thẳng hàng; dung tích ≥ 2,54 lít").minDisp, 2.54);
});

test("'Không ít hơn 1 xilanh' là tối thiểu, số trơ vẫn là số chính xác", () => {
  const a = engineMins("Động cơ: Số xilanh: Không ít hơn 1 xilanh.");
  assert.equal(a.minCyl, 1);
  assert.equal(a.cylExact, false);
  assert.equal(engineMins("Động cơ: Số xilanh: Không dưới 4 xi lanh").cylExact, false);
  assert.equal(engineMins("Động cơ: Số xi lanh: 6 xi lanh").cylExact, true);
});
