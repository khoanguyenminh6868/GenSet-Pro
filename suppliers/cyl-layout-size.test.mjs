// Bố trí xi lanh của gói nhiều cỡ đọc theo phần của từng cỡ. Các dòng theo mẫu chữ HSMT thật (IB2300162912).
import test from "node:test";
import assert from "node:assert/strict";
import { minsForSize, hintsOf, cylLayoutOf } from "./config-bot.mjs";

const size = (v) => ({ kva: v, cap: { value: v, unit: "kVA" }, label: `${v} kVA` });

test("IB2300162912: 'chữ V' của máy 2.500 kVA không áp cho máy 750 kVA", () => {
  const sizes = [size(750), size(2500)];
  const t = ["Máy 750 kVA: Công suất liên tục ≥ 750 kVA", "Máy 2500 kVA: Công suất liên tục ≥ 2500 kVA", "Máy 2500 kVA: Động cơ: ≥ 12 xi lanh bố trí chữ V"].join("\n");
  assert.equal(minsForSize(t, sizes[0], sizes).mins.cylLayout, null);
  assert.equal(minsForSize(t, sizes[1], sizes).mins.cylLayout, "v");
  assert.equal(hintsOf(t, "", { size: sizes[0], sizes }).cylLayout, null);
  assert.equal(hintsOf(t, "", { size: sizes[1], sizes }).cylLayout, "v");
});

test("mỗi cỡ ghi một kiểu: mỗi cỡ giữ kiểu của mình (đọc cả chữ thì mất cả hai)", () => {
  const sizes = [size(300), size(1000)];
  const t = ["Máy 300 kVA: Động cơ: 6 xi lanh thẳng hàng", "Máy 1000 kVA: Động cơ: 12 xi lanh chữ V"].join("\n");
  assert.equal(cylLayoutOf(t), null);
  assert.equal(minsForSize(t, sizes[0], sizes).mins.cylLayout, "inline");
  assert.equal(minsForSize(t, sizes[1], sizes).mins.cylLayout, "v");
});

test("dòng 'Cả N loại máy' nêu bố trí: áp cho mọi cỡ", () => {
  const sizes = [size(50), size(100)];
  const t = ["Máy 50 kVA: Công suất liên tục ≥ 50 kVA", "Máy 100 kVA: Công suất liên tục ≥ 100 kVA", "Cả 2 loại máy: Động cơ: xi lanh thẳng hàng"].join("\n");
  assert.equal(minsForSize(t, sizes[0], sizes).mins.cylLayout, "inline");
  assert.equal(minsForSize(t, sizes[1], sizes).mins.cylLayout, "inline");
});

test("gói một cỡ vẫn đọc cả chữ như cũ", () => {
  assert.equal(hintsOf("Động cơ: 6 xi lanh thẳng hàng").cylLayout, "inline");
  assert.equal(hintsOf("Động cơ: xi lanh thẳng hàng hoặc xi lanh chữ V").cylLayout, null);
});
