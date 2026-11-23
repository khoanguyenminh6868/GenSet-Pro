// Dòng máy trong tệp nguồn của baifa / taihai / hnd vẫn chưa nằm trong rows của bảng nào (tablesOf của gốc đưa vào).
//   node rest84.mjs <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root] = process.argv.slice(2);
const N = await import(pathToFileURL(path.join(root, "suppliers", "crawl-specs.mjs")).href);
for (const id of ["baifa-power", "taihai-taizhou", "hnd-henan"]) {
  const dir = path.join(root, "suppliers", "sources", id), have = new Set(), all = new Map();
  for (const f of fs.readdirSync(dir)) {
    const m = /^(\d+)\.md$/.exec(f);
    if (!m || +m[1] < 101 || +m[1] > 999) continue;
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    for (const t of N.tablesOf(text)) for (const r of t.rows) have.add(r);
    text.split(/\r?\n/).forEach((l, i) => { if (l.startsWith("|") && N.isMachineRow(l) && !all.has(l)) all.set(l, `n${m[1]} L${i + 1}`); });
  }
  const left = [...all].filter(([l]) => !have.has(l));
  console.log(`${id}: dòng máy khác nhau ${all.size}, còn ngoài bảng ${left.length}`);
  for (const [l, at] of left.slice(0, 10)) console.log(`   ${at} [${l.split("|").length}] ${l.slice(0, 110)}`);
}
