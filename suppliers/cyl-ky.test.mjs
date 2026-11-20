// node --test suppliers/cyl-ky.test.mjs — số của "N kỳ / thì / kì / stroke / cycle" không phải số xi lanh (cyl-ky 20/11/2026):
// mẫu "Số xy lanh" + tối đa 30 ký tự không số từng nuốt tới số "4" của "4 kỳ" (IB2600217137: 45 dòng 6 xi lanh bị loại).
// Ca lấy nguyên văn từ chữ HSMT của bidhist (8 gói đổi trong lượt quét toàn bộ).
import test from "node:test";
import assert from "node:assert/strict";
import { hintsOf } from "./config-bot.mjs";

const H = (s) => hintsOf(`Chương V. Yêu cầu kỹ thuật\n${s}`);

test("số xi lanh đứng sau 'N kỳ / thì' trong cùng ô: đọc số xi lanh, không đọc số kỳ", () => {
  const cases = [
    ["Tổ máy 500KVA/400KW: Động cơ - loại, số xy lanh: Động cơ Diesel 4 kỳ, 6 xy lanh xếp thẳng hàng", 6, true], // IB2600217137
    ["Tổ máy phát điện - Động cơ: Kiểu, số xylanh: Turbocharged 4 thì, 6 xylanh thẳng hàng", 6, true], // IB2400027592
    ["Tổ máy 1000kVA: Động cơ - loại, số xi lanh: Động cơ đốt trong, 4 kỳ; 8 xy lanh thẳng hàng", 8, true], // IB2400208175
    ["Động cơ: Loại động cơ, số xilanh, bố trí: Diesel 4 thì, phun nhiên liệu trực tiếp; 16 xilanh; dạng V 60º", 16, true], // IB2300233670
    ["Máy 15kVA: Động cơ - kiểu, số xi lanh, tốc độ: Diesel 4 kỳ, 3 xilanh làm mát bằng nước kết hợp quạt", 3, true], // IB2500084609
    ["Máy 8,5 kVA: Động cơ - loại, số xilanh, tốc độ: 4 kỳ làm mát bằng nước, phun nhiên liệu trực tiếp; số xilanh ≥3; tốc độ 1500 vòng/ phút", 3, false], // IB2400125924
  ];
  for (const [s, n, exact] of cases) {
    const h = H(s);
    assert.equal(h.minCyl, n, s);
    assert.equal(h.cylExact, exact, s);
  }
});

test("các dạng số kỳ khác cũng không thành số xi lanh; số xi lanh thật vẫn đọc", () => {
  const h = H("Số xilanh: Động cơ Diesel 4 kỳ; ≥ 6 xi lanh");
  assert.equal(h.minCyl, 6);
  assert.equal(h.cylExact, false);
  assert.equal(H("Số xi lanh: diesel 2 kì, 3 xi lanh").minCyl, 3);
  assert.equal(H("Số xi lanh: 4 xi lanh thẳng hàng").minCyl, 4);
  assert.equal(H("Số xilanh: ≥ 6").minCyl, 6);
  // chữ bắt đầu bằng "th" / "k" ngay sau số mà không phải "thì" / "kỳ" không bị chặn
  assert.equal(H("Số xi lanh: 6 thẳng hàng").minCyl, 6);
});
