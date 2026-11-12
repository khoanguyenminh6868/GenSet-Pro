// Báo cáo đánh giá E-HSDT (BCĐG): bcdg-reason.js (trích lý do) và bcdg-step.js (tải, tải lên, thử lại, bỏ) của bot.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { bcdgReason, mentionsUs } = require("../bot/genbid-hsmt/bcdg-reason.js");
const { bcdgStep, MAX_TRIES } = require("../bot/genbid-hsmt/bcdg-step.js");

// ---------- bcdg-reason.js ----------
test("dòng kết luận 'Không đạt' / 'không hợp lệ' cuối dòng không bị bỏ", () => {
  assert.match(bcdgReason("b.2) Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên: Không đạt\nLý do: đầu phát hiệu suất 92,8% < 93%."), /Lý do: đầu phát/);
  assert.match(bcdgReason("Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên - E-HSDT không hợp lệ\nThiếu bảo đảm dự thầu."), /Thiếu bảo đảm/);
});
test("công ty mình đạt thì không lấy đoạn của nhà thầu khác dưới đó", () => {
  const t = "Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên: đáp ứng yêu cầu kỹ thuật.\nNhà thầu Minh Long không đáp ứng về đầu phát.\nTNHH Hưng Phát thiếu chứng nhận CO.";
  assert.equal(bcdgReason(t), "");
});
test("đoạn của mình dừng ở nhà thầu kế tiếp", () => {
  const r = bcdgReason("b3. Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:\n- Thiếu báo cáo tài chính năm 2021;\nb4. Công ty TNHH Minh Phú:\n- Thiếu CO của máy.");
  assert.match(r, /báo cáo tài chính/);
  assert.doesNotMatch(r, /Minh Phú|CO của máy/);
});
test("tên người 'Nguyễn Thị Thảo Nguyên' và cột bảng 'Thảo Nguyên' không phải công ty mình", () => {
  assert.equal(bcdgReason("Tổ chuyên gia:\n1. Bà Nguyễn Thị Thảo Nguyên - Tổ trưởng\n2. Ông Trần Văn A - Thành viên, không đáp ứng điều kiện độc lập"), "");
  assert.equal(bcdgReason("TT Tiêu chí Thảo Nguyên Hưng Phát\n1 Bảo đảm dự thầu không đạt không đạt"), "");
});
test("dòng bảng xếp hạng: chỉ dòng của mình, không kéo các hàng sau; hàng 'Đạt' không tính", () => {
  const rows = "1 Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên Không đạt\n2 Công ty TNHH Minh Phú Đạt\n3 Công ty TNHH Hưng Phát Không đạt";
  assert.equal(bcdgReason(rows), "1 Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên Không đạt");
  assert.equal(bcdgReason("2 Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên Đạt\nb) Thuyết minh: không đáp ứng"), "");
});
test("khớp theo MST, cả khi MST ghi cách nhóm số; không khớp số dính liền chữ số khác", () => {
  assert.match(bcdgReason("MST 4101.623.015: thiếu chứng chỉ ISO"), /thiếu chứng chỉ/);
  assert.equal(bcdgReason("Mã số 14101623015 thiếu hồ sơ"), "");
});
test("tên bị ngắt dòng vẫn nhận; gói trúng (không có cụm loại) thì rỗng", () => {
  assert.match(bcdgReason("CÔNG TY TNHH THIẾT BỊ KỸ THUẬT\nTHẢO NGUYÊN không đáp ứng yêu cầu về kỹ thuật"), /THẢO NGUYÊN không đáp ứng/);
  assert.equal(bcdgReason("Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên: xếp hạng thứ nhất, đề nghị trúng thầu"), "");
});

// Chữ thật của 19 gói đã tải tay (chỉ chạy khi có thư mục này trên máy của Khoa).
const CORPUS = "C:/Projects/GenSet Pro/genbid-test/bcdg/text/";
test("19 gói thật: trích được ≥16 gói, đoạn nào cũng nhắc công ty mình, không có tên người khác", { skip: !fs.existsSync(CORPUS) }, () => {
  let got = 0;
  for (const f of fs.readdirSync(CORPUS).filter((x) => x.endsWith(".txt"))) {
    const r = bcdgReason(fs.readFileSync(CORPUS + f, "utf8"));
    if (!r) continue;
    got++;
    assert.match(r.normalize("NFC"), /th.{0,3}o\s*nguy.{0,3}n|4101623015|Liên danh TN-HA/i, f);
    assert.doesNotMatch(r, /Nguyễn Thị Thảo Nguyên/i, f);
  }
  assert.ok(got >= 16, "chỉ trích được " + got);
});

