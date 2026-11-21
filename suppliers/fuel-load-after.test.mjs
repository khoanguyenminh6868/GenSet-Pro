// Tiêu hao HSMT: mức tải đứng SAU số, trong cùng vế câu, là mức tải của số đó (không lấy "100%" của vế trước). Mức tải đứng TRƯỚC số giữ nguyên.
// Chữ theo các dòng HSMT thật.
import test from "node:test";
import assert from "node:assert/strict";
import { powerMins } from "./config-bot.mjs";

const fuel = (t) => { const m = powerMins(t); return [m.maxFuel ?? null, m.maxFuel75 ?? null, m.maxFuel50 ?? null]; };

test("IB2400062394#0: ≤ 12 l/h (100%), ≤ 9 l/h (75%)", () => {
  assert.deepEqual(fuel("Máy 50 kVA - Động cơ: tiêu thụ nhiên liệu: ≤ 12 l/h tại 40 kW (100% tải); ≤ 9 l/h tại 30 kW (75% tải); quy đổi theo công thức"), [12, 9, null]);
});
test("IB2400062394#1: ≤ 23 l/h (100%), ≤ 17 l/h (75%)", () => {
  assert.deepEqual(fuel("Máy 100 kVA - Động cơ: tiêu thụ nhiên liệu: ≤ 23 l/h tại 80 kW (100% tải); ≤ 17 l/h tại 60kW (75% tải)"), [23, 17, null]);
});
test("IB2600562009#0: ≤ 7,5 l/h (100%), ≤ 5,4 l/h (75%)", () => {
  assert.deepEqual(fuel("Máy 30 kVA: Mức tiêu thụ nhiên liệu: ≤ 7,5 l/h tại 24 kW (100% tải định mức); ≤ 5,4 l/h tại 18 kW (75% tải định mức)"), [7.5, 5.4, null]);
});
test("IB2300190927#0: 24 / 18 / 13 ở 100 / 75 / 50%", () => {
  assert.deepEqual(fuel("Phần 1 - Máy 100 kVA: Tiêu hao nhiên liệu: Tại 100 kVA prime: < 24 lít/giờ (100% tải); < 18.0 lít/giờ (75% tải); < 13.0 lít/giờ (50% tải)."), [24, 18, 13]);
});
test("IB2300190927#1: 34 / 26 / 18 ở 100 / 75 / 50%", () => {
  assert.deepEqual(fuel("Phần 2 - Máy 150 kVA: Tiêu hao nhiên liệu: Tại 150 kVA prime: < 34 lít/giờ (100% tải); < 26.0 lít/giờ (75% tải); < 18 lít/giờ (50% tải)."), [34, 26, 18]);
});

test("mức tải sau số viết 'ở tải N% định mức' hoặc chỉ '(N%)' / 'ở N%'", () => {
  assert.deepEqual(fuel("Mức tiêu thụ nhiên liệu: ≤ 7,5 l/h (tại 24 kW) ở tải 100% định mức; ≤ 5,4 l/h (tại 18kW) ở tải 75% định mức"), [7.5, 5.4, null]);
  assert.deepEqual(fuel("Mức tiêu hao nhiên liệu: 58.1 lít/giờ ở 100% công suất định mức; 43.6 lít/giờ ở 75%; 30.0 lít/giờ ở 50%"), [58.1, 43.6, 30]);
  assert.deepEqual(fuel("Tiêu thụ nhiên liệu: ≤ 3.5 L/h (100% tải liên tục); ≤ 3,2 L/h (75%); ≤ 2,5 L/h (50%); ≤ 2 L/h (25%)."), [3.5, 3.2, 2.5]);
});

test("mức tải đứng TRƯỚC số: không đổi", () => {
  assert.deepEqual(fuel("Tiêu hao nhiên liệu: 100% tải ≤ 4.93 lít/h (68A); 75% tải ≤ 3,61 lít/h (51A); 50% tải ≤ 2,7 lít/h (34A)"), [4.93, 3.61, 2.7]);
  assert.deepEqual(fuel("Suất tiêu hao nhiên liệu: Tại 50% tải ≤251.8 lít/giờ; 75% tải ≤370.0 lít/giờ; 100% tải ≤503.2 lít/giờ"), [503.2, 370, 251.8]);
  assert.deepEqual(fuel("Mức tiêu thụ ở công suất liên tục, tiêu thụ nhiên liệu: 100% tải ≤ 3,2 lít/giờ, 75% tải ≤ 2,2 lít/giờ"), [3.2, 2.2, null]);
});

test("luật 100% công suất dự phòng giữ nguyên (tính như 100% tải)", () => {
  assert.deepEqual(fuel("Động cơ - tiêu hao nhiên liệu: Tại 100% công suất dự phòng ≤ 34 L/hr; tại 75% ≤ 25 L/hr; tại 50% ≤ 18 L/hr."), [34, 25, 18]);
});

test("IB2500403535: hai số cùng mức tải MRQ / RQ → lấy số RQ (Khoa 21/11/2026)", () => {
  assert.deepEqual(fuel("Tiêu hao nhiên liệu: ≤ 3,3 lít/giờ tại 100% tải định mức (MRQ); ≤ 2,6 lít/giờ tại 75% tải (MRQ); ≤ 2.5 lít/giờ tại 75% tải (RQ)."), [3.3, 2.5, null]);
  assert.deepEqual(fuel("Tiêu hao nhiên liệu: ≤ 4,5 lít/giờ tại 100% tải định mức (MRQ); ≤ 4 lít/giờ tại 75% tải (MRQ); ≤ 3,5 lít/giờ tại 75% tải (RQ)."), [4.5, 3.5, null]);
});
test("hai số cùng mức tải không có nhãn RQ: vẫn không có ngưỡng", () => {
  assert.equal(fuel("Tiêu hao nhiên liệu: ≤ 2,6 lít/giờ tại 75% tải (MRQ); ≤ 2,4 lít/giờ tại 75% tải (MRQ).")[1], null);
  assert.equal(fuel("Tiêu hao nhiên liệu: ≤ 2,6 lít/giờ tại 75% tải; ≤ 2,5 lít/giờ tại 75% tải.")[1], null);
  assert.equal(fuel("Tiêu hao nhiên liệu: ≤ 5,5 lít/giờ tại 75% tải (bắt buộc); ≤ 4,5 lít/giờ tại 75% tải (nâng cao).")[1], null);
  assert.equal(fuel("Tiêu hao nhiên liệu: ≤ 2,6 lít/giờ tại 75% tải; ≤ 2,5 lít/giờ tại 75% tải (RQ).")[1], null);
});
test("một số có nhãn MRQ: giữ số đó", () => {
  assert.equal(fuel("Tiêu hao nhiên liệu: ≤ 2,6 lít/giờ tại 75% tải (MRQ).")[1], 2.6);
});

test("số ± % sau số không phải mức tải", () => {
  assert.equal(fuel("Tiêu hao nhiên liệu ở 100% tải ≤ 20 lít/giờ (sai số 5%)")[0], 20);
  assert.equal(fuel("Tiêu hao nhiên liệu ở 100% tải ≤ 20 lít/giờ (sai số 10%)")[0], 20);
});
