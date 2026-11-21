// HSMT text handling of genbid-sync.js moved to sync-pure.js: chapters (splitSections), what each AI request keeps
// (trimHsmt, Khoa 27/10, 04/11), the technical part for specs (chapterV), compact, the cut guard (headCut, densestCut:
// no silent cut, 12/11), and the quote check of an analysis (checkResult / found). OCR-like spellings from real HSMT.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
const P = createRequire(import.meta.url)("../genbid-hsmt/sync-pure.js");
const body = (tag, n) => Array.from({ length: n }, (_, i) => `${tag} dòng ${i + 1}: nội dung quy định của chương để đủ dài.`).join("\n");

// ---------- chương ----------
test("chia chương: 'Chương V', chữ OCR 'CHUONG', 'Chirong', 'Chu'o'ng' đều là đầu chương; 'Chống sét' thì không", () => {
  const t = ["Mở đầu", "Chương I. CHỈ DẪN NHÀ THẦU", "a", "CHUONG II BẢNG DỮ LIỆU", "b", "Chirong III TIÊU CHUẨN", "c", "Chu'o'ng V. YÊU CẦU VỀ KỸ THUẬT", "Chống sét van", "d", "Phần 2. YÊU CẦU VỀ PHẠM VI", "e"].join("\n");
  assert.deepEqual(P.splitSections(t).map((s) => s.chap), ["", "I", "II", "III", "V", "P2"]);
  assert.match(P.splitSections(t)[4].text, /Chống sét van/);
});
test("chia chương: dấu '--- Tệp: … ---' bắt đầu tệp mới; dòng dài hơn 120 ký tự không phải đầu chương", () => {
  const t = ["--- Tệp: a.pdf ---", "x", `Chương V ${"y".repeat(130)}`, "--- Tệp: b.pdf ---", "Chương V. Yêu cầu kỹ thuật", "z"].join("\n");
  const s = P.splitSections(t);
  assert.deepEqual(s.map((x) => [x.file, x.chap]), [["a.pdf", ""], ["b.pdf", ""], ["b.pdf", "V"]]);
});

// ---------- phần HSMT gửi theo từng loại yêu cầu ----------
const HSMT = ["--- Tệp: E-HSMT.pdf ---", "Chương I. Chỉ dẫn nhà thầu", body("I", 60), "Chương II. Bảng dữ liệu", body("II", 60), "Chương III. Tiêu chuẩn đánh giá",
  body("III", 30), "Mục 3. Tiêu chuẩn đánh giá về kỹ thuật", body("KT", 30), "Mục 4. Tiêu chuẩn đánh giá về giá", body("GIA", 30),
  "Chương V. Yêu cầu về kỹ thuật", body("V", 60), "Chương VI. Điều kiện chung của hợp đồng", body("VI", 60), "Chương VIII. Biểu mẫu hợp đồng", body("VIII", 60)].join("\n");
