import test from "node:test";
import assert from "node:assert/strict";
import { violationKey, diffViolations, reportMd, webDoc } from "./spec-value-gate.mjs";

const V = (o = {}) => ({ part: "engine", field: "disp", model: "6BT5.9", supplier: "acme", value: 59, raw: "59 L", row: "6BT5.9 | 59 L", src: { supplierId: "acme", n: 3, table: 1, row: 4 }, rule: "ngoai-dai", level: "sai", detail: "59 ngoài 0.3-100", ...o });

test("khoá bền: đổi vị trí dòng không đổi khoá; đổi chữ dòng, nguồn, luật, giá trị thì đổi", () => {
  const k = violationKey(V());
  assert.equal(violationKey(V({ src: { supplierId: "acme", n: 3, table: 9, row: 77 } })), k);
  for (const o of [{ row: "khác" }, { src: { n: 4 } }, { rule: "don-vi" }, { value: 60 }, { supplier: "b" }, { field: "cyl" }, { model: "X" }]) assert.notEqual(violationKey(V(o)), k);
});

test("lần đầu chưa có mốc: chỉ lưu, không báo ca nào", () => {
  const d = diffViolations(null, [V(), V({ model: "B" })]);
  assert.equal(d.baseline, true);
  assert.equal(d.added.length, 0);
  assert.equal(d.keys.length, 2);
  assert.match(reportMd(d), /Lần chạy đầu/);
});

test("so với lần trước: ca mới, ca đã hết, ca giữ nguyên", () => {
  const prev = diffViolations(null, [V(), V({ model: "B" })]).keys;
  const d = diffViolations(prev, [V(), V({ model: "C" })]);
  assert.equal(d.baseline, false);
  assert.deepEqual(d.added.map((v) => v.model), ["C"]);
  assert.equal(d.resolved, 1);
  assert.equal(d.total, 2);
});

test("chỉ giá trị sai tính; chưa chuẩn không báo; trùng khoá tính một", () => {
  const d = diffViolations([], [V({ level: "chua-chuan" }), V(), V()]);
  assert.equal(d.added.length, 1);
  assert.equal(d.keys.length, 1);
});

test("báo cáo gom theo NCC, đủ trường, model, giá trị, chữ gốc, nguồn, luật", () => {
  const d = diffViolations([], [V(), V({ model: "B", supplier: "zed" }), V({ model: "C" })]);
  const md = reportMd(d, { soft: 5 });
  assert.match(md, /### acme \(2\)/);
  assert.match(md, /### zed \(1\)/);
  assert.ok(md.indexOf("### acme") < md.indexOf("### zed"));
  assert.match(md, /engine\.disp \| 6BT5\.9 \| 59 \| 59 L \| 3 \| ngoai-dai/);
  assert.match(md, /3 giá trị sai mới/);
  assert.match(md, /5 giá trị "chưa chuẩn"/);
  assert.match(md, /không có gì bị chặn/i);
});

test("báo cáo cắt 50 ca mỗi NCC; doc ghi chỉ có khoá", () => {
  const list = Array.from({ length: 60 }, (_, i) => V({ model: "M" + i }));
  const d = diffViolations([], list);
  assert.match(reportMd(d), /còn 10 ca nữa/);
  const doc = webDoc(d.keys, "2026-11-24T00:00:00Z");
  assert.deepEqual(Object.keys(doc).sort(), ["at", "commit", "keys"]);
  assert.equal(doc.keys.length, 60);
});
