// Báo cáo đánh giá E-HSDT (BCĐG): bcdg-reason.js (trích lý do) và bcdg-step.js (tải, tải lên, thử lại, bỏ) của bot.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { bcdgReason } = require("../bot/genbid-hsmt/bcdg-reason.js");
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
test("19 gói thật: trích được ≥14 gói, đoạn nào cũng nhắc công ty mình, không có tên người khác", { skip: !fs.existsSync(CORPUS) }, () => {
  let got = 0;
  for (const f of fs.readdirSync(CORPUS).filter((x) => x.endsWith(".txt"))) {
    const r = bcdgReason(fs.readFileSync(CORPUS + f, "utf8"));
    if (!r) continue;
    got++;
    assert.match(r.normalize("NFC"), /th.{0,3}o\s*nguy.{0,3}n|4101623015/i, f);
    assert.doesNotMatch(r, /Nguyễn Thị Thảo Nguyên/i, f);
  }
  assert.ok(got >= 14, "chỉ trích được " + got);
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
