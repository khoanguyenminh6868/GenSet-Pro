// Trang khổ quá lớn (IB2600576655 e46, 20/11/2026) và ghi chú khi OCR lỗi: phần thuần.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
const O = req("../genbid-hsmt/ocr-pdf.js"), P = req("../genbid-hsmt/sync-pure.js");
const px = (w, h, d) => (w / 72 * d) * (h / 72 * d);

test("renderDpi (dpi cho lần thử thứ hai): trang thường giữ 250", () => {
  assert.equal(O.renderDpi(595, 842), 250);          // A4
  assert.equal(O.renderDpi(2384, 3370) < 250, true);  // A0 đứng 97 triệu điểm ảnh: chỉ dùng cho lần thử thứ hai
  assert.equal(O.renderDpi(1412, 1996), 250);
});
test("renderDpi: trang 4915 x 2326 pt (e46) hạ dpi để ảnh ≤ trần điểm ảnh", () => {
  const d = O.renderDpi(4915.2, 2325.96);
  assert.equal(d < 250, true);
  assert.equal(d, 150);
  assert.equal(px(4915.2, 2325.96, d) <= O.RETRY_PIXELS, true);
  assert.equal(px(4915.2, 2325.96, 250) > O.RETRY_PIXELS, true);
});
test("renderDpi: biên đúng trần giữ nguyên; quá trần một chút hạ; không bao giờ dưới 72; khổ lạ giữ 250", () => {
  const w = Math.sqrt(O.RETRY_PIXELS) * 72 / 250;       // vuông, đúng trần
  assert.equal(O.renderDpi(w * 0.9999, w * 0.9999), 250);
  assert.equal(O.renderDpi(w * 1.01, w * 1.01) < 250, true);
  assert.equal(O.renderDpi(100000, 100000), 72);
  for (const [a, b] of [[0, 100], [NaN, 100], [-5, 5], [undefined, undefined]]) assert.equal(O.renderDpi(a, b), 250);
});
test("ocrFailNote: nêu lỗi ngắn; không có lỗi vẫn có câu", () => {
  assert.equal(P.ocrFailNote("libpng error: Read Error"), "OCR lỗi (libpng error: Read Error), chưa đọc");
  assert.equal(P.ocrFailNote(""), "OCR lỗi, chưa đọc");
  assert.equal(P.ocrFailNote("a\n  b"), "OCR lỗi (a b), chưa đọc");
  assert.equal(P.ocrFailNote("x".repeat(500)).length < 130, true);
});
