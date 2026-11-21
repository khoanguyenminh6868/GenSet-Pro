// Đối chiếu: "Tự kiểm hồ sơ dự thầu" (selfChecks) as checked by checkResult in bot/genbid-hsmt/genbid-sync.js.
// checkResult lives in bot/genbid-hsmt/sync-pure.js (moved there from genbid-sync.js by T5, 2026-11-13).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const { checkResult } = createRequire(import.meta.url)("../bot/genbid-hsmt/sync-pure.js");

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
// ---- tính vào điểm và kết luận (Khoa, 2026-11-12) ----
const E = [ev("bang-chao.pdf", "gói thầu Đập tràn Đơn Dương")];
const mk = (kind, status = "problem", evidence = E) => ({ kind, status, finding: "f", evidence });
const mkItems = () => [
  { requirement: "a", requirementQuote: "Thời gian khắc phục sự cố không quá 24 giờ", offered: "Bảng chào hàng: máy phát điện công suất 180 kVA", status: "met", critical: true, note: "" },
  { requirement: "b", requirementQuote: "Thời gian khắc phục sự cố không quá 24 giờ", offered: "Bảng chào hàng: máy phát điện công suất 180 kVA", status: "met", critical: false, note: "" },
];
function score(selfChecks) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "selfck-"));
  fs.writeFileSync(path.join(dir, "src-req.txt"), REQ); fs.writeFileSync(path.join(dir, "src-sub.txt"), SUB);
  const r = { summary: "x", items: mkItems() };
  if (selfChecks) r.selfChecks = selfChecks;
  checkResult({ kind: "compare" }, r, dir);
  fs.rmSync(dir, { recursive: true, force: true });
  return r;
}
test("không có selfChecks (kết quả cũ): điểm cũ 100, pass, không có selfCheckImpact", () => {
  const r = score(null);
  assert.equal(r.overallScore, 100); assert.equal(r.verdict, "pass"); assert.equal(r.selfCheckImpact, undefined);
});
test("ok và unclear không ảnh hưởng", () => {
  const r = score([mk("package_identity", "ok"), mk("model_consistency", "unclear")]);
  assert.equal(r.overallScore, 100); assert.equal(r.verdict, "pass"); assert.equal(r.selfCheckImpact, undefined);
});
test("problem bị bỏ vì không có bằng chứng thật thì không tính", () => {
  const r = score([mk("package_identity", "problem", [ev("bang-chao.pdf", "câu này không hề có trong hồ sơ dự thầu")])]);
  assert.equal(r.overallScore, 100); assert.equal(r.verdict, "pass");
});
for (const k of ["package_identity", "model_consistency", "catalogue_vs_offer", "row_match"]) {
  test(k + ": như mục critical not_met: 3/5 → 60, fail", () => {
    const r = score([mk(k)]);
    assert.equal(r.overallScore, 60); assert.equal(r.verdict, "fail"); assert.match(r.selfCheckImpact, /1 lỗi nghiêm trọng/);
    assert.equal(r.items.length, 2);
  });
}
test("supporting_docs: như mục missing không critical: 3/4 → 75, at_risk", () => {
  const r = score([mk("supporting_docs")]);
  assert.equal(r.overallScore, 75); assert.equal(r.verdict, "at_risk");
});
test("adverse_wording: như mục partial không critical: 3.5/4 → 88, at_risk", () => {
  const r = score([mk("adverse_wording")]);
  assert.equal(r.overallScore, 88); assert.equal(r.verdict, "at_risk"); assert.match(r.selfCheckImpact, /Nếu không tính tự kiểm: 100/);
});
test("commitment_vs_hsmt: không cộng điểm nhưng không cho pass", () => {
  const r = score([mk("commitment_vs_hsmt")]);
  assert.equal(r.overallScore, 100); assert.equal(r.verdict, "at_risk"); assert.match(r.selfCheckImpact, /cam kết/);
});
test("commitment_vs_hsmt không hạ kết luận đang fail xuống at_risk", () => {
  const r = score([mk("commitment_vs_hsmt"), mk("package_identity")]);
  assert.equal(r.verdict, "fail");
});
