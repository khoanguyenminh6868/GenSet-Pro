// node --test suppliers/*.test.mjs — a displacement minimum with a plus-or-minus ("12,9 L (± 3%)") is that much lower
// (2026-11-12 soát ngưỡng: IB2300087393 asked 12,9 L (± 3%) and the 12,78 L engines were left out).
import test from "node:test";
import assert from "node:assert/strict";
import { hintsOf } from "./config-bot.mjs";

test("minDisp: a ± N% after the figure lowers the minimum by N%", () => {
  assert.equal(hintsOf("+ Tổng dung tích xylanh: 12,9 L (± 3%)\n+ Dung tích dầu bôi trơn: 35 L (± 3%)").minDisp, 12.513);
  assert.equal(hintsOf("11 Tổng dung tích xy lanh ≥ 1,3 (lít) ± 5%").minDisp, 1.235);
  assert.equal(hintsOf("Dung tích xi lanh ≥ 4,5 lít +/- 2%").minDisp, 4.41);
});

test("minDisp: no tolerance, no change", () => {
  assert.equal(hintsOf("Dung tích xi lanh ≥ 11,05 L").minDisp, 11.05);
  assert.equal(hintsOf("Dung tích xylanh ≥ 2300 cc").minDisp, 2.3);
  assert.equal(hintsOf("Dung tích xilanh ≥ 2,3 lít\nCông suất 12 kVA ± 5%").minDisp, 2.3);
});