// ---------- khối thuyết minh (bcdg-why, 2026-11-12) ----------
const { bcdgReasonEx, pagesToRead } = require("../bot/genbid-hsmt/bcdg-reason.js");
const BCDG_1203 = [
  "Stt Tên nhà thầu Kết luận",
  "1 Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên. Không đạt",
  "2 Công ty Cổ phần Sáng Ban Mai. Đạt",
  "b) Thuyết minh các trường hợp nhà thầu không đáp ứng yêu cầu về kỹ thuật nêu",
  "trong E-HSMT (kể cả khi đã làm rõ E-HSDT (nếu có)).",
  "Qua đánh giá về kỹ thuật có 02 nhà không đạt yêu cầu về kỹ thuật đó là:",
  "- Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên.",
  "- Công ty Cổ phần Tấn Đức.",
  "1) Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:",
  "Theo HSMT và nhận xét đánh giá HSDT nhà thầu:",
  "4. Bảo hành, sửa chữa hư hỏng:",
  "Không | - Thời gian bảo hành > 12 tháng kể từ ngày bàn giao",
  "+ Thuyết minh Biện pháp thi công: 2-3 ngày.",
  "Chương V, của E-HSMT: bảo hành chưa đủ.",
  "2) Công ty Cổ phần Thương mại Tấn Đức.:",
  "Hàng hóa của Tấn Đức không đáp ứng yêu cầu về CO.",
  "c) Các nội dung lưu ý trong quá trình đánh giá: Không có.",
].join("\n");
test("khối thuyết minh: lấy tiêu đề mục của mình tới nhà thầu kế tiếp, không lấy dòng bảng/đoạn nhà thầu khác", () => {
  const x = bcdgReasonEx(BCDG_1203);
  assert.equal(x.source, "thuyet-minh");
  assert.match(x.text, /^1\) Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:/);
  assert.match(x.text, /Thời gian bảo hành/);
  assert.match(x.text, /Chương V, của E-HSMT/, "dòng bắt đầu 'Chương' không phải mục lớn mới");
  assert.doesNotMatch(x.text, /Tấn Đức|Sáng Ban Mai|Qua đánh giá/);
});
test("khối thuyết minh: tiêu đề kiểu 'b.1. Công ty ...' không có dấu hai chấm, 'Nhà thầu: Công ty ...'", () => {
  const a = bcdgReasonEx("b) Thuyết minh các trường hợp nhà thầu không đáp ứng yêu cầu về kỹ thuật nêu trong E-HSMT\nb.1. Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên\nHàng hoá có ký mã hiệu GM96, catalogue GR-96 không giống.\nb.2. Công ty TNHH Minh Phú\nCO thiếu.\nc) Lưu ý");
  assert.match(a.text, /GM96/); assert.doesNotMatch(a.text, /Minh Phú|CO thiếu/);
  const b = bcdgReasonEx("b) Thuyết minh các trường hợp nhà thầu không đáp ứng yêu cầu về kỹ thuật nêu trong E-HSMT\nNhà thầu: Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên\n• Nhà thầu không có catalogue động cơ.\nNhà thầu: Công ty Hưng Phát\n• Thiếu CO.");
  assert.match(b.text, /catalogue động cơ/); assert.doesNotMatch(b.text, /Hưng Phát|Thiếu CO/);
});
test("khối thuyết minh: không có khối của mình thì giữ cách cũ (dự phòng); mình chỉ được nhắc ở mục khác thì không lấy", () => {
  const x = bcdgReasonEx("1 Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên Không đạt\nb) Thuyết minh các trường hợp nhà thầu không đáp ứng yêu cầu về kỹ thuật:\n1) Công ty Hưng Phát:\n- Thiếu CO.");
  assert.equal(x.source, "doan"); assert.doesNotMatch(x.text, /Hưng Phát|CO/);
});
test("khối thuyết minh: mục tự nêu tên mình ngay ở tiêu đề (chỉ mình) → cả mục; tiêu đề nêu cả nhà thầu khác thì không coi là khối của mình", () => {
  const x = bcdgReasonEx("b) Thuyết minh các trường hợp nhà thầu không đáp ứng yêu cầu về kỹ thuật nêu trong E-HSMT: Có (Nhà thầu Công ty TNHH Thiết bị Kỹ thuật Thảo\nNguyên không đạt yêu cầu)\n- Không cung cấp được model động cơ.\n4. Kết quả đánh giá về tài chính");
  assert.match(x.text, /model động cơ/); assert.doesNotMatch(x.text, /tài chính/);
  assert.notEqual(bcdgReasonEx("b) Thuyết minh các trường hợp nhà thầu không đáp ứng yêu cầu: Công ty Hưng Phát và Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên không đạt\n- Thiếu CO.").source, "thuyet-minh");
});
test("khối thuyết minh: trần 3.000 ký tự, cắt trọn dòng", () => {
  const body = Array.from({ length: 120 }, (_, i) => `- Dòng nhận xét số ${i} của chuyên gia: không đáp ứng yêu cầu.`).join("\n");
  const x = bcdgReasonEx("b) Thuyết minh các trường hợp nhà thầu không đáp ứng yêu cầu về kỹ thuật:\n1) Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:\n" + body);
  assert.ok(x.text.length <= 3000 && x.text.length > 2500);
  assert.match(x.text, /\.$/);
});
test("--locate: khối thuyết minh nhiều trang → thêm các trang tới trang có tiêu đề nhà thầu kế tiếp", () => {
  const pg = { 10: "1 Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên Không đạt", 20: "b) Thuyết minh ... không đáp ứng\n1) Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:\nBảng nhận xét", 21: "tiếp bảng nhận xét", 22: "tiếp nữa", 23: "bảo hành\n2) Công ty Cổ phần Tấn Đức.:", 24: "của Tấn Đức" };
  const want = pagesToRead([10, 20], (n) => pg[n] || "", 30);
  assert.deepEqual([...want].sort((a, b) => a - b), [9, 10, 11, 19, 20, 21, 22, 23]);
  // trang xếp hạng (dòng bảng kết bằng 'Không đạt') không mở khối: chỉ ±1
  assert.deepEqual([...pagesToRead([10], (n) => pg[n] || "", 30)].sort((a, b) => a - b), [9, 10, 11]);
});

