// PR 2: so gensetsOf trước ↔ sau theo NỘI DUNG (bỏ chỉ số bảng / dòng), toàn bộ cn/.
//   node pr2-gensets.mjs <gốc sau> <gốc trước>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [after, before] = process.argv.slice(2);
await import(pathToFileURL(path.join(after, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const body = (g) => { const { table, row, lines, also, header, ...x } = g; return JSON.stringify(x); };
const read = (r, f) => C.gensetsOf(JSON.parse(fs.readFileSync(path.join(r, "suppliers", "cn", f), "utf8")), []).map(body);
let a = 0, b = 0, onlyA = 0, onlyB = 0;
for (const f of fs.readdirSync(path.join(after, "suppliers", "cn"))) {
  if (!f.endsWith(".json")) continue;
  const x = read(before, f), y = read(after, f), left = [...y];
  a += x.length; b += y.length;
  let miss = 0;
  for (const v of x) { const i = left.indexOf(v); if (i >= 0) left.splice(i, 1); else miss++; }
  onlyA += miss; onlyB += left.length;
  if (miss || left.length) console.log(`${f}: chỉ trước ${miss}, chỉ sau ${left.length}`);
}
console.log(`tổ máy ${a} → ${b}; khác nội dung: chỉ trước ${onlyA}, chỉ sau ${onlyB}`);
