// node --test web/test/cap-read.test.mjs — đọc công suất của cột Công Suất (capFromText, capFromDocsText của web/index.html).
// Khoa 17/11/2026, gói IB2600612866: "Công suất liên tục ≥ 8.5 ±0.5KVA; công suất tối đa ≥ 9.35 kVA" hiện "0,5 kVA, 9,35 kVA".
// Số sau "±" / "+/-" là dung sai, không phải công suất (như noTolerance của suppliers/config-bot.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const HTML = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "index.html"), "utf8");
// Lấy nguyên văn khai báo từ index.html: từ dòng bắt đầu bằng `head` tới dòng "}" (hàm) hoặc chính dòng đó (const).
function decl(head) {
  const lines = HTML.split("\n"), i = lines.findIndex((l) => l.startsWith(head));
  assert.ok(i >= 0, `không thấy "${head}" trong index.html`);
  if (!head.startsWith("function")) return lines[i];
  const j = lines.findIndex((l, k) => k > i && l === "}");
  return lines.slice(i, j + 1).join("\n");
}
const src = ["const CAP_RE", "const noTolerance", "function capFromText", "function capFromDocsText"].map(decl).join("\n");
const ctx = { window: {} };
vm.runInNewContext(`${src}\nthis.capFromText = capFromText; this.capFromDocsText = capFromDocsText;`, ctx);
const plain = (o) => JSON.parse(JSON.stringify(o));

test("dung sai ± không thành công suất (câu thật của IB2600612866)", () => {
  assert.deepEqual(plain(ctx.capFromText("Công suất liên tục ≥ 8.5 ±0.5KVA; công suất tối đa ≥ 9.35 kVA (1 pha, 220V/50Hz)")), { text: "8,5 kVA, 9,35 kVA", n: 8.5 });
  assert.deepEqual(plain(ctx.capFromText("12 +/- 0,5 kW")), { text: "12 kW", n: 12 });
  assert.deepEqual(plain(ctx.capFromText("Máy phát điện 500 kVA")), { text: "500 kVA", n: 500 });
});

test("đọc tệp HSMT: lấy 8,5 chứ không lấy 0,5", () => {
  const c = ctx.capFromDocsText("Công suất liên tục ≥ 8.5 ±0.5KVA\nCông suất tối đa ≥ 9.35 kVA\nCông suất liên tục của tổ máy 8.5 kVA");
  assert.equal(c.n, 8.5);
  assert.doesNotMatch(c.text, /(^|, )0,5 kVA/);
});