// ---------- bcdg-step.js ----------
const FILES = [{ id: "AAAAAAAA-0000-0000-0000-000000000001", name: "bc1.pdf" }, { id: "BBBBBBBB-0000-0000-0000-000000000002", name: "bc2.pdf" }];
const mk = (over = {}) => {
  const calls = { download: [], upload: [], text: [] };
  const deps = {
    now: () => "2026-11-12T00:00:00.000Z", log() {}, stored: (m) => "s-" + m.id.slice(0, 8),
    download: async (todo) => { calls.download.push(todo.map((x) => x.id)); return todo.map((x) => ({ id: x.id.toLowerCase(), file: "C:/x/" + x.name, bytes: 1000, md5: "MD5" })); },
    upload: async (file, name) => { calls.upload.push(name); return "K/" + name; },
    text: (file) => { calls.text.push(file); return { text: "b3. Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:\n- Thiếu tài liệu thuế", ocr: 0, timedOut: false }; },
    ...over,
  };
  return { deps, calls };
};
const run = (o) => bcdgStep({ key: "K", b: { reportFiles: FILES }, prev: null, ...o });

test("thành công: mọi tệp lên kho, có lý do, không có error/tries", async () => {
  const { deps, calls } = mk();
  const { doc, line } = await run({ deps });
  assert.equal(doc.files.length, 2);
  assert.ok(doc.files.every((f) => f.path && !f.error));
  assert.match(doc.reason, /Thiếu tài liệu thuế/);
  assert.equal(doc.error, undefined);
  assert.equal(doc.tries, undefined);
  assert.equal(calls.upload.length, 2);
  assert.match(line, /2\/2 tệp, có lý do/);
});
test("không thấy tệp trên trang: lỗi lần 1 ghi tries và error, không ghi 'không có tệp' vĩnh viễn", async () => {
  const { deps } = mk();
  const { doc } = await bcdgStep({ key: "K", b: { reportFiles: [] }, prev: null, deps });
  assert.equal(doc.tries, 1);
  assert.match(doc.error, /không thấy tệp/);
  assert.equal(doc.giveUp, undefined);
});
test("lỗi tải: tries+1; đến MAX_TRIES thì giveUp", async () => {
  const { deps } = mk({ download: async () => { throw new Error("Agent không trả lời"); } });
  let prev = null;
  for (let i = 1; i <= MAX_TRIES; i++) {
    const { doc } = await run({ deps, prev });
    assert.equal(doc.tries, i);
    assert.match(doc.error, /Agent không trả lời/);
    assert.equal(!!doc.giveUp, i === MAX_TRIES);
    prev = doc;
  }
});
test("tệp cắt ngắn (download không trả về): ghi error từng tệp, không OCR, tries+1", async () => {
  const { deps, calls } = mk({ download: async () => [] });
  const { doc } = await run({ deps });
  assert.ok(doc.files.every((f) => f.error));
  assert.equal(doc.tries, 1);
  assert.equal(calls.text.length, 0);
});
test("lỗi tải lên: tệp đó không OCR; tệp kia vẫn lên; error cấp gói; lượt sau chỉ làm lại tệp lỗi", async () => {
  let failFirst = true;
  const { deps, calls } = mk({ upload: async (file, name) => { if (failFirst && name.startsWith("s-aaaaaaaa")) throw new Error("HTTP 500"); calls.upload.push(name); return "K/" + name; } });
  const r1 = await run({ deps });
  assert.equal(r1.doc.tries, 1);
  assert.match(r1.doc.error, /1\/2 tệp chưa lên kho/);
  assert.equal(r1.doc.files[0].error.startsWith("tải lên"), true);
  assert.ok(r1.doc.files[1].path);
  assert.equal(calls.text.length, 1); // chỉ tệp đã lên kho được đọc chữ
  failFirst = false; calls.download.length = 0;
  const r2 = await run({ deps, prev: r1.doc });
  assert.deepEqual(calls.download[0], [FILES[0].id]);
  assert.equal(r2.doc.error, undefined);
  assert.ok(r2.doc.files.every((f) => f.path));
  assert.match(r2.doc.reason, /Thiếu tài liệu thuế/);
});
test("quá MAX_TRIES vì lỗi tải lên một phần thì giveUp, giữ tệp đã lên", async () => {
  const { deps } = mk({ upload: async (file, name) => { if (name.startsWith("s-aaaaaaaa")) throw new Error("HTTP 500"); return "K/" + name; } });
  let prev = null, last;
  for (let i = 0; i < MAX_TRIES; i++) { last = (await run({ deps, prev })).doc; prev = last; }
  assert.equal(last.giveUp, true);
  assert.ok(last.files[1].path);
});
test("tệp lớn hơn trần: ghi skipped, không tải lên, không phải lỗi", async () => {
  const { deps, calls } = mk({ download: async (todo) => todo.map((x) => ({ id: x.id.toLowerCase(), file: "C:/x/" + x.name, bytes: 60 * 1048576, md5: "M" })) });
  const { doc } = await run({ deps });
  assert.ok(doc.files.every((f) => f.skipped && !f.path));
  assert.equal(doc.error, undefined);
  assert.equal(calls.upload.length, 0);
});
test("hết giờ trước khi bắt đầu: không làm gì, không ghi", async () => {
  const { deps, calls } = mk();
  const r = await run({ deps, deadline: Date.now() - 1 });
  assert.equal(r.doc, null);
  assert.equal(calls.download.length, 0);
});
test("hết giờ giữa chừng: tệp đã lên kho giữ lại với noText, không tính vào tries; lượt sau chỉ đọc chữ, không tải lên lại", async () => {
  const { deps, calls } = mk();
  const r1 = await run({ deps, deadline: Date.now() + 10e3 }); // < 30 giây còn lại: không OCR
  assert.ok(r1.doc.files.every((f) => f.path && f.noText));
  assert.equal(r1.doc.tries, 0);
  assert.match(r1.doc.error, /chưa đọc chữ/);
  assert.equal(calls.text.length, 0);
  calls.upload.length = 0;
  const r2 = await run({ deps, prev: r1.doc });
  assert.equal(calls.upload.length, 0);
  assert.equal(calls.text.length, 2);
  assert.equal(r2.doc.error, undefined);
  assert.match(r2.doc.reason, /Thiếu tài liệu thuế/);
});
test("đã đủ tệp và không có lỗi: không ghi lại", async () => {
  const { deps } = mk();
  const first = await run({ deps });
  const again = await run({ deps, prev: first.doc });
  assert.equal(again.doc, null);
});

