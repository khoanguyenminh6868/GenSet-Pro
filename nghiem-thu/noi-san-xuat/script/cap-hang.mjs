// node cap-hang.mjs <worktree> [engine|alternator] : các nhóm hãng mâu thuẫn ở mức cao nhất, số model, ví dụ
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const WT = process.argv[2], KIND = process.argv[3] || "engine";
await import(pathToFileURL(path.join(WT, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const recs = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const cat = C.build(recs);
const RANK = { "dòng bảng": 3, "tiêu đề cột": 2, "hãng sản xuất": 2, "tên trang": 1 };
const groups = new Map();
for (const e of KIND === "engine" ? cat.engines : cat.alternators) {
  const per = new Map();
  for (const u of e.uses) for (const m of u.makes || []) { const r = RANK[m.via] || 0; if (!per.has(r)) per.set(r, new Map()); const x = per.get(r); if (!x.has(m.name)) x.set(m.name, new Set()); x.get(m.name).add(u.supplierId); }
  if (!per.size) continue;
  const top = Math.max(...per.keys()), x = per.get(top);
  if (x.size < 2) continue;
  const names = [...x.keys()].sort(), k = names.join(" / ");
  if (!groups.has(k)) groups.set(k, { models: 0, ncc: 0, ex: [] });
  const g = groups.get(k); g.models++; g.ncc += e.suppliers.length;
  if (g.ex.length < 4) g.ex.push(`${e.model} (${[...x.entries()].map(([n, s]) => n + "×" + s.size).join(" ")}; mức ${top})`);
}
const list = [...groups.entries()].sort((a, b) => b[1].models - a[1].models);
console.log(`${KIND}: ${list.reduce((a, [, g]) => a + g.models, 0)} model mâu thuẫn, ${list.length} nhóm hãng`);
for (const [k, g] of list) console.log(`${String(g.models).padStart(4)}  ${k}  — ${g.ex.join("; ")}`);
