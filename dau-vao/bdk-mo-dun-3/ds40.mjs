// bdk-mo-dun PR 3, mục 3: số khoá / dòng datasheet bộ điều khiển gắn được (modelFacts) và mọi dòng ứng viên có +40
// "bộ điều khiển có datasheet hãng" (cùng điều kiện `candidates`: offers = bộ điều khiển trên dòng + của NCC).
// node ds40.mjs <worktree> <out.json>   (nạp NCC như prep: bỏ status incomplete)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [wt, out] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(wt, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(wt, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const built = C.build(sups), facts = B.modelFacts(built, sups);
const keys = {};
for (const [k, v] of facts) if (k.startsWith("controller:")) keys[k] = { lines: v.length, sups: [...new Set(v.map((f) => f.supplierId))].sort() };
const sup = new Map(sups.map((s) => [s.id, s]));
const rows = {};
for (const e of built.engines || []) for (const u of e.uses || []) {
  const s = sup.get(u.supplierId), rowCtrl = C.controllersIn(u.line || (u.lines?.rows || []).join(" "));
  const offers = [...rowCtrl, ...(s?.controllers || [])];
  const hit = offers.filter((c) => c.model && B.factsFor(facts, "controller", c.model).length).map((c) => c.model);
  rows[`${u.supplierId}|${u.n}|${e.model}|${C.keyOf(u.line || "")}`] = hit.length ? [...new Set(hit)].sort().join(",") : "";
}
fs.writeFileSync(out, JSON.stringify({ sups: sups.length, keys, rows }));
console.log(`${sups.length} NCC, ${Object.keys(keys).length} khoá controller, ${Object.values(rows).filter(Boolean).length}/${Object.keys(rows).length} dòng +40`);
