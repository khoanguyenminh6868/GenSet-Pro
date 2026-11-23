// Mọi bảng MỚI (tablesOf mới có, cũ không) trên mọi tệp nguồn: in gọn tiêu đề + số dòng + dòng đầu / cuối.
//   node newtabs.mjs <gốc cũ> <gốc mới> <out.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [oldRoot, newRoot, outFile] = process.argv.slice(2);
const load = async (r) => (await import(pathToFileURL(path.join(r, "suppliers", "crawl-specs.mjs")).href));
const O = await load(oldRoot), N = await load(newRoot);
const src = path.join(newRoot, "suppliers", "sources");
const key = (t) => t.header.join("\n") + "\n##\n" + t.rows.join("\n");
const all = [];
let changed = 0;
for (const id of fs.readdirSync(src).sort()) {
  const dir = path.join(src, id);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir).sort((a, b) => parseInt(a) - parseInt(b))) {
    const m = /^(\d+)\.md$/.exec(f); if (!m || +m[1] < 101 || +m[1] > 999) continue;
    const text = fs.readFileSync(path.join(dir, f), "utf8"), lines = text.split(/\r?\n/);
    const a = O.tablesOf(text), b = N.tablesOf(text);
    // bảng cũ phải là TIỀN TỐ nguyên vẹn của danh sách mới
    if (JSON.stringify(b.slice(0, a.length)) !== JSON.stringify(a)) { changed++; console.log(`!! BẢNG CŨ ĐỔI: ${id} n${m[1]}`); }
    for (const t of b.slice(a.length)) all.push({ id, n: +m[1], header: t.header, rows: t.rows, at: lines.indexOf(t.rows[0]) + 1 });
  }
}
fs.writeFileSync(outFile, JSON.stringify(all, null, 1), "utf8");
console.log(`tệp có bảng cũ đổi: ${changed}; bảng mới: ${all.length}; dòng: ${all.reduce((s, t) => s + t.rows.length, 0)}; NCC: ${new Set(all.map((t) => t.id)).size}`);
for (const t of all) {
  console.log(`\n${t.id} n${t.n} L${t.at}: ${t.rows.length} dòng`);
  for (const h of t.header) console.log(`   H ${h.slice(0, 200)}`);
  console.log(`   R ${t.rows[0].slice(0, 200)}`);
  if (t.rows.length > 1) console.log(`   R ${t.rows[t.rows.length - 1].slice(0, 200)}`);
}
