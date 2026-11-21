// Ngưỡng của gói nhiều cỡ: dòng tự ghi tên máy thuộc đúng cỡ đó dù đứng trong khối khác; "không ít hơn N xi lanh" là tối thiểu.
// Các dòng theo mẫu chữ HSMT thật (IB2400114476, IB2300260615, IB2300108940, IB2300305914).
import test from "node:test";
import assert from "node:assert/strict";
import { minsForSize, engineMins, powerMins } from "./config-bot.mjs";

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

test("IB2400377239: một máy, liên tục 400 / dự phòng 450 bị tách hai cỡ: cỡ 400 giữ ngưỡng 400", () => {
  const sizes = [size(400), size(450)];
  const t = ["Tổ máy 450 kVA - Động cơ: công suất dự phòng: Công suất dự phòng tối thiểu 450 kVA", "Tổ máy 450 kVA - Động cơ: công suất liên tục: Công suất liên tục tối thiểu 400 kVA"].join("\n");
  assert.equal(minsForSize(t, sizes[0], sizes).mins.minPrime?.kVA, 400);
  assert.equal(minsForSize(t, sizes[1], sizes).mins.minPrime, null);
});
test("hai cỡ thật: công suất của cỡ khác không thành ngưỡng khi không có câu dự phòng", () => {
  const sizes = [size(400), size(450)];
  const t = ["Tổ máy 450 kVA: đầu phát: Công suất liên tục ≥ 400 kVA"].join("\n");
  assert.equal(minsForSize(t, sizes[0], sizes).mins.minPrime, null);
});
test("IB2300245748#2: số của đầu phát không làm mất công suất của tổ máy", () => {
  const sizes = [size(8.5), size(10), size(12)];
  const t = ["Phần A - Máy 8.5 kVA: Công suất: Công suất liên tục ≥ 8.5 kVA", "Phần B - Máy 10.0 kVA: Công suất: Công suất liên tục ≥ 10.5 ±0.5 kVA", "Phần C - Máy 12 kVA: Công suất: Công suất liên tục ≥ 12.5 ±0.5 kVA; công suất tối đa ≥ 13.2 kVA", "Phần C - Máy 12 kVA: Đầu phát: 1 pha 2 dây, 220-230 VAC, 50 Hz; công suất liên tục ≥ 15 KVA tại 40oC Class H"].join("\n");
  assert.equal(minsForSize(t, sizes[2], sizes).mins.minPrime?.kVA, 12);
});
test("IB2300046353#1: 'tối đa' của số khác không làm mất dung tích; dung tích thùng không tính", () => {
  assert.equal(engineMins("Máy 20 kVA 3 pha: Động cơ - loại và thông số: Diesel, 4 kỳ, phun nhiên liệu trực tiếp; dung tích > 1,950 lít; công suất liên tục ≥ 19.1 KW; công suất tối đa ≥ 28.6 HP; 1.500 vòng/phút; hành trình ≥ 92 mm").minDisp, 1.95);
  assert.equal(engineMins("Thùng nhiên liệu: đặt bên trong vỏ cách âm, có khóa; dung tích ≥ 65 lít; tiêu thụ tối đa ≤ 4,9 lít/giờ; đường kính ống 20 mm").minDisp, null);
});
test("IB2300046353#1: 'tối đa' của số khác không làm mất '4 xilanh' ghi trơ; 'tối đa' của chính số xi lanh thì không phải tối thiểu", () => {
  const e = engineMins("Máy 20 kVA 3 pha: Động cơ - loại và thông số: Diesel, 4 kỳ, phun nhiên liệu trực tiếp; dung tích > 1,950 lít; công suất liên tục ≥ 19.1 KW; công suất tối đa ≥ 28.6 HP; 1.500 vòng/ phút; 4 xilanh thẳng hàng; tỷ số nén ≥ 18.9:1");
  assert.equal(e.minCyl, 4);
  assert.equal(e.cylExact, false);
  assert.equal(engineMins("Động cơ: Diesel 4 kỳ; ≤ 3 xi lanh thẳng hàng").minCyl, null);
  assert.equal(engineMins("Động cơ: Diesel 4 kỳ; tối đa 3 xi lanh thẳng hàng").minCyl, null);
});
test("IB2300349583#0: mức 'Nâng cao (lựa chọn)' không phải ngưỡng, lấy mức bắt buộc", () => {
  const m = powerMins("Động cơ: Tiêu hao nhiên liệu: Tối thiểu (bắt buộc): ≤ 7,5 lít/giờ ở 100% tải liên tục, ≤ 5,5 lít/giờ ở 75% tải liên tục. Nâng cao (lựa chọn): ≤ 4,5 lít/giờ ở 75% tải liên tục");
  assert.equal(m.maxFuel, 7.5);
  assert.equal(m.maxFuel75, 5.5);
});
test("IB2500403535#0: 'tối đa ≥ 12 KW' không làm mất '≥ 3 xilanh'", () => {
  const e = engineMins("Máy 8,5 kVA: Động cơ: Dầu Diesel; 4 kỳ làm mát bằng nước; công suất liên tục ≥ 10 kW, tối đa ≥ 12 KW tại 1500 vòng/phút; ≥ 3 xilanh thẳng hàng; điều tốc điện tử.");
  assert.equal(e.minCyl, 3);
  assert.equal(e.cylExact, false);
});
test("dung sai ghi ngay sau ngưỡng được tính (Khoa 21/11/2026)", () => {
  const sizes = [size(8.5), size(12.5)];
  const t = ["Máy 8,5 kVA: Công suất liên tục: ≥ 8.5 KVA ± 0.5", "Máy 12,5 kVA: Công suất liên tục: ≥ 12.5 ± 0.5 KVA"].join("\n");
  assert.equal(minsForSize(t, sizes[0], sizes).mins.minPrime?.kVA, 8);
  assert.equal(engineMins("Động cơ: số xy lanh ≤ 3 và tổng dung tích xy lanh ≤ 1,3 lít ± 5%.").maxDisp, 1.365);
  assert.equal(engineMins("Dung tích xi lanh ≤ 1,3 lít; dung sai điện áp ± 5%").maxDisp, 1.3);
});

test("IB2300296794: chữ tự ghi bản gốc là '+ 1%' thì không hạ ngưỡng", () => {
  assert.equal(powerMins('Tổ máy: Công suất liên tục: 20 kVA ± 1% (văn bản ghi "+ 1%")').minPrime?.kVA, 20);
  assert.equal(powerMins("Tổ máy: Công suất liên tục: 20 kVA ± 1%").minPrime?.kVA, 19.8);
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