// ---------- vòng 2 của review ----------
test("mục kiểu 'b.2.' (và 'b.2)', 'b2.') cắt đoạn của mình, dòng thật của IB2400577658", () => {
  for (const head of ["b.2. Công ty TNHH Thương mại Dịch vụ Võ Gia", "b.2) Công ty TNHH Võ Gia", "b2. Công ty TNHH Võ Gia"]) {
    const r = bcdgReason("b.1. Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên: hồ sơ hợp lệ, đáp ứng.\n" + head + ":\n- Tờ khai thuế thể hiện số thuế còn phải nộp, không đáp ứng.\n- Thiếu catalogue.");
    assert.equal(r, "", head);
  }
  const mine = bcdgReason("b.1. Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:\n- Thiếu bảo đảm dự thầu.\nb.2. Công ty TNHH Thương mại Dịch vụ Võ Gia\n* Về thực hiện nghĩa vụ thuế:\n- Thiếu tờ khai.");
  assert.match(mine, /bảo đảm dự thầu/);
  assert.doesNotMatch(mine, /Võ Gia|tờ khai/);
});
test("OCR quá giờ: tệp giữ lại với noText, có error và tries, thử lại rồi giveUp (không để reason rỗng vĩnh viễn)", async () => {
  const { deps } = mk({ text: () => ({ text: "", ocr: 10, timedOut: true }) });
  let prev = null, last;
  for (let i = 1; i <= MAX_TRIES; i++) {
    last = (await run({ deps, prev })).doc;
    assert.equal(last.tries, i);
    assert.match(last.error, /OCR quá giờ/);
    assert.equal(!!last.giveUp, i === MAX_TRIES);
    assert.ok(last.files.every((f) => f.path));
    prev = last;
  }
  assert.ok(last.files.every((f) => !f.noText));
});
test("OCR quá giờ rồi lần sau đọc được: hết error, có lý do", async () => {
  let slow = true;
  const { deps } = mk({ text: () => (slow ? { text: "", ocr: 5, timedOut: true } : { text: "b3. Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:\n- Thiếu tài liệu thuế", ocr: 5, timedOut: false }) });
  const r1 = await run({ deps });
  assert.equal(r1.doc.reason, "");
  slow = false;
  const r2 = await run({ deps, prev: r1.doc });
  assert.equal(r2.doc.error, undefined);
  assert.match(r2.doc.reason, /Thiếu tài liệu thuế/);
});

