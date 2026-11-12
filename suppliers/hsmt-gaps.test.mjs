import test from "node:test";
import assert from "node:assert/strict";
import { hsmtGaps, technicalPart, WEBFORM_CUT } from "./config-bot.mjs";

const tech = "Chương V. Yêu cầu kỹ thuật\n" + "Máy phát điện 500 kVA, động cơ 6 xi lanh, đầu phát không chổi than.\n".repeat(60);
const intro = "Chương I. Chỉ dẫn nhà thầu\n" + "Nhà thầu nộp hồ sơ theo mẫu.\n".repeat(80);

test("hsmtGaps: nothing for a whole HSMT with its technical chapter", () => {
  const text = intro + tech + "Chương VI. Biểu mẫu\n" + "Mẫu số 01.\n".repeat(50);
  assert.deepEqual(hsmtGaps({ hsmt: { files: [{ name: "a.pdf", hasText: true }] }, parts: [text], text }), []);
});

test("hsmtGaps: an empty chunk, no file text at all", () => {
  const g = hsmtGaps({ parts: [tech, "", tech], text: tech + tech });
  assert.match(g[0].why, /thiếu 1\/3 phần văn bản HSMT trên web \(phần 2 rỗng\)/);
  const n = hsmtGaps({ parts: ["", ""], text: "\n\n--- Thông báo mời thầu ---\nThông tin" });
  assert.ok(n.some((x) => /chỉ có thông báo mời thầu/.test(x.why)));
});

test("hsmtGaps: a scanned file, a webform chapter at the bot's cut", () => {
  const g = hsmtGaps({ hsmt: { files: [{ name: "Chuong V.pdf", hasText: false, ocrTried: true }, { name: "b.docx", hasText: true }] },
    notice: { chapters: [{ name: "Chương V", text: "x".repeat(WEBFORM_CUT) }, { name: "Chương III", text: "y".repeat(100) }] }, parts: [tech], text: tech });
  assert.ok(g.some((x) => /1 tệp HSMT chưa đọc được chữ \(bản scan, OCR không ra\): Chuong V\.pdf/.test(x.why)));
  assert.ok(g.some((x) => /chương webform "Chương V" dài đúng mức bot cắt/.test(x.why)));
  assert.ok(!g.some((x) => /Chương III/.test(x.why)));
});

test("hsmtGaps: figures outside the chapter technicalPart keeps — named with their lines in hsmt.txt", () => {
  const other = "Chương III. Tiêu chuẩn đánh giá\n" + "Bảng: công suất liên tục ≥ 450 kVA; động cơ prime 400 kW\n".repeat(12);
  const text = intro + tech + other;
  assert.equal(technicalPart(text).includes("Tiêu chuẩn đánh giá"), false);
  const g = hsmtGaps({ parts: [text], text });
  const hit = g.find((x) => /còn \d+ chỗ nói tới công suất/.test(x.why));
  assert.ok(hit);
  const first = text.split("\n").findIndex((l) => /450 kVA/.test(l)) + 1;
  assert.equal(hit.lines[0], first);
  assert.ok(hit.lines.length <= 40);
});

test("technicalPart: a technical chapter longer than MAX_TP keeps its window with the most figures, whole lines, never fewer than its start", async () => {
  const CB = await import("./config-bot.mjs");
  const filler = "Điều khoản chung về thủ tục, không có số liệu kỹ thuật.\n".repeat(6000); // ~330,000 characters
  const specs = "+ Công suất liên tục: 500 kVA; động cơ 6 xi lanh; đầu phát prime 400 kW\n".repeat(300);
  const text = "Chương V. Yêu cầu kỹ thuật\n" + filler + specs + "Chương VI. Biểu mẫu dự thầu\n" + "Mẫu.\n".repeat(400);
  const tp = CB.technicalPart(text);
  assert.equal(CB.tpCut, true);
  assert.ok(tp.length <= 250000);
  assert.ok(tp.includes(specs), "the figures are kept");
  assert.equal(text.slice(text.indexOf(tp) - 1, text.indexOf(tp)), "\n", "starts at a line");
  assert.ok(tp.endsWith("\n"), "ends at a line");
  const g = CB.hsmtGaps({ parts: [text], text });
  assert.ok(g.some((x) => /đoạn nhiều thông số nhất \(dòng \d+–\d+ của hsmt\.txt\)/.test(x.why)));
  // A chapter under the limit: the same as before (the chapter itself), no cut.
  const small = "Chương V. Yêu cầu kỹ thuật\n" + specs.split("\n").slice(0, 60).join("\n") + "\nChương VI. Biểu mẫu dự thầu\nMẫu.\n";
  assert.equal(CB.technicalPart(small), small.slice(0, small.indexOf("Chương VI")));
  assert.equal(CB.tpCut, false);
});

test("webMissing: only engine / alternator / genset codes on a line with a measured figure reach the web", async () => {
  const { webMissing, coverNotes } = await import("./config-bot.mjs");
  const m = [
    { code: "ctl_measure", item: "Đo lường, hiển thị", part: "controller", line: "Thời gian bảo hành: ≥ 24 tháng hoặc ≥ 1000 giờ chạy" },
    { code: "origin", item: "Xuất xứ tổ máy", part: "genset", line: "Tình trạng: nhập khẩu nguyên chiếc, mới 100%" },
    { code: "cooling", item: "Hệ thống làm mát động cơ", part: "engine", line: "+ Hệ thống làm mát: Két nước kết hợp quạt gió" },
    { code: "oil_capacity", item: "Dung tích dầu bôi trơn", part: "engine", line: "+ Dung tích dầu bôi trơn: 10,9L" },
    { code: "frequency", item: "Tần số", part: "genset", line: "Tần số định mức: 50 Hz" },
  ];
  assert.deepEqual(webMissing(m).map((x) => x.code), ["oil_capacity", "frequency"]);
  const n = coverNotes({ requirements: [], configs: [] }, { missing: m });
  assert.equal(n.length, 1);
  assert.match(n[0], /HSMT có 2 điểm .*Dung tích dầu bôi trơn; Tần số\./);
  assert.deepEqual(coverNotes({ requirements: [], configs: [] }, { missing: m.slice(0, 3) }), []);
});
