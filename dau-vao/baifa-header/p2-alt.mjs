// Điểm 2: bản ghi đầu phát mà MÃ mang tiền tố của một hãng nhưng hãng gán cho bản ghi là hãng KHÁC.
// Bảng tiền tố → hãng dưới đây là hiểu biết chung về dòng sản phẩm (KHÔNG lấy từ nguồn NCC nào), chỉ để đếm:
//   LSA / TAL → Leroy-Somer; UCI / UCDI / UCM / HCI / HCM / HCK / PI + số / S0L–S9L → Stamford; ECO / ECP → Mecc Alte.
//   node p2-alt.mjs <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(root, "suppliers", "cn");
const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const FAM = [
  ["Leroy-Somer", /^(LSA\s?\d|TAL[\s-]?A?\d)/i],
  ["Stamford", /^(UC[DIM]{1,2}\s?\d|HC[IMK]\s?\d|PI\s?\d{3}|S\dL\d)/i],
  ["Mecc Alte", /^EC[OP]\s?\d/i],
];
const same = (a, b) => a.toLowerCase().replace(/[^a-z]/g, "") === b.toLowerCase().replace(/[^a-z]/g, "");
const hits = []; let alts = 0, fam = 0; const vias = new Map();
for (const s of S) for (const r of C.fromSupplier(s, [])) {
  if (r.kind !== "alternator") continue;
  alts++;
  const f = FAM.find(([, re]) => re.test(String(r.model || "").trim()));
  if (!f) continue;
  fam++;
  for (const m of r.makes || []) {
    if (same(m.name, f[0])) continue;
    vias.set(m.via ?? "?", (vias.get(m.via ?? "?") || 0) + 1);
    hits.push({ sid: s.id, n: r.n, table: r.table, row: r.row, model: r.model, family: f[0], make: m.name, via: m.via ?? "?", line: r.line ?? "", header: (r.header || [])[0] ?? "" });
  }
}
console.log(`bản ghi đầu phát: ${alts}; mã thuộc 3 họ: ${fam}; bản ghi mang hãng khác họ của mã: ${hits.length}`);
console.log("theo mức bằng chứng của hãng gán:", [...vias].map(([k, v]) => `${k} = ${v}`).join("; "));
const g = new Map();
for (const h of hits) { const k = `${h.family} ← gán ${h.make} (${h.via}) | ${h.sid}`; if (!g.has(k)) g.set(k, []); g.get(k).push(h); }
for (const [k, l] of [...g].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`\n${l.length} bản ghi | ${k} | bảng: ${[...new Set(l.map((h) => `n${h.n} b${h.table}`))].join(", ")}`);
  console.log(`   mã: ${[...new Set(l.map((h) => h.model))].join(", ").slice(0, 400)}`);
  console.log(`   tiêu đề: ${l[0].header.slice(0, 200)}`);
  console.log(`   vd dòng: ${String(l[0].line).slice(0, 200)}`);
}