// ---------- OCR hai bước (ocr-pdf.js --locate), cờ scan, --reread ----------
test("mentionsUs: chọn trang theo tên/MST chịu lỗi OCR, bỏ dấu; trang không nhắc thì không chọn", () => {
  assert.ok(mentionsUs("Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên: Không đạt"));
  assert.ok(mentionsUs("CONG TY TNHH THIET BI KY THUAT THAO NGUYEN"));
  assert.ok(mentionsUs("Cong ty Thao Nguyén Dat"));      // dấu lạ sau OCR
  assert.ok(mentionsUs("kỹ thuật Thá0 Nguyen"));
  assert.ok(mentionsUs("MST: 4101 623 015"));
  assert.ok(mentionsUs("MST 4101623O15".replace("O", "0")));
  assert.ok(mentionsUs("MST 4101623915"), "sai một chữ số vẫn chọn");
  assert.ok(!mentionsUs("Công ty TNHH Minh Phú: thiếu CO, không đạt"));
  assert.ok(!mentionsUs("Mã số 4101999999 và 12345678901234"));
});
test("scan: OCR quá giờ trước khi in 'OCR n/m' (ocr 0) nhưng ocr-pdf đã báo là scan → scan = true; chữ đọc dở vẫn cho lý do", async () => {
  const { deps } = mk({ text: () => ({ text: "b3. Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:\n- Thiếu tài liệu thuế", ocr: 0, scan: true, timedOut: true }) });
  const { doc } = await run({ deps });
  assert.equal(doc.scan, true);
  assert.match(doc.reason, /Thiếu tài liệu thuế/);
  assert.match(doc.error, /OCR quá giờ/);
  assert.ok(doc.files.every((f) => f.path && f.noText));
});
test("tệp không scan (ocr 0, scan false) → scan false", async () => {
  const { deps } = mk({ text: () => ({ text: "", ocr: 0, scan: false, timedOut: false }) });
  assert.equal((await run({ deps })).doc.scan, false);
});
test("reread: tải lại để đọc chữ, KHÔNG tải lên lại, xoá error/tries/giveUp, thay lý do cũ", async () => {
  const { deps, calls } = mk({ text: () => ({ text: "b3. Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:\n- Thiếu bảo đảm dự thầu", ocr: 3, scan: true, timedOut: false }) });
  const prev = { notifyNo: "K", files: FILES.map((f) => ({ id: f.id, name: f.name, path: "K/old-" + f.id.slice(0, 8), noText: true })), reason: "", scan: false, error: "OCR quá giờ, chưa đọc được chữ", tries: 3, giveUp: true, at: "x" };
  const { doc } = await run({ deps, prev, reread: true });
  assert.equal(calls.upload.length, 0);
  assert.equal(calls.download[0].length, 2);
  assert.match(doc.reason, /bảo đảm dự thầu/);
  assert.equal(doc.error, undefined); assert.equal(doc.tries, undefined); assert.equal(doc.giveUp, undefined);
  assert.equal(doc.scan, true);
  assert.deepEqual(doc.files.map((f) => f.path), prev.files.map((f) => f.path)); // đường dẫn trên kho giữ nguyên
  assert.ok(doc.files.every((f) => !f.noText));
});
test("reread: tệp chưa lên kho (không path) giữ nguyên lỗi, không tải lên; không có tệp nào trên kho → không ghi", async () => {
  const { deps, calls } = mk();
  const prev = { notifyNo: "K", files: [{ id: FILES[0].id, name: "bc1.pdf", path: "K/a" }, { id: FILES[1].id, name: "bc2.pdf", error: "tải lên: HTTP 500" }], error: "x", tries: 1, at: "x" };
  const { doc } = await run({ deps, prev, reread: true });
  assert.equal(calls.upload.length, 0);
  assert.deepEqual(calls.download[0], [FILES[0].id]);
  assert.equal(doc.files[1].error, "tải lên: HTTP 500");
  assert.match(doc.error, /HTTP 500/);
  const none = await run({ deps: mk().deps, prev: { notifyNo: "K", files: [{ id: FILES[0].id, name: "bc1.pdf", error: "e" }, { id: FILES[1].id, name: "bc2.pdf", error: "e" }] }, reread: true });
  assert.equal(none.doc, null);
});
test("liên danh: tên liên danh lấy từ dòng có MST, rồi tìm lý do theo tên đó; 'không đồng bộ' là cụm lý do", () => {
  const r = bcdgReason("Bảng mở thầu\n4 vn4101623015 | Liên danh TN-HA 4205.000.000\n...\n- Liên danh TN-HA: Không đáp ứng về kỹ thuật do không đạt điểm tối thiểu.\n- Công ty TNHH Khác: đạt");
  assert.match(r, /Liên danh TN-HA: Không đáp ứng/);
  assert.doesNotMatch(r, /Khác/);
  assert.match(bcdgReason("4. CÔNG TY TNHH THIẾT BỊ KỸ THUẬT THẢO NGUYÊN\n- Thông số kỹ thuật không đồng bộ từ một nhà sản xuất."), /không đồng bộ/);
});

