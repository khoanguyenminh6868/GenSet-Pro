// Soát khối "có điều kiện khác tiêu đề" của gap6.tsv: tần số bản ghi so với chữ Hz của CHÍNH dòng (toàn bộ bản ghi của trang).
//   node pr2-gap6.mjs <gốc> <id:n,id:n,...>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, list] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog, cache = new Map();
const recs = (id) => { if (!cache.has(id)) cache.set(id, C.fromSupplier(JSON.parse(fs.readFileSync(path.join(root, "suppliers", "cn", `${id}.json`), "utf8")), [])); return cache.get(id); };
for (const item of list.split(",")) {
  const [id, n] = item.split(":"), R = recs(id).filter((r) => r.n === +n), s = {};
  for (const r of R) {
    const hz = [...new Set((String(r.line ?? "").match(/\b(50|60)\s*hz/gi) || []).map((x) => x.replace(/\D/g, "")))].join("/") || "dòng không ghi";
    const k = `dòng ${hz} → bản ghi ${r.freq ?? "—"}`;
    s[k] = (s[k] || 0) + 1;
  }
  console.log(`${id} n${n}: ${R.length} bản ghi; ${Object.entries(s).map(([k, v]) => `${v} × ${k}`).join("; ") || "không có bản ghi"}`);
}
