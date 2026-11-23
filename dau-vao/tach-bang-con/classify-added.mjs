// Phân loại MỌI dòng thêm vào rows và MỌI dòng rời rows sang header (tablesOf cũ ↔ mới), theo NCC. Không ghi vào repo.
//   node classify-added.mjs <gốc cũ> <gốc mới> <tệp ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [oldRoot, newRoot, outFile] = process.argv.slice(2);
const load = (r) => import(pathToFileURL(path.join(r, "suppliers", "crawl-specs.mjs")).href);
const O = await load(oldRoot), N = await load(newRoot);
const src = path.join(newRoot, "suppliers", "sources");
const tally = new Map(), detail = [];
const bump = (id, k) => { if (!tally.has(id)) tally.set(id, {}); tally.get(id)[k] = (tally.get(id)[k] || 0) + 1; };
for (const id of fs.readdirSync(src).sort()) {
  const dir = path.join(src, id);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    const m = /^(\d+)\.md$/.exec(f);
    if (!m || +m[1] < 101 || +m[1] > 999) continue;
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    const a = O.tablesOf(text), b = N.tablesOf(text);
    const ra = new Set(a.flatMap((t) => t.rows)), ha = new Set(a.flatMap((t) => t.header));
    const rb = new Set(b.flatMap((t) => t.rows)), hb = new Set(b.flatMap((t) => t.header));
    for (const r of rb) if (!ra.has(r)) {
      const k = (ha.has(r) ? "them:tu-tieu-de-cu" : "them:ngoai-bang") + (O.isMachineRow(r) ? ":dong-may" : ":khac");
      bump(id, k); detail.push(`${k}\t${id}\tn${m[1]}\t${r.slice(0, 150)}`);
    }
    for (const r of ra) if (!rb.has(r)) {
      const k = (hb.has(r) ? "roi:sang-tieu-de" : "roi:mat") + (O.isMachineRow(r) ? ":dong-may" : ":khac");
      bump(id, k); detail.push(`${k}\t${id}\tn${m[1]}\t${r.slice(0, 150)}`);
    }
  }
}
fs.writeFileSync(outFile, detail.join("\n") + "\n", "utf8");
const total = {};
for (const v of tally.values()) for (const [k, c] of Object.entries(v)) total[k] = (total[k] || 0) + c;
console.log("TỔNG", JSON.stringify(total));
for (const id of ["baifa-power", "taihai-taizhou", "hnd-henan", "rcg-power"]) console.log(id, JSON.stringify(tally.get(id) || {}));
const others = [...tally].filter(([id]) => !["baifa-power", "taihai-taizhou", "hnd-henan", "rcg-power"].includes(id)).map(([id, v]) => `${id}:${Object.entries(v).map(([k, c]) => k.replace(/^(them|roi):/, "$1 ") + "=" + c).join(",")}`);
console.log("NCC khác:", others.length); console.log(others.slice(0, 40).join("\n"));
