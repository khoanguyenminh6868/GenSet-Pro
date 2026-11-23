// Hai câu hỏi trên kết quả classified.tsv:
// (1) dòng máy "thêm" của mỗi NCC: bao nhiêu dòng KHÁC NHAU, bao nhiêu đã có ở trang khác của chính NCC (bảng cũ, mọi trang).
// (2) nhóm bảng một dòng (suspect.txt) theo NCC + vì sao.
//   node check2.mjs <gốc cũ> <gốc mới> <thư mục m1>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [oldRoot, newRoot, dir] = process.argv.slice(2);
const O = await import(pathToFileURL(path.join(oldRoot, "suppliers", "crawl-specs.mjs")).href);
const src = path.join(newRoot, "suppliers", "sources");
const rows = fs.readFileSync(path.join(dir, "classified.tsv"), "utf8").split("\n").filter((l) => l.startsWith("them:")).map((l) => l.split("\t"));
const ids = [...new Set(rows.map((r) => r[1]))];
for (const id of ids) {
  const have = new Set();
  for (const f of fs.readdirSync(path.join(src, id))) {
    const m = /^(\d+)\.md$/.exec(f);
    if (!m || +m[1] < 101 || +m[1] > 999) continue;
    for (const t of O.tablesOf(fs.readFileSync(path.join(src, id, f), "utf8"))) for (const r of t.rows) have.add(r.slice(0, 150));
  }
  const mine = rows.filter((r) => r[1] === id), uniq = new Set(mine.map((r) => r[3]));
  const fresh = [...uniq].filter((r) => !have.has(r));
  console.log(`${id}: lượt thêm ${mine.length}, dòng khác nhau ${uniq.size}, chưa có ở bất kỳ trang nào của NCC ${fresh.length}`);
}
const sus = fs.readFileSync(path.join(dir, "suspect.txt"), "utf8").split("\n").filter(Boolean);
const by = {};
for (const l of sus) { const id = l.split(" ")[0]; by[id] = (by[id] || 0) + 1; }
console.log("bảng một dòng / không tiêu đề theo NCC:", JSON.stringify(by));
console.log("--- mẫu younes-bros (dòng thêm):");
rows.filter((r) => r[1] === "younes-bros").slice(0, 4).forEach((r) => console.log(r[2], r[3]));
