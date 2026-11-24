// specs/ lệch cn/ (specs-dung-lai, 24/11/2026): mọi trang mà merge-specs sẽ dùng (bộ lọc y merge-specs.mjs) phải có tệp nguồn,
// kẻo `merge-specs <id>` chết ENOENT. Sửa một NCC: `node suppliers/rebuild-specs.mjs <id>` rồi `node suppliers/merge-specs.mjs <id>`.
// KNOWN = NCC trong specs-hold.json (merge-specs / rebuild-specs bỏ qua, giữ nguyên specs/ có sửa tay hoặc dựng đường khác).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8");
const src = read("merge-specs.mjs");
const FOREIGN = new RegExp(src.match(/const FOREIGN = \/(.*)\/;/)[1]);
const OTHER = new RegExp(src.match(/const OTHER = \/(.*)\/i;/)[1], "i");
const GEN = new RegExp(src.match(/const GEN = \/(.*)\/i;/)[1], "i");
// zichai n120 / 123 / 124 / 125: tuabin khí M32 và động cơ tàu tốc độ trung bình còn trong specs/ sau #851, chưa vào cn/.
const KNOWN = new Set(Object.keys(JSON.parse(read("specs-hold.json"))));

test("mọi trang merge-specs dùng đều có tệp nguồn", () => {
  const bad = [];
  const list = (d) => (fs.existsSync(path.join(ROOT, d)) ? fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith(".json")) : []);
  for (const f of new Set([...list("specs"), ...list("datasheets")])) {
    const id = f.slice(0, -5);
    if (!fs.existsSync(path.join(ROOT, "cn", f))) continue;
    const found = [...(fs.existsSync(path.join(ROOT, "specs", f)) ? JSON.parse(read("specs", f)) : []), ...(fs.existsSync(path.join(ROOT, "datasheets", f)) ? JSON.parse(read("datasheets", f)) : [])];
    const seen = new Set(), used = new Set();
    for (const t of found) {
      if (FOREIGN.test([t.title, ...t.header, ...t.rows].join(" ")) || (OTHER.test(t.title) && !GEN.test(t.title))) continue;
      const key = t.rows.join("\n");
      if (seen.has(key)) continue;
      seen.add(key);
      used.add(t.n);
    }
    const miss = [...used].filter((n) => !fs.existsSync(path.join(ROOT, "sources", id, `${n}.md`)));
    if (miss.length && !KNOWN.has(id)) bad.push(`${id}: ${miss.join(",")}`);
  }
  assert.deepEqual(bad, []);
});
