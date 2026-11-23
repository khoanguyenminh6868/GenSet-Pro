// Dòng máy (isMachineRow) có trong tệp nguồn crawl (sources/<id>/<n>.md, n 101–999) mà KHÔNG nằm trong bảng nào của hồ sơ
// (mọi n của NCC đó: merge-specs bỏ bảng trùng dòng giữa các trang). Đếm theo NCC, dòng khác nhau.
//   node dropped.mjs <gốc repo> [id để in từng dòng]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, show] = process.argv.slice(2);
const { isMachineRow } = await import(pathToFileURL(path.join(root, "suppliers", "crawl-specs.mjs")).href);
const sup = path.join(root, "suppliers");
let total = 0, sups = 0, withSrc = 0; const by = [];
for (const f of fs.readdirSync(path.join(sup, "cn")).filter((f) => f.endsWith(".json")).sort()) {
  const rec = JSON.parse(fs.readFileSync(path.join(sup, "cn", f), "utf8"));
  const tabs = (rec.specTables || []).filter((t) => t.n >= 101 && t.n <= 999);
  if (!tabs.length) continue;
  withSrc++;
  const have = new Set(tabs.flatMap((t) => [...(t.header || []), ...(t.rows || [])]));
  const miss = new Set();
  for (const n of new Set(tabs.map((t) => t.n))) {
    const file = path.join(sup, "sources", rec.id, `${n}.md`);
    if (!fs.existsSync(file)) continue;
    for (const l of fs.readFileSync(file, "utf8").split(/\r?\n/)) if (l.startsWith("|") && !have.has(l) && isMachineRow(l)) miss.add(l);
  }
  if (miss.size) { total += miss.size; sups++; by.push([rec.id, miss.size]); if (show === rec.id) for (const l of miss) console.log("   " + l); }
}
console.log(`NCC có bảng crawl: ${withSrc}; NCC có dòng máy trong nguồn không vào bảng nào: ${sups}; tổng dòng (khác nhau mỗi NCC): ${total}`);
console.log(by.sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${k} ${v}`).join(", "));
