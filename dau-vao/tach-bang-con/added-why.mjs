// Mỗi bản ghi THÊM: bảng cũ chứa dòng đó có tiêu đề gì, bảng mới có tiêu đề gì; gom theo cặp để giải thích vì sao trước không ra bản ghi.
//   node added-why.mjs <gốc sau> <gốc trước> <thư mục audit> <id,id,...>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [after, before, dir, ids] = process.argv.slice(2);
await import(pathToFileURL(path.join(after, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const load = (r, id) => JSON.parse(fs.readFileSync(path.join(r, "suppliers", "cn", `${id}.json`), "utf8"));
const short = (h) => h.map((x) => x.slice(0, 62)).join(" // ");
for (const id of ids.split(",")) {
  const a = load(before, id), b = load(after, id), rows = fs.readFileSync(path.join(dir, `${id}.tsv`), "utf8").split("\n").filter((l) => l.startsWith("THÊM"));
  const recs = C.fromSupplier(b, []), m = new Map();
  for (const l of rows) {
    const [, nn, kind, model, genset] = l.split("\t");
    const r = recs.find((x) => `n${x.n}` === nn && x.kind === kind && x.model === model && (x.genset ?? "") === genset);
    if (!r) { const k = "không tìm lại được bản ghi"; m.set(k, { c: (m.get(k)?.c || 0) + 1, ex: model }); continue; }
    const o = a.specTables.find((t) => t.n === r.n && t.rows.includes(r.line)) || a.specTables.find((t) => t.rows.includes(r.line));
    const q = b.specTables.find((t) => t.n === r.n && t.rows.includes(r.line) && t.header.length);
    const k = `${r.kind} n${r.n}\n   cũ (${o ? o.rows.length + " dòng" : "không có bảng"}): ${o ? short(o.header) : "—"}\n   mới (${q ? q.rows.length + " dòng" : "?"}): ${q ? short(q.header) : "—"}`;
    m.set(k, { c: (m.get(k)?.c || 0) + 1, ex: `${r.genset ?? ""} ${r.model}` });
  }
  console.log(`=== ${id}: ${rows.length} bản ghi thêm, ${m.size} nhóm`);
  for (const [k, e] of [...m].sort((x, y) => y[1].c - x[1].c).slice(0, 7)) console.log(`${e.c} × ${k}\n   vd ${e.ex}`);
}
