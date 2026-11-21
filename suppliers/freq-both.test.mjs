// node --test suppliers/freq-both.test.mjs — HSMT ghi CẢ HAI tần số = không ràng buộc (freq null), Khoa 20/11/2026.
// Ca lấy từ chữ HSMT thật trong bidhist (1.259 gói): IB2400073761 "50 & 60hz", IB2200058001 "50/60Hz", IB2500240059 "50 / 60Hz",
// IB2400270596 "50-60Hz" ...; và ca "MỘT tần số" không được đổi.
import test from "node:test";
import assert from "node:assert/strict";
import { freqOfHsmt, hintsOf } from "./config-bot.mjs";

const both = [
  "Máy 250 kVA (STT 1): Tần số: 50 & 60hz Máy 250 kVA (STT 1): Số pha: 3 pha 4 dây",   // IB2400073761
  "tần số 50/60Hz. Bộ điều khiển: Nội dung",                                           // IB2200058001
  "tần số máy phát 50 / 60Hz; cảm biến tốc độ",                                         // IB2500240059
  "Điện áp đầu vào 100-240V AC, 50-60Hz. Hạng mục 10",                                  // IB2400270596
  "100 ÷240VAC/0,75A/50/60Hz Hạng mục 1",                                               // IB2400454375
  "Tần số: 50 – 60 Hz",
  "Tần số: 50 hoặc 60 Hz",
  "Tần số 50 và 60 Hz",
  "Frequency: 50 Hz or 60 Hz",
  "Tần số: 50Hz-60",                                                                     // Hz ở một phía
  "Tần số: 50Hz/60Hz",                                                                   // đã là hai chữ Hz (như cũ)
];
for (const t of both) test(`hai tần số → null: ${t.slice(0, 40)}`, () => {
  assert.equal(freqOfHsmt(t), null);
  assert.equal(hintsOf(t).freq, null);
});

const one = [
  ["Tần số: 50Hz", 50], ["tần số 50 Hz; 3 pha", 50], ["Tần số: 60Hz", 60], ["tần số 60 Hz", 60],
  ["Máy phát điện 380V-50Hz-60/66 kVA; công suất liên tục 60", 50],   // IB2600006758: 60 là kVA, không phải Hz
  ["Máng cáp 50/60x100x2000 mm", null], ["bảo vệ 50, 50N, 51, 51N, 27, 59, 81", null], ["Máy 50-60 kVA, tần số 50Hz", 50],
  ["đầu cốt 3 x 95 + 1 x 50; 60 đầu cốt", null], ["", null],
];
for (const [t, want] of one) test(`một tần số / không tần số không đổi: ${t.slice(0, 40) || "(rỗng)"} → ${want}`, () => assert.equal(freqOfHsmt(t), want));
