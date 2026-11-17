// node made-at.mjs <worktree> [engine|alternator|controller] : catalog.js madeAt từng dòng, đếm theo hãng | nơi SX, 2 mẫu mỗi nhóm có chữ.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const WT = process.argv[2], kind = process.argv[3] || "engine";
await import(pathToFileURL(path.join(WT, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const recs = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const cat = C.build(recs);
const list = kind === "engine" ? cat.engines : kind === "alternator" ? cat.alternators : cat.controllers;
const stat = new Map(), ex = new Map();
for (const e of list) for (const u of e.uses) {
  const m = C.madeAt(e, u), mk = e.make || "?";
  const k = `${mk.padEnd(18)} | ${m.at} | ${m.why && !/^(hãng|mặc định)/.test(m.why) ? "dòng ghi" : m.why ? m.why.slice(0, 20) : "-"}`;
  stat.set(k, (stat.get(k) || 0) + 1);
  if (m.why && !/^(hãng|mặc định)/.test(m.why) && (ex.get(k) || []).length < 2) ex.set(k, [...(ex.get(k) || []), `${e.model} ${u.supplierId}: «${m.why.slice(0, 90)}»`]);
}
for (const [k, n] of [...stat.entries()].sort()) { if (n < 3 && !ex.has(k)) continue; console.log(String(n).padStart(6), k); for (const x of ex.get(k) || []) console.log("         " + x); }