// ---------- bcdg-3 (2026-11-12): verdict, reread không xoá lý do, hàng bảng / đầu mục OCR hỏng ----------
const PASS_ROW = ["Công ty TNHH thiết bị kỹ thuật Đạt Đạt Đạt", "Thảo Nguyên"];
test("verdict: có khối thuyết minh của mình → fail; mình đạt mọi bước → pass (dòng bảng không là lý do)", () => {
  const f = bcdgReasonEx(BCDG_1203);
  assert.equal(f.verdict, "fail");
  assert.equal(f.source, "thuyet-minh");
  const p = bcdgReasonEx([...PASS_ROW, "- Thuyết minh trong trường hợp E-HSDT không hợp lệ: Không có", "Nhà thầu: CÔNG TY TNHH THIẾT BỊ KỸ THUẬT THẢO NGUYÊN", "Stt Nội dung Đạt Không đạt Đạt | Không đạt", "1 | Bảo đảm dự thầu X"].join("\n"));
  assert.equal(p.verdict, "pass");
  assert.equal(p.text, "");
});
test("verdict pass: phần nội dung bổ sung, làm rõ (có công văn) là text; 'nếu có: Không có' thì không", () => {
  const withClar = [...PASS_ROW, "- Thuyết minh trong trường hợp E-HSDT không hợp lệ: Không có", "- Các nội dung bd sung, làm rõ E-HSDT nhằm chứng minh tư cách hợp lệ của nhà", "thâu:", "+ Công văn của Bên mời thầu số 6337/CV gửi nhà thầu Công ty TNHH thiết bị kỹ thuật Thảo Nguyên về việc làm rõ hóa đơn.", "+ Công văn trả lời của Nhà thầu số 199/CVLR ngày 18/08/2026.", "Nhà thầu: CÔNG TY TNHH THIẾT BỊ KỸ THUẬT THẢO NGUYÊN", "Kết quả đánh giá tự động"].join("\n");
  const a = bcdgReasonEx(withClar);
  assert.equal(a.verdict, "pass");
  assert.match(a.text, /^\+ Công văn của Bên mời thầu/);
  assert.match(a.text, /199\/CVLR/);
  assert.doesNotMatch(a.text, /Nhà thầu: CÔNG TY|Đạt Đạt/);
  const none = bcdgReasonEx(["CONG TY TNHH THIET BỊ KỸ THUẬT Đạt Đạt Đạt", "THAO NGUYEN", "- Thuyết minh trong trường hợp E-HSDT không hợp lệ (kể cả sau khi nhà", "thầu bổ sung, làm rõ (nếu có)): Không có.", "- Các nội dung bổ sung, làm rõ E-HSDT nhằm chứng minh tư cách hợp lệ", "của nhà thầu (nếu có). Chủ đầu tư và văn bản bổ sung, làm rõ E-HSDT của nhà thầu (nếu có): Không", "có."].join("\n"));
  assert.equal(none.verdict, "pass");
  assert.equal(none.text, "");
});
test("verdict '' khi không rõ: không có dòng bảng của mình, hoặc dòng bảng lẫn Không đạt / chữ không đạt khác", () => {
  assert.equal(bcdgReasonEx("Tổ chuyên gia họp ngày 5/8.\nCông ty TNHH Minh Phú Đạt Đạt Đạt").verdict, "");
  assert.equal(bcdgReasonEx("Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên Đạt Đạt Không đạt").verdict, "fail");
  assert.equal(bcdgReasonEx("Công ty TNHH Thiết bị Kỹ thuật Thảo Thông tin khác").verdict, "");
});
test("đầu mục OCR hỏng ('eo Công ty ...' không số) và hàng bảng '1 Công ty ... | lý do' với tên kéo xuống dòng sau", () => {
  const a = bcdgReasonEx(["b. Thuyết minh về các trường hợp không đáp ứng về tính hợp lệ, năng lực, kinh", "nghiệm và kỹ thuật (kể cả sau khi làm rõ):", "", "eo Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên", "- Tính hợp lệ của thiết bị thay thế: nhà thầu chào màu RAL 7036 không đúng yêu cầu RAL 7035.", "- Tổ chuyên gia nêu các ý kiến nhận xét (nếu có): Không có.", "HL KẾT LUẬN VÀ KIẾN NGHỊ", "- Tên nhà thầu được mời đối chiếu: Công ty TNHH Kuta."].join("\n"));
  assert.equal(a.verdict, "fail");
  assert.match(a.text, /RAL 7036/);
  assert.doesNotMatch(a.text, /Kuta|KIẾN NGHỊ/);
  const b = bcdgReasonEx(["b) Thuyết minh về các trường hợp E-HSDT không đạt:", "STT Tên nhà thầu Lý do không đạt", "1 Công ty TNHH thiết bi | + Hồ sơ mời thầu yêu cầu công suất > 405", "kỹ thuật Thảo Nguyen | kVA, nhà thầu chào 180kVA.", "+ Thông số không thể hiện giám sát từ xa.", "c) Các nội dung bổ sung, làm rõ E-HSDT (nếu có): Không có"].join("\n"));
  assert.equal(b.verdict, "fail");
  assert.match(b.text, /180kVA/);
  assert.match(b.text, /giám sát từ xa/);
  assert.doesNotMatch(b.text, /Các nội dung bổ sung/);
  // dòng gạch đầu "- Công ty ..." (danh sách) không phải đầu mục OCR hỏng
  assert.doesNotMatch(bcdgReasonEx(BCDG_1203).text, /^- Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên\.$/m);
});
const DOC_OLD = { notifyNo: "K", files: FILES.map((f) => ({ id: f.id, name: f.name, path: "K/old-" + f.id.slice(0, 8) })), reason: "1) Công ty Thảo Nguyên: bảo hành 48 giờ", verdict: "fail", scan: true, at: "x" };
test("reread: OCR quá giờ / lỗi KHÔNG xoá reason và verdict đang có; chữ đọc dở không thay lý do cũ", async () => {
  const slow = mk({ text: () => ({ text: "", ocr: 0, scan: true, timedOut: true }) });
  const a = (await run({ deps: slow.deps, prev: DOC_OLD, reread: true })).doc;
  assert.equal(a.reason, DOC_OLD.reason); assert.equal(a.verdict, "fail");
  assert.match(a.error, /OCR quá giờ/);
  const part = mk({ text: () => ({ text: "b3. Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:\n- Thiếu bảo đảm dự thầu", ocr: 2, scan: true, timedOut: true }) });
  const b = (await run({ deps: part.deps, prev: DOC_OLD, reread: true })).doc;
  assert.equal(b.reason, DOC_OLD.reason); // chưa đọc hết: không thay
  // lượt thường (không reread) bị lỗi tải lên: giữ reason/verdict
  const up = mk({ upload: async () => { throw new Error("HTTP 500"); } });
  const c = (await run({ deps: up.deps, prev: { ...DOC_OLD, files: [] } })).doc;
  assert.equal(c.reason, DOC_OLD.reason); assert.equal(c.verdict, "fail");
});
test("reread đọc hết: lý do mới thay cũ; đọc hết mà không thấy gì thì xoá (lý do cũ từ lần đọc tệ hơn); chưa đọc hết thì giữ", async () => {
  const good = mk({ text: () => ({ text: "b3. Công ty TNHH Thiết bị Kỹ thuật Thảo Nguyên:\n- Thiếu bảo đảm dự thầu", ocr: 2, scan: true, timedOut: false }) });
  const a = (await run({ deps: good.deps, prev: DOC_OLD, reread: true })).doc;
  assert.match(a.reason, /bảo đảm dự thầu/); assert.equal(a.verdict, "");
  const empty = mk({ text: () => ({ text: "Báo cáo không nhắc ai.", ocr: 0, scan: false, timedOut: false }) });
  const b = (await run({ deps: empty.deps, prev: DOC_OLD, reread: true })).doc;
  assert.equal(b.reason, ""); assert.equal(b.verdict, "");
  const c = (await run({ deps: empty.deps, prev: { ...DOC_OLD, files: DOC_OLD.files.map((f) => ({ ...f, noText: true })) } })).doc; // lượt thường: không xoá
  assert.equal(c.reason, DOC_OLD.reason);
});
test("doc không có verdict (cũ) vẫn qua bước: verdict '' khi chưa đọc lại; gói đạt: verdict pass, reason ''", async () => {
  const { deps } = mk({ text: () => ({ text: [...PASS_ROW, "- Thuyết minh trong trường hợp E-HSDT không hợp lệ: Không có"].join("\n"), ocr: 0, scan: false, timedOut: false }) });
  const { doc, line } = await run({ deps });
  assert.equal(doc.verdict, "pass"); assert.equal(doc.reason, "");
  assert.match(line, /mình đạt/);
  const old = (await run({ deps: mk().deps, prev: { notifyNo: "K", files: [], reason: "x" } })).doc;
  assert.equal(typeof old.verdict, "string");
});
test("19 gói thật: gói nào cũng verdict fail trừ IB2400564384 (rỗng); IB2400393199 và IB2600374560 trích được, không nhà thầu khác", { skip: !fs.existsSync(CORPUS) }, () => {
  const v = {};
  for (const f of fs.readdirSync(CORPUS).filter((x) => x.endsWith(".txt"))) v[f.slice(0, -4)] = bcdgReasonEx(fs.readFileSync(CORPUS + f, "utf8"));
  for (const [k, r] of Object.entries(v)) if (k !== "IB2400564384") assert.equal(r.verdict, "fail", k);
  assert.equal(v.IB2400564384.verdict, "");
  assert.match(v.IB2400393199.text, /Thảo Nguyên[\s\S]*RAL 7036/);
  assert.match(v.IB2600374560.text, /180kVA/);
  for (const k of ["IB2400393199", "IB2600374560"]) assert.doesNotMatch(v[k].text, /Kuta|Hữu Toàn|Forz/i, k);
});
test("verdict: một ô 'Đạt' lẻ (bảng một bước, dòng Không đạt của mình bị OCR xé tên) KHÔNG là pass (IB2400564384)", () => {
  const t = ["Bảng số 02", "3 | CÔNG TY TNHH THIET BỊ KỸ THUẬT THẢO NGUYÊN Đạt", "4 | CÔNG TY CỔ PHẦN SÁNG BAN MAI Đạt", "Bảng số 03", "TNHH THU - Ngoài ra không đáp ứng", "THIẾT BỊ KỸ Không Đạt"].join("\n");
  assert.equal(bcdgReasonEx(t).verdict, "");
});
