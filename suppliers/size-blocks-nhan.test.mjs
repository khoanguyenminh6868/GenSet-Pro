// Ngưỡng gói nhiều cỡ theo nhãn cỡ máy, và số xi lanh / dung tích ghi trong câu dài. Các dòng theo mẫu chữ HSMT thật.
import test from "node:test";
import assert from "node:assert/strict";
import { minsForSize, engineMins } from "./config-bot.mjs";

const size = (v) => ({ kva: v, cap: { value: v, unit: "kVA" }, label: `${v} kVA` });

test("IB2400365165: nhãn 'Máy xăng' / 'Máy diesel' xếp dòng về đúng cỡ", () => {
  const sizes = [size(7.2), size(12.5)];
  const t = ["Máy xăng 7.2 kVA: Nhiên liệu: Bình nhiên liệu 25 lít; tiêu thụ ≤ 4.25 lít/giờ tại 75% tải định mức", "Máy diesel 12.5 kVA: Mức tiêu thụ nhiên liệu: ≤ 4 lít/giờ tại 75% tải định mức; ≤ 4,5 lít/giờ tại 100% tải định mức"].join("\n");
  const a = minsForSize(t, sizes[0], sizes).mins, b = minsForSize(t, sizes[1], sizes).mins;
  assert.equal(a.maxFuel75, 4.25);
  assert.equal(a.maxFuel, null);
  assert.equal(b.maxFuel75, 4);
  assert.equal(b.maxFuel, 4.5);
});

test("IB2300134577: dòng 'Cả 3 loại máy' áp cho mọi cỡ", () => {
  const sizes = [size(50), size(100)];
  const t = ["Máy 50 kVA: Công suất liên tục ≥ 50 kVA", "Máy 100 kVA: Công suất liên tục ≥ 100 kVA", "Cả 2 loại máy: Động cơ - số xilanh: ≥ 3"].join("\n");
  assert.equal(minsForSize(t, sizes[0], sizes).mins.minCyl, 3);
  assert.equal(minsForSize(t, sizes[1], sizes).mins.minCyl, 3);
});

test("IB2400495696: cỡ có dòng mang tên mình mà không nêu xi lanh thì không mượn số của cỡ khác", () => {
  const sizes = [size(30), size(100), size(200)];
  const t = ["Máy 30 kVA - Động cơ: ≥4 xi lanh thẳng hàng", "Máy 100 kVA - Động cơ: ≥4 xi lanh thẳng hàng", "Máy 200 kVA - Đầu phát: công suất liên tục ≥200 kVA"].join("\n");
  assert.equal(minsForSize(t, sizes[2], sizes).mins.minCyl, null);
  assert.equal(minsForSize(t, sizes[0], sizes).mins.minCyl, 4);
});

test("IB2300163186: 'làm mát' ở vế câu trước không biến dung tích xi lanh thành dung tích bình", () => {
  assert.equal(engineMins("Máy 100 kVA: Động cơ: 4 thì, diesel; >= 4 xy lanh thẳng hàng; turbo, làm mát khí nạp bằng khí làm mát; 1.500 vòng/phút; dung tích xy lanh >4,087 lít; bộ điều tốc điện tử").minDisp, 4.087);
  assert.equal(engineMins("Bình nhiên liệu đặt trong khung; dung tích ≥ 65 lít").minDisp, null);
  assert.equal(engineMins("Dung tích nước làm mát 6 lít").minDisp, null);
});

test("số xi lanh ghi trơ cạnh 'đường kính ≤' là tối thiểu; '≤ N xi lanh' và 'N hoặc M xi lanh' thì không", () => {
  const e = engineMins("Máy 150 kVA: Động cơ - loại, xy-lanh: Động cơ đốt trong 4 kỳ; 6 xy lanh xếp thẳng; đường kính xy lanh ≤ 105 mm; khoảng chạy xy lanh ≤ 135 mm");
  assert.equal(e.minCyl, 6);
  assert.equal(e.cylExact, false);
  assert.equal(engineMins("Động cơ: Diesel 4 kỳ; ≤ 3 xi lanh thẳng hàng; đường kính ≤ 105 mm").minCyl, null);
  assert.equal(engineMins("Động cơ: Diesel 4 kỳ; 6 hoặc 8 xi lanh; đường kính ≤ 105 mm").minCyl, null);
});

test("IB2500114642: 'hoặc tương đương' của hãng không làm mất số xi lanh", () => {
  assert.equal(engineMins("Hạng mục 3 - Máy 250 kVA/200 kW: Động cơ: Động cơ CUMMINS hoặc tương đương; diesel 4 kỳ nối đầu phát bằng khớp nối trục; 6 xylanh; tần số 50HZ").minCyl, 6);
});
