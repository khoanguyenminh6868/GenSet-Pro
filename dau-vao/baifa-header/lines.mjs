// Mỗi dòng (tiêu đề + dòng) của mọi bảng của một NCC: có bản ghi fromSupplier nào mang đúng dòng đó không.
//   node lines.mjs <gốc repo> <id> [--all]   (--all: in cả dòng có bản ghi)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, id, all] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const s = JSON.parse(fs.readFileSync(path.join(root, "suppliers", "cn", `${id}.json`), "utf8"));
const notes = [];
const recs = C.fromSupplier(s, notes);
const byLine = new Map();
for (const r of recs) { const k = String(r.line ?? ""); if (!byLine.has(k)) byLine.set(k, []); byLine.get(k).push(r); }
console.log(`bản ghi: ${recs.length}; ghi chú: ${notes.length}`);
s.specTables.forEach((t, ti) => {
  const hs = t.header || [], rs = t.rows || [];
  let hRec = 0, hNo = 0, rRec = 0, rNo = 0;
  const out = [];
  [...hs.map((l, i) => ["H", i, l]), ...rs.map((l, i) => ["R", i, l])].forEach(([w, i, l]) => {
    const got = byLine.get(l) || [];
    const here = got.filter((r) => r.table === ti), else_ = got.filter((r) => r.table !== ti);
    const desc = got.length ? got.map((r) => `${r.kind}:${r.model}@b${r.table}r${r.row}`).join(" ") : "—";
    if (w === "H") got.length ? hRec++ : hNo++; else got.length ? rRec++ : rNo++;
    if (all || !got.length) out.push(`   ${w}${i} ${got.length ? (here.length ? "CÓ " : "CÓ(bảng khác) ") : "KHÔNG "}${l}   => ${desc}`);
  });
  console.log(`\n#${ti} n${t.n}: tiêu đề ${hs.length} (có bản ghi ${hRec}, không ${hNo}); dòng ${rs.length} (có ${rRec}, không ${rNo})`);
  for (const n of notes.filter((x) => x.table === ti)) console.log(`   note r${n.row ?? "-"}: ${n.reason} | ${String(n.detail ?? "").slice(0, 100)}`);
  out.forEach((x) => console.log(x));
});
