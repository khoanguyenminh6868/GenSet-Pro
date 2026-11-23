// So MỌI bản ghi fromSupplier của một hồ sơ trước ↔ sau (cùng catalog.js): thêm / mất / đổi, bỏ qua chỉ số bảng / dòng.
//   node rec-diff.mjs <gốc repo> <hồ sơ trước .json> <hồ sơ sau .json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, fa, fb] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const load = (f) => { const s = JSON.parse(fs.readFileSync(f, "utf8")); const notes = []; return { s, recs: C.fromSupplier(s, notes), notes }; };
const A = load(fa), B = load(fb);
// Khoá: nguồn n + vai + model + tổ máy + chữ dòng. Nội dung: mọi trường trừ chỉ số (table, row, also) và tiêu đề lưu kèm.
const key = (r) => [r.n, r.kind, r.model, r.genset ?? "", r.line ?? ""].join(" ¦ ");
const strip = (r) => { const { table, row, also, header, lines, ...x } = r; return JSON.stringify(x); };
const group = (recs) => { const m = new Map(); for (const r of recs) { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); } return m; };
const ga = group(A.recs), gb = group(B.recs);
let add = 0, del = 0, chg = 0, same = 0, moved = 0;
const out = [];
for (const [k, rb] of gb) {
  const ra = ga.get(k) || [];
  if (rb.length > ra.length) { add += rb.length - ra.length; for (const r of rb.slice(ra.length)) out.push(`THÊM  b${r.table} r${r.row} ${r.kind} ${r.model} | tổ máy ${r.genset} | ${JSON.stringify(r.power)} | hãng ${(r.makes || []).map((m) => m.name).join("/") || "—"} | kia ${r.other ?? "—"} | ${r.line}`); }
  ra.slice(0, rb.length).forEach((x, i) => {
    if (strip(x) !== strip(rb[i])) { chg++; out.push(`ĐỔI   ${k}\n      trước ${strip(x)}\n      sau   ${strip(rb[i])}`); }
    else { same++; if (x.table !== rb[i].table || x.row !== rb[i].row) moved++; }
  });
}
for (const [k, ra] of ga) { const rb = gb.get(k) || []; if (ra.length > rb.length) { del += ra.length - rb.length; for (const r of ra.slice(rb.length)) out.push(`MẤT   b${r.table} r${r.row} ${r.kind} ${r.model} | ${r.line}`); } }
console.log(`trước ${A.recs.length} bản ghi, sau ${B.recs.length}; thêm ${add}, mất ${del}, đổi nội dung ${chg}, y nguyên ${same} (trong đó ${moved} chỉ đổi chỉ số bảng / dòng)`);
out.forEach((x) => console.log(x));
const nk = (n) => `${n.n} ¦ ${n.reason} ¦ ${n.detail}`;
const na = new Set(A.notes.map(nk)), nb = new Set(B.notes.map(nk));
console.log(`\nghi chú: trước ${A.notes.length}, sau ${B.notes.length}`);
for (const x of na) if (!nb.has(x)) console.log("  hết  ", x.slice(0, 200));
for (const x of nb) if (!na.has(x)) console.log("  mới  ", x.slice(0, 200));
