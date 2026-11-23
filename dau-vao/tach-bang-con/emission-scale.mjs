// Chỉ số emission "thiếu scale" tăng từ đâu: so MỌI mục emission theo khoá nội dung (vai, model, tổ máy, dòng), trước ↔ sau.
//   node emission-scale.mjs <gốc sau> <gốc trước> <id,id,...> <tệp ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [after, before, ids, outFile] = process.argv.slice(2);
await import(pathToFileURL(path.join(after, "web", "catalog.js")).href);
await import(pathToFileURL(path.join(after, "web", "spec-norm.js")).href);
const C = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
const list = (root, id) => {
  const s = JSON.parse(fs.readFileSync(path.join(root, "suppliers", "cn", `${id}.json`), "utf8")), out = [];
  for (const o of C.fromSupplier(s)) {
    const norm = SN.normalizeRecord(o, s.specTables?.[o.table]?.rows);
    for (const r of Object.values(norm).flat()) if (r && r.key === "emission") out.push({ k: [o.kind, o.model, o.genset ?? "", o.line].join(" ¦ "), raw: typeof r.raw === "object" && r.raw ? String(r.raw.value ?? JSON.stringify(r.raw)) : String(r.raw ?? r.value), noScale: (r.missing || []).includes("scale") });
  }
  return out;
};
const lines = [], tot = { added: 0, addedNo: 0, gone: 0, goneNo: 0, flipBad: 0, flipGood: 0 }, raws = {};
for (const id of ids.split(",")) {
  const a = list(before, id), b = list(after, id), pool = new Map();
  for (const x of a) { const k = x.k + " ¦ " + x.raw; if (!pool.has(k)) pool.set(k, []); pool.get(k).push(x); }
  let add = 0, addNo = 0, flipBad = 0, flipGood = 0;
  for (const y of b) {
    const p = pool.get(y.k + " ¦ " + y.raw);
    if (p && p.length) { const x = p.shift(); if (!x.noScale && y.noScale) flipBad++; if (x.noScale && !y.noScale) flipGood++; continue; }
    add++; if (y.noScale) { addNo++; raws[y.raw] = (raws[y.raw] || 0) + 1; }
  }
  const left = [...pool.values()].flat(), goneNo = left.filter((x) => x.noScale).length;
  tot.added += add; tot.addedNo += addNo; tot.gone += left.length; tot.goneNo += goneNo; tot.flipBad += flipBad; tot.flipGood += flipGood;
  lines.push(`${id}: ${a.length} → ${b.length}; thêm ${add} (thiếu scale ${addNo}); bớt ${left.length} (thiếu scale ${goneNo}); đang có mà mất scale ${flipBad}, được scale ${flipGood}`);
}
lines.push(`TỔNG ${JSON.stringify(tot)}`, `chữ gốc của mục thêm thiếu scale: ${JSON.stringify(Object.entries(raws).sort((x, y) => y[1] - x[1]).slice(0, 15))}`);
fs.writeFileSync(outFile, lines.join("\n") + "\n", "utf8");
console.log(lines.join("\n"));
