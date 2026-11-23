// Quét MỌI hồ sơ cn/: bảng có ghi chú "dòng máy lẫn với dòng tiêu đề" (bộ đọc thấy dòng máy trong tiêu đề mà KHÔNG chuyển),
// và bảng có dòng máy trong tiêu đề đã được chuyển. In theo NCC.  node hdr-scan.mjs <gốc repo> [id]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, only] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(root, "suppliers", "cn");
const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
let mixed = 0, tablesAll = 0;
const bySup = new Map();
for (const s of S) {
  if (only && s.id !== only) continue;
  const notes = [];
  let recs = [];
  try { recs = C.fromSupplier(s, notes); } catch (e) { console.log("LỖI", s.id, e.message); continue; }
  tablesAll += (s.specTables || []).length;
  const mx = notes.filter((x) => /lẫn với dòng tiêu đề|trong tiêu đề/.test(x.reason));
  for (const x of mx) {
    mixed++;
    bySup.set(s.id, (bySup.get(s.id) || 0) + 1);
    const t = s.specTables[x.table];
    console.log(`${s.id} n${x.n} b${x.table} [${x.reason}] header=${t.header.length} rows=${t.rows.length} | ${String(x.detail).slice(0, 110)}`);
  }
}
console.log(`\nhồ sơ: ${S.length}, bảng: ${tablesAll}, bảng có ghi chú: ${mixed}, NCC: ${bySup.size}`);
console.log([...bySup].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", "));