test("Phân tích giữ chương II, III, V, VII và dự thảo hợp đồng (Khoa 04/11); bỏ Chỉ dẫn nhà thầu, Điều kiện chung", () => {
  const r = P.trimHsmt(HSMT, "analysis");
  for (const k of ["II dòng 1", "III dòng 1", "V dòng 60", "VIII dòng 1"]) assert.match(r.text, new RegExp(k));
  assert.doesNotMatch(r.text, /^I dòng 1:/m);
  assert.doesNotMatch(r.text, /VI dòng 1:/);
  assert.equal(r.dropped.length, 2);
  assert.match(r.dropped[0], /^E-HSMT\.pdf \/ Chương I\. Chỉ dẫn nhà thầu \(\d/);
});
test("Tạo bản tiếng Anh chỉ giữ Chương V; Đối chiếu TLKT chỉ giữ mục kỹ thuật của Chương III (Khoa 27/10) và Chương V", () => {
  const en = P.trimHsmt(HSMT, "translation").text;
  assert.match(en, /V dòng 1:/);
  assert.doesNotMatch(en, /II dòng 1:|VIII dòng/);
  const tl = P.trimHsmt(HSMT, "tlkt").text;
  assert.match(tl, /KT dòng 30/);
  assert.doesNotMatch(tl, /GIA dòng 1|III dòng 1:/, "Chương III chỉ còn Mục 3 kỹ thuật");
});
test("một chương có hai bản (tệp .docx và E-HSMT đầy đủ): giữ bản dài hơn", () => {
  const t = ["--- Tệp: ngan.docx ---", "Chương V. Yêu cầu kỹ thuật", body("NGAN", 40), "--- Tệp: day-du.pdf ---", "Chương V. Yêu cầu kỹ thuật", body("DAI", 80)].join("\n");
  const r = P.trimHsmt(t, "translation");
  assert.match(r.text, /--- Tệp: day-du\.pdf ---/);
  assert.doesNotMatch(r.text, /NGAN dòng 1:/);
});
test("không thấy đầu chương nào: giữ hết", () => {
  const t = "--- Tệp: a.pdf ---\n" + body("X", 200);
  assert.equal(P.trimHsmt(t, "analysis").text, t);
});

// ---------- Chương V cho specs ----------
test("Chương V: văn bản ngắn (≤ 80.000 ký tự) gửi cả, đã thu gọn cột", () => {
  assert.equal(P.chapterV("a      b\n  c  "), "a | b\nc");
});
const big = (...parts) => ["--- Tệp: hsmt.pdf ---", ...parts].join("\n");
const filler = (tag) => body(tag, 1500); // ~ 90,000 characters
test("Chương V dài: lấy chương tiêu đề yêu cầu kỹ thuật, không lấy chương hợp đồng", () => {
  const t = big("Chương I. Chỉ dẫn", filler("I"), "Chương V. YÊU CẦU VỀ KỸ THUẬT", body("V", 100), "Chương VI. Điều kiện hợp đồng", body("VI", 100));
  const r = P.chapterV(t);
  assert.match(r, /^--- Tệp: hsmt\.pdf ---\nChương V\. YÊU CẦU VỀ KỸ THUẬT/);
  assert.match(r, /V dòng 100/);
  assert.doesNotMatch(r, /VI dòng 1:|I dòng 1:/);
});
test("HSYC: yêu cầu kỹ thuật ở Chương IV, Chương V là hợp đồng: lấy Chương IV (tiêu đề đọc không dấu)", () => {
  const t = big("Chương I. Chỉ dẫn", filler("I"), "Chương IV. Yeu cau ky thuat", body("IV", 100), "Chương V. Dự thảo hợp đồng", body("V", 100));
  const r = P.chapterV(t);
  assert.match(r, /IV dòng 100/);
  assert.doesNotMatch(r, /^V dòng 1:/m);
});
test("Chương V chỉ là mấy dòng tóm tắt đầu HSMT, lớp chữ hỏng phông (IB2500302333): lấy từ dòng 'Phần 2' cuối tới 'Phần 3'", () => {
  const t = big("Mục lục", "Phần 2 YEU CAU", "Chương V. Yêu cầu kỹ thuật", "Chương này nêu các yêu cầu về kỹ thuật", "Chương VI. Điều kiện cụ thể của hợp đồng", filler("I"), "Phân 2. YEU CAU YE 1(2 THUJT", body("P2", 50), "Phần 3. Điều kiện hợp đồng", body("P3", 50));
  const r = P.chapterV(t);
  assert.match(r, /^Phân 2\. YEU CAU YE 1\(2 THUJT/);
  assert.match(r, /P2 dòng 50/);
  assert.doesNotMatch(r, /P3 dòng 1:/);
});
test("không đầu chương nào, có khối 'YÊU CẦU KỸ THUẬT' viết hoa một dòng sau mục lục (Vietsovpetro IB2600547578): lấy khối đó", () => {
  const t = big("YÊU CẦU KỸ THUẬT", filler("HD"), "YÊU CẦU KỸ THUẬT", body("YC", 100));
  const r = P.chapterV(t);
  assert.match(r, /YC dòng 1:/);
  assert.ok(r.length < t.length / 2);
});

// ---------- thu gọn, cắt có báo ----------
test("thu gọn: khoảng trắng rộng (cột pdftotext) thành ' | ', dòng đầu/chân trang lặp ≥ 5 lần giữ một, dòng danh sách lặp vẫn giữ", () => {
  const head = "Hồ sơ mời thầu gói thầu số 05 - trang";
  const t = Array.from({ length: 6 }, () => `${head}\n- Bản vẽ lắp: có\nĐộng cơ        Cummins`).join("\n");
  const r = P.compact(t).split("\n");
  assert.equal(r.filter((l) => l === head).length, 1);
  assert.equal(r.filter((l) => l === "- Bản vẽ lắp: có").length, 6);
  assert.equal(r.filter((l) => l === "Động cơ | Cummins").length, 6, "dòng ngắn (≤ 20 ký tự) không coi là đầu trang");
});
test("cắt phần đầu: vừa thì không ghi chú; dài thì cắt ở cuối dòng và ghi rõ dòng đã lược", () => {
  assert.deepEqual(P.headCut("abc", 10), { text: "abc", note: "" });
  const t = Array.from({ length: 10 }, (_, i) => `dòng ${i + 1} xxxxxxxx`).join("\n");
  const r = P.headCut(t, 60);
  assert.ok(r.text.length <= 60 && !r.text.endsWith("\n"));
  assert.equal(r.from, r.text.split("\n").length + 1);
  assert.equal(r.all, 10);
  assert.match(r.note, new RegExp(`đã lược dòng ${r.from}–10 / 10`));
});
test("trang thông báo: bỏ phần chân trang từ 'Quay trở lại'", () => {
  assert.equal(P.noticeBody("Thông tin cơ bản\nMã TBMT IB1\n Quay trở lại \nLiên hệ\nĐịa chỉ"), "Thông tin cơ bản\nMã TBMT IB1");
});
test("cắt chỗ nhiều thông số nhất: giữ đoạn liền có nhiều 'kVA / xi lanh / prime' nhất, ghi số chỗ thông số bị lược", () => {
  const t = [body("CHUNG", 300), ...Array.from({ length: 40 }, (_, i) => `Máy ${i}: 500 kVA prime, 6 xi lanh, đầu phát Stamford`), body("CUOI", 300)].join("\n");
  const r = P.densestCut(t, 6000);
  assert.ok(r.text.length <= 6000);
  assert.match(r.text, /Máy 0: 500 kVA/);
  assert.match(r.text, /Máy 39: 500 kVA/);
  assert.equal(r.hits, 0, "không lược chỗ thông số nào");
  assert.match(r.note, /^đã lược dòng 1–\d+, \d+–640 \/ 640/);
  assert.deepEqual(P.densestCut("ngắn", 100), { text: "ngắn", note: "", hits: 0 });
});

// ---------- kiểm trích dẫn của Phân tích ----------
const SRC = ["Chương V. Yêu cầu kỹ thuật", "Máy phát điện công suất liên tục 500 kVA, dự phòng 550 kVA, động cơ 6 xi lanh làm mát bằng nước.",
  "Đầu phát: hiệu suất ≥ 93%, cấp cách điện H.", "Bộ điều khiển có bảo vệ ngắn mạch, quá tải, quá áp.", "Tiêu hao nhiên liệu ở 75% tải không quá 98 lít/giờ.",
  "Thời gian bảo hành 24 tháng kể từ ngày nghiệm thu."].join("\n").repeat(2);
const check = (result, src = SRC) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t5-chk-"));
  try { fs.writeFileSync(path.join(dir, "src-req.txt"), src); return P.checkResult({ kind: "analysis" }, result, dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
};
test("Phân tích: trích dẫn có thật (khác ngắt dòng, dấu câu) được giữ; trích dẫn bịa bị bỏ và báo", () => {
  const r = { highlights: [{ title: "Công suất", quote: "công suất liên tục 500 kVA dự phòng 550 kVA" }, { title: "Bịa", quote: "Máy phải có xuất xứ Nhật Bản hoặc châu Âu" }], technicalSpecs: [] };
  const notes = check(r);
  assert.equal(r.highlights[0].quote, "công suất liên tục 500 kVA dự phòng 550 kVA");
  assert.equal(r.highlights[1].quote, null);
  assert.match(notes[0], /^Kiểm tra tự động: 1 trích dẫn không thấy nguyên văn trong HSMT nên đã bỏ trích dẫn: Bịa\./);
});
test("Phân tích: con số yêu cầu không có trong HSMT thì đánh dấu chưa kiểm (95% thay 93%)", () => {
  const r = { technicalSpecs: [{ item: "Đầu phát", requirement: "Hiệu suất ≥ 95%", quote: "hiệu suất ≥ 95%" }, { item: "Bảo hành", requirement: "24 tháng", quote: "Thời gian bảo hành 24 tháng" }] };
  const notes = check(r);
  assert.equal(r.technicalSpecs[0].unverified, true);
  assert.equal(r.technicalSpecs[0].quote, null);
  assert.equal(r.technicalSpecs[1].unverified, undefined);
  assert.match(notes.join(" "), /1 mục có con số không thấy trong HSMT.*Đầu phát \(95\)/);
});
test("Phân tích: HSMT chủ yếu là bản scan (< 300 ký tự chữ) thì không kiểm, báo cần đối chiếu tệp gốc", () => {
  const r = { highlights: [{ title: "x", quote: "bất kỳ" }] };
  assert.match(check(r, "ít chữ")[0], /^Không kiểm chứng tự động được: HSMT chủ yếu là bản scan/);
  assert.equal(r.highlights[0].quote, "bất kỳ");
});
test("trích nhiều đoạn nối bằng '…' kiểm từng đoạn; số trong trích phải có trong nguồn", () => {
  const s = P.sourceOf(SRC);
  assert.equal(P.found("công suất liên tục 500 kVA … bảo hành 24 tháng kể từ ngày nghiệm thu", s), true);
  assert.equal(P.found("bảo hành 36 tháng kể từ ngày nghiệm thu", s), false);
});
test("Đối chiếu: điểm và kết luận tính từ trạng thái (bắt buộc ×2, đạt một phần ½); mục bắt buộc không đạt thì trượt", () => {
  assert.deepEqual(P.scoreItems([{ status: "met", critical: true }, { status: "partial" }, { status: "met" }]), { overallScore: 88, verdict: "at_risk" });
  assert.deepEqual(P.scoreItems([{ status: "met" }, { status: "not_met", critical: true }]), { overallScore: 33, verdict: "fail" });
  assert.deepEqual(P.scoreItems([{ status: "met" }]), { overallScore: 100, verdict: "pass" });
  assert.deepEqual(P.scoreItems([]), { overallScore: 0, verdict: "pass" }, "khoá hành vi: không có mục nào thì 0 điểm nhưng 'pass'");
});
