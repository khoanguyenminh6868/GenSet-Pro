// mecca-power: specs/ lệch cn/ (24/11/2026). specs/ có 97 trang nhưng tệp nguồn chỉ giữ cho trang có bảng KHÔNG trùng (merge-specs xoá
// tệp của trang không dùng), nên 74 trang không có tệp không bao giờ được dựng lại bằng tablesOf mới (#1105, #1110) và giữ bảng cũ
// (một bảng gộp hai bảng con). Bảng cũ khác dòng với bảng của trang khác nên merge-specs coi là bảng mới, đòi tệp nguồn n106 → ENOENT.
// Dựng lại 74 trang bằng get + htmlToText + tablesOf hiện tại: bảng nay trùng bảng của trang khác nên merge-specs chạy hết.
// Test giữ: (1) mọi trang merge-specs dùng có tệp nguồn, (2) cn/ đúng bằng kết quả merge-specs (cùng bộ lọc), (3) bảng specs/ của
// trang có tệp đúng bằng tablesOf của tệp.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tablesOf } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ID = "mecca-power";
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8");
const src = read("merge-specs.mjs");
// Bộ lọc lấy nguyên văn từ merge-specs.mjs để hai nơi không lệch nhau.
const FOREIGN = new RegExp(src.match(/const FOREIGN = \/(.*)\/;/)[1]);
const OTHER = new RegExp(src.match(/const OTHER = \/(.*)\/i;/)[1], "i");
const GEN = new RegExp(src.match(/const GEN = \/(.*)\/i;/)[1], "i");
const specs = JSON.parse(read("specs", `${ID}.json`));
const merged = () => {
  const seen = new Set(), out = [];
  for (const t of specs) {
    if (FOREIGN.test([t.title, ...t.header, ...t.rows].join(" ")) || (OTHER.test(t.title) && !GEN.test(t.title))) continue;
    const key = t.rows.join("\n");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
};

test("mecca-power: mọi trang merge-specs dùng có tệp nguồn", () => {
  for (const n of new Set(merged().map((t) => t.n))) assert.ok(fs.existsSync(path.join(ROOT, "sources", ID, `${n}.md`)), `n${n} không có tệp nguồn`);
});

test("mecca-power: cn/ đúng bằng kết quả merge-specs từ specs/", () => {
  const cn = (JSON.parse(read("cn", `${ID}.json`)).specTables || []).filter((t) => t.n < 2000);
  assert.deepEqual(cn.map((t) => [t.n, t.header, t.rows]), merged().map((t) => [t.n, t.header, t.rows]));
});

test("mecca-power: bảng specs/ của trang có tệp nguồn đúng bằng tablesOf của tệp", () => {
  for (const n of new Set(specs.map((t) => t.n))) {
    const f = path.join(ROOT, "sources", ID, `${n}.md`);
    if (!fs.existsSync(f)) continue;
    const want = tablesOf(fs.readFileSync(f, "utf8").split("\n").slice(3).join("\n")).flatMap((t) => [...t.header, ...t.rows]);
    assert.deepEqual(specs.filter((t) => t.n === n).flatMap((t) => [...t.header, ...t.rows]), want, `n${n}`);
  }
});
