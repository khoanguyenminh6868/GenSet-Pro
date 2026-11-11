// Đối chiếu: "Tự kiểm hồ sơ dự thầu" (selfChecks) as checked by checkResult in bot/genbid-hsmt/genbid-sync.js.
// The bot script is not a module, so the checking code is cut out of it and run in a vm.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bot", "genbid-hsmt", "genbid-sync.js"), "utf8");
const from = src.indexOf("const normTxt"), to = src.indexOf("async function runFinish");
assert.ok(from > 0 && to > from, "không tìm thấy phần kiểm kết quả trong genbid-sync.js");
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const { checkResult } = vm.runInNewContext(src.slice(from, to) + "\n({ checkResult })", { fs, path, readJson, console });

const pad = " Quy định chung về thực hiện hợp đồng và nghiệm thu thiết bị theo hồ sơ mời thầu của gói thầu này.".repeat(5);
const REQ = `Gói thầu: Mua sắm máy phát điện 405 kVA tại Trạm bơm Đức Trọng. Thời gian khắc phục sự cố không quá 24 giờ.${pad}`;
const SUB = `--- Tệp: bang-chao.pdf ---\nBảng chào hàng: máy phát điện công suất 180 kVA cho gói thầu Đập tràn Đơn Dương.${pad}\n`
  + `--- Tệp: bien-phap.pdf ---\nBiện pháp thi công tại Trạm bơm Đức Trọng. Mọi khiếu nại sau đó của chủ đầu tư sẽ không được chấp nhận.${pad}\n`;

function run(selfChecks, sub = SUB) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "selfck-"));
  fs.writeFileSync(path.join(dir, "src-req.txt"), REQ);
  fs.writeFileSync(path.join(dir, "src-sub.txt"), sub);
  const result = { summary: "x", items: [], selfChecks };
  const notes = checkResult({ kind: "compare" }, result, dir);
  fs.rmSync(dir, { recursive: true, force: true });
  return { result, notes };
}
const ev = (file, quote) => ({ file, quote });

test("phát hiện có câu trích đúng, đúng tệp: giữ nguyên", () => {
  const { result, notes } = run([{ kind: "package_identity", status: "problem", finding: "Bảng chào ghi gói khác", evidence: [ev("bang-chao.pdf", "máy phát điện công suất 180 kVA cho gói thầu Đập tràn Đơn Dương")], hsmtQuote: "Mua sắm máy phát điện 405 kVA tại Trạm bơm Đức Trọng", fix: "Sửa" }]);
  assert.equal(result.selfChecks.length, 1);
  assert.equal(result.selfChecks[0].evidence[0].file, "bang-chao.pdf");
  assert.equal(result.selfChecks[0].hsmtQuote, "Mua sắm máy phát điện 405 kVA tại Trạm bơm Đức Trọng");
  assert.ok(!notes.some((n) => /bỏ \d+ phát hiện/.test(n)));
});
test("problem không có câu trích thật: bỏ", () => {
  const { result, notes } = run([{ kind: "adverse_wording", status: "problem", finding: "Câu bất lợi", evidence: [ev("bien-phap.pdf", "chủ đầu tư phải bồi thường mọi thiệt hại phát sinh")] }]);
  assert.equal(result.selfChecks.length, 0);
  assert.ok(notes.some((n) => /bỏ 1 phát hiện/.test(n)));
});
test("câu trích đúng nhưng ghi sai tên tệp: giữ câu, bỏ tên tệp", () => {
  const { result } = run([{ kind: "adverse_wording", status: "problem", finding: "Câu bất lợi", evidence: [ev("khong-co.pdf", "Mọi khiếu nại sau đó của chủ đầu tư sẽ không được chấp nhận")] }]);
  assert.equal(result.selfChecks[0].evidence[0].file, "");
});
test("câu trích đặt sai tệp: vẫn thấy trong HSDT nên giữ, tên tệp lấy theo tệp có chữ đó khi khớp", () => {
  const { result } = run([{ kind: "adverse_wording", status: "problem", finding: "x", evidence: [ev("bang-chao.pdf", "Mọi khiếu nại sau đó của chủ đầu tư sẽ không được chấp nhận")] }]);
  assert.equal(result.selfChecks.length, 1);
  assert.equal(result.selfChecks[0].evidence[0].file, "bang-chao.pdf");
});
test("ok không có câu trích thành unclear; unclear giữ", () => {
  const { result } = run([
    { kind: "model_consistency", status: "ok", finding: "Khớp", evidence: [] },
    { kind: "supporting_docs", status: "unclear", finding: "Chưa rõ", evidence: [] },
  ]);
  assert.equal(result.selfChecks.map((c) => c.status).join(), "unclear,unclear");
});
test("hsmtQuote bịa bị bỏ, kind lạ bị loại", () => {
  const { result } = run([
    { kind: "row_match", status: "problem", finding: "Sai dòng", evidence: [ev("bang-chao.pdf", "Bảng chào hàng máy phát điện công suất 180 kVA")], hsmtQuote: "Yêu cầu màu RAL 7035 cho nắp máng" },
    { kind: "bi_ia", status: "problem", finding: "x", evidence: [ev("bang-chao.pdf", "Bảng chào hàng")] },
  ]);
  assert.equal(result.selfChecks.length, 1);
  assert.equal(result.selfChecks[0].hsmtQuote, null);
});
test("kết quả cũ không có selfChecks vẫn chạy; một tệp thì ghi chú không kiểm chéo được", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "selfck-"));
  fs.writeFileSync(path.join(dir, "src-req.txt"), REQ);
  fs.writeFileSync(path.join(dir, "src-sub.txt"), `--- Tệp: a.pdf ---\nBảng chào${pad}`);
  const result = { summary: "x", items: [] };
  checkResult({ kind: "compare" }, result, dir);
  fs.rmSync(dir, { recursive: true, force: true });
  assert.equal(result.selfChecks.length, 0);
  assert.match(result.selfCheckNote, /một tệp/);
});
test("selfChecks không đổi điểm và kết luận", () => {
  const items = [{ requirement: "Thời gian khắc phục sự cố không quá 24 giờ", requirementQuote: "Thời gian khắc phục sự cố không quá 24 giờ", offered: null, status: "missing", critical: false, note: "" }];
  const a = run([]).result, dir = fs.mkdtempSync(path.join(os.tmpdir(), "selfck-"));
  fs.writeFileSync(path.join(dir, "src-req.txt"), REQ); fs.writeFileSync(path.join(dir, "src-sub.txt"), SUB);
  const r1 = { summary: "x", items: structuredClone(items), selfChecks: [] }, r2 = { summary: "x", items: structuredClone(items), selfChecks: [{ kind: "package_identity", status: "problem", finding: "f", evidence: [ev("bang-chao.pdf", "gói thầu Đập tràn Đơn Dương")] }] };
  checkResult({ kind: "compare" }, r1, dir); checkResult({ kind: "compare" }, r2, dir);
  fs.rmSync(dir, { recursive: true, force: true });
  assert.equal(r1.overallScore, r2.overallScore); assert.equal(r1.verdict, r2.verdict); assert.ok(a);
});
