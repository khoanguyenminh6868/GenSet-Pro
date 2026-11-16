// node --test suppliers/*.test.mjs — hints-audit.mjs: so ngưỡng code đọc với Phân tích (Khoa 2026-11-17, IB2600603983).
import test from "node:test";
import assert from "node:assert/strict";
import { auditHints, analysisFuel, analysisCyl } from "./hints-audit.mjs";
import { hintsOf } from "./config-bot.mjs";

// Dòng thật của hai bản Phân tích IB2600603983 (Opus gộp một dòng, Fable cũng vậy; bản cũ tách ba dòng).
const one = [{ item: "Tiêu hao nhiên liệu", requirement: "100% tải: ≤ 156 lít/giờ; 70% tải: ≤ 113 lít/giờ; 50% tải: ≤ 77 lít/giờ" },
  { item: "Động cơ – kết cấu", requirement: "Diesel 4 kỳ, làm mát bằng nước; 6 xy lanh thẳng hàng; tốc độ ≤ 1500 vòng/phút" }];
const three = [{ item: "Tiêu hao nhiên liệu ở 100% tải", requirement: "≤ 156 lít/giờ" }, { item: "Tiêu hao nhiên liệu ở 70% tải", requirement: "≤ 113 lít/giờ" },
  { item: "Tiêu hao nhiên liệu ở 50% tải", requirement: "≤ 77 lít/giờ" }, { item: "Động cơ - số xylanh", requirement: "6 xy lanh, bố trí thẳng hàng" }];
const sets = [{ qty: 2, primeKva: 700, standbyKva: null, primeKw: null }];

test("analysisFuel: mức tiêu hao theo mức tải, dòng gộp và dòng tách", () => {
  assert.deepEqual(analysisFuel(one), { 100: [156], 70: [113], 50: [77] });
  assert.deepEqual(analysisFuel(three), { 100: [156], 70: [113], 50: [77] });
  assert.deepEqual(analysisFuel([{ item: "Suất tiêu hao nhiên liệu", requirement: "≤ 215 g/kWh" }]), {});
  assert.deepEqual(analysisCyl(one), [6]); assert.deepEqual(analysisCyl(three), [6]);
});

test("lỗi IB2600603983: code đọc 113 L/h (dòng 70% tải) làm mức 100% tải → báo lệch, nêu mức tải bị lấy nhầm", () => {
  const bad = { maxFuel: 113, maxFuel75: null, maxFuel50: null, minCyl: 6, minPrime: { kVA: 700 } };
  for (const specs of [one, three]) {
    const f = auditHints(bad, { technicalSpecs: specs, generatorSets: sets });
    const lech = f.filter((x) => x.level === "lech");
    assert.deepEqual(lech.map((x) => [x.field, x.code]), [["maxFuel", 113]]);
    assert.match(lech[0].why, /70% tải/);
  }
});

test("code đọc đúng (156 / 77, 700 kVA, 6 xi lanh): không lệch; mức 70% tải không có khoá nên không báo", () => {
  const ok = { maxFuel: 156, maxFuel75: null, maxFuel50: 77, minCyl: 6, minPrime: { kVA: 700 } };
  assert.deepEqual(auditHints(ok, { technicalSpecs: one, generatorSets: sets }), []);
});

test("công suất và số xi lanh khác Phân tích → lệch; Phân tích có mà code không đọc → thiếu", () => {
  const f = auditHints({ maxFuel: 156, maxFuel50: 77, minCyl: 12, minPrime: { kVA: 770 } }, { technicalSpecs: one, generatorSets: sets });
  assert.deepEqual(f.map((x) => [x.field, x.level]), [["minPrime", "lech"], ["minCyl", "lech"]]);
  const g = auditHints({}, { technicalSpecs: one, generatorSets: sets });
  assert.deepEqual(g.map((x) => [x.field, x.level]), [["maxFuel", "thieu"], ["maxFuel50", "thieu"], ["minPrime", "thieu"], ["minCyl", "thieu"]]);
  // Hai cỡ máy trong Phân tích: không so công suất.
  assert.deepEqual(auditHints({ minPrime: { kVA: 100 } }, { technicalSpecs: [], generatorSets: [{ primeKva: 100 }, { primeKva: 250 }] }), []);
});

test("nối với hintsOf thật trên đoạn bảng của IB2600603983 (đã sửa ở PR 820): không lệch", () => {
  const text = ["Chương V. Yêu cầu kỹ thuật", "5     Công suất liên tục                 kVA         ≥ 700", "12    Tiêu hao nhiên liệu",
    " +    Tiêu hao nhiên liệu ở                       ≤ 156 lít/giờ", "      mức 100% tải", " +    Tiêu hao nhiên liệu ở                       ≤ 113 lít/giờ", "      mức 70% tải",
    " +    Tiêu hao nhiên liệu ở                        ≤ 77 lít/giờ", "      mức 50% tải", "12    Số xilanh                          6 xy lanh, bố trí thẳng hàng"].join("\n");
  assert.deepEqual(auditHints(hintsOf(text, ""), { technicalSpecs: three, generatorSets: sets }).filter((x) => x.level === "lech"), []);
});
