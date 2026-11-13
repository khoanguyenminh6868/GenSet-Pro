// The parts of ocr-pdf.js that need neither Tesseract nor Poppler: which pages are scans or broken fonts (Khoa 04/11:
// 17 of 969 PDFs), how legible an OCR reading is (pages scanned sideways, 10/11), finding chapter V in a whole scanned
// HSMT from the page tops (IB2400056128: Chương V on pages 85–96 of 114), and turning a PGM page.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
const O = createRequire(import.meta.url)("../genbid-hsmt/ocr-pdf.js");
const rep = (s, n) => Array.from({ length: n }, () => s).join(" ");

test("lớp chữ hỏng phông: phông TCVN3 ('Yªu cÇu kü thuËt') là hỏng (> 5% ký tự lạ, ≥ 300 ký tự)", () => {
  assert.equal(O.garbled(rep("Yªu cÇu kü thuËt cña m¸y ph¸t ®iÖn", 20)), true);
});
test("phông vỡ kiểu '3456ÿ89ÿ ÿ' (ví dụ trong chú thích, IB2500127205) là hỏng", { todo: "garbled() tách dấu (NFD) trước khi đếm: 'ÿ' thành 'y' + dấu kết hợp (được phép) nên chuỗi chỉ gồm số và ÿ không bị coi là hỏng; trang thật có thể còn ký tự lạ khác — chưa đo (không có PDF gốc trong doc-cache)" }, () => {
  assert.equal(O.garbled(rep("3456ÿ89ÿ ÿ", 40)), true);
});
test("lớp chữ tốt: tiếng Việt có dấu (cả dạng tách dấu NFD), tiếng Nga (Vietsovpetro), ký hiệu kỹ thuật ≤ ≥ ±", () => {
  assert.equal(O.garbled(rep("Yêu cầu kỹ thuật của máy phát điện: công suất ≥ 500 kVA, điện áp 400V ± 5%", 10)), false);
  assert.equal(O.garbled(rep("Yêu cầu kỹ thuật".normalize("NFD"), 30)), false);
  assert.equal(O.garbled(rep("Технические требования к дизель-генератору", 10)), false);
});
test("đoạn hỏng ngắn (< 300 ký tự không trắng) chưa đủ để kết luận", () => assert.equal(O.garbled(rep("Yªu cÇu", 10)), false));
test("trang cần OCR: gần như không chữ (< 60 ký tự) hoặc hỏng phông; trang chữ tốt thì không", () => {
  const good = rep("Chương V. Yêu cầu về kỹ thuật của gói thầu mua sắm máy phát điện", 3);
  assert.deepEqual(O.scanPages([good, "  12  \n", rep("Yªu cÇu kü thuËt cña m¸y", 30), "", good]), [2, 3, 4]);
  assert.equal(O.MIN_CHARS, 60);
});
test("độ đọc được: trang đọc ngược / nằm ngang ra mẩu vụn ('œ | |g', '2 3 Š |2') thấp hơn ngưỡng 0,5; trang thường cao", () => {
  assert.ok(O.legible("œ | |g 2 3 Š |2 ‘| ' ; Iz a") < 0.5);
  assert.ok(O.legible("Máy phát điện công suất liên tục 500 kVA") > 0.8);
  assert.equal(O.legible("   "), 0);
});

// chapterRange: head(n) = the top of page n read quickly, as plainOcr gives it.
const heads = (m) => (n) => O.plainOcr(m[n] || "trang nội dung");
test("tìm Chương V trong bản scan cả bộ: từ trang có đầu 'Chương V' tới trước trang 'Chương VI'; bỏ mục lục", () => {
  const m = { 2: "MỤC LỤC Chương I … Chương V … Chương VI", 3: "Chương I. Chỉ dẫn nhà thầu", 85: "CHƯƠNG V. YÊU CẦU VỀ KỸ THUẬT", 97: "Chương VI. Điều kiện chung của hợp đồng" };
  assert.deepEqual(O.chapterRange(Array.from({ length: 114 }, (_, i) => i + 1), heads(m)), { from: 85, to: 96 });
});
test("trang tóm tắt nêu nhiều chương (≥ 3 lần 'chương') không phải đầu chương", () => {
  const m = { 1: "Chương I chỉ dẫn, Chương II bảng dữ liệu, Chương V yêu cầu kỹ thuật", 10: "Chương V - Yêu cầu kỹ thuật" };
  assert.equal(O.chapterRange([1, 5, 10, 11], heads(m)).from, 10);
});
test("nhắc 'Phần 2 - Yêu cầu…' ở giữa trang (sau 80 ký tự) không phải đầu chương (trang 5 của IB2400056128)", () => {
  const m = { 5: `${"Chỉ dẫn nhà thầu ".repeat(6)}như mô tả trong Phần 2 - Yêu cầu về phạm vi cung cấp`, 40: "PHẦN 2. YÊU CẦU VỀ PHẠM VI CUNG CẤP", 60: "Phần 3. Điều kiện hợp đồng" };
  assert.deepEqual(O.chapterRange([5, 40, 41, 60, 61], heads(m)), { from: 40, to: 59 });
});
test("HSYC: 'Chương III. Yêu cầu kỹ thuật' là đầu; không thấy chương kết thì to = 0 (đọc tới trang cuối)", () => {
  assert.deepEqual(O.chapterRange([1, 2, 3], heads({ 2: "Chương III. Yêu cầu về kỹ thuật" })), { from: 2, to: 0 });
});
test("không thấy Chương V thì from = 0 (đọc mọi trang scan)", () => assert.deepEqual(O.chapterRange([1, 2], heads({})), { from: 0, to: 0 }));
test("chữ OCR đưa về không dấu, chữ thường, một khoảng trắng", () => assert.equal(O.plainOcr("CHƯƠNG  V.\nĐiều"), "chuong v. dieu"));

test("xoay trang PGM theo chiều kim đồng hồ 90 / 180 / 270 độ", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t5-pgm-"));
  try {
    const src = path.join(dir, "a.pgm");
    // 3 x 2:  a b c / d e f
    fs.writeFileSync(src, Buffer.concat([Buffer.from("P5\n# chú thích\n3 2\n255\n", "latin1"), Buffer.from([1, 2, 3, 4, 5, 6])]));
    const turn = (deg) => { const out = path.join(dir, `r${deg}.pgm`); O.rotatePgm(src, out, deg); const b = fs.readFileSync(out); const head = b.toString("latin1", 0, b.length - 6); return [head, [...b.subarray(b.length - 6)]]; };
    assert.deepEqual(turn(90), ["P5\n2 3\n255\n", [4, 1, 5, 2, 6, 3]]);
    assert.deepEqual(turn(180), ["P5\n3 2\n255\n", [6, 5, 4, 3, 2, 1]]);
    assert.deepEqual(turn(270), ["P5\n2 3\n255\n", [3, 6, 2, 5, 1, 4]]);
    fs.writeFileSync(src, "P2\n1 1\n255\n0");
    assert.throws(() => O.rotatePgm(src, path.join(dir, "x.pgm"), 90), /not a P5 PGM/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
