// So HAI bản catalog.js (trước ↔ sau) trên MỌI hồ sơ suppliers/cn của <gốc repo>: fromSupplier từng bản ghi, rồi build().
//   node ab.mjs <catalog trước .js> <catalog sau .js> <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [fa, fb, root] = process.argv.slice(2);
const load = async (f) => { delete globalThis.GenbidCatalog; await import(pathToFileURL(path.resolve(f)).href); return globalThis.GenbidCatalog; };
const A = await load(fa), B = await load(fb);
const dir = path.join(root, "suppliers", "cn");
const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const key = (r) => [r.n, r.table, r.row, r.kind, r.model, r.genset ?? "", r.line ?? ""].join(" ¦ ");
const strip = (r) => { const { header, lines, ...x } = r; return JSON.stringify(x); };
let tot = 0, add = 0, del = 0, chg = 0; const bySup = new Map(), fields = new Map();
console.log("== fromSupplier ==");
for (const s of S) {
  const ra = A.fromSupplier(s, []), rb = B.fromSupplier(JSON.parse(JSON.stringify(s)), []);
  tot += ra.length;
  const ga = new Map(), gb = new Map();
  for (const r of ra) ga.set(key(r), [...(ga.get(key(r)) || []), r]);
  for (const r of rb) gb.set(key(r), [...(gb.get(key(r)) || []), r]);
  for (const [k, l] of gb) {
    const o = ga.get(k) || [];
    if (l.length > o.length) { add += l.length - o.length; console.log(`THÊM ${s.id} ${k}`); }
    o.slice(0, l.length).forEach((x, i) => {
      if (strip(x) === strip(l[i])) return;
      chg++; bySup.set(s.id, (bySup.get(s.id) || 0) + 1);
      const d = [];
      for (const f of new Set([...Object.keys(x), ...Object.keys(l[i])])) if (f !== "header" && f !== "lines" && JSON.stringify(x[f]) !== JSON.stringify(l[i][f])) { d.push(`${f}: ${JSON.stringify(x[f])} → ${JSON.stringify(l[i][f])}`); fields.set(f, (fields.get(f) || 0) + 1); }
      console.log(`ĐỔI ${s.id} n${x.n} b${x.table} r${x.row} ${x.kind} ${x.model} | tổ máy ${x.genset ?? "—"} | kia ${x.other ?? "—"}\n     ${d.join("\n     ")}\n     dòng: ${String(x.line || "").slice(0, 160)}`);
    });
  }
  for (const [k, o] of ga) { const l = gb.get(k) || []; if (o.length > l.length) { del += o.length - l.length; console.log(`MẤT ${s.id} ${k}`); } }
}
console.log(`\nTỔNG fromSupplier: ${S.length} hồ sơ, ${tot} bản ghi trước; thêm ${add}, mất ${del}, đổi ${chg}`);
console.log("đổi theo NCC:", [...bySup].map(([k, v]) => `${k} ${v}`).join("; ") || "—");
console.log("đổi theo trường:", [...fields].map(([k, v]) => `${k} ${v}`).join("; ") || "—");
console.log("\n== build() ==");
const BA = A.build(S), BB = B.build(JSON.parse(JSON.stringify(S)));
const noUses = (v) => { const { uses, ...r } = v; return JSON.stringify(r); };
for (const part of Object.keys(BB)) {
  if (!Array.isArray(BB[part])) continue;
  const a = new Map(BA[part].map((v) => [v.key ?? v.model, v])), b = new Map(BB[part].map((v) => [v.key ?? v.model, v]));
  let same = 0; const out = [];
  for (const [k, v] of b) {
    const o = a.get(k);
    if (!o) { out.push(`  KHOÁ MỚI ${k}`); continue; }
    const us = JSON.stringify((o.uses || []).map(strip)) === JSON.stringify((v.uses || []).map(strip));
    if (noUses(o) === noUses(v) && us) { same++; continue; }
    const d = [];
    for (const f of new Set([...Object.keys(o), ...Object.keys(v)])) if (f !== "uses" && JSON.stringify(o[f]) !== JSON.stringify(v[f])) d.push(`${f}: ${JSON.stringify(o[f])?.slice(0, 220)} → ${JSON.stringify(v[f])?.slice(0, 220)}`);
    if (!us) d.push(`uses đổi (${(o.uses || []).length} → ${(v.uses || []).length} dòng; có cờ makeAsk: ${(v.uses || []).filter((u) => u.makeAsk).length})`);
    out.push(`  ĐỔI ${k} (${v.model}; NCC ${(v.suppliers || []).length}): ${d.join(" ; ")}`);
  }
  for (const k of a.keys()) if (!b.has(k)) out.push(`  KHOÁ MẤT ${k}`);
  console.log(`\n${part}: ${a.size} → ${b.size} khoá; y nguyên ${same}; khác ${out.length}`);
  out.forEach((x) => console.log(x));
}
