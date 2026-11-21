// bdk-ds-3 phần B: mọi model DEIF / Woodward trong hồ sơ + loại BĐK đọc ra (CM.ctlKinds) + nơi xuất hiện.
// node loai.mjs <thư mục suppliers>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const ROOT = path.resolve(process.argv[2]);
const bot = await import(pathToFileURL(path.join(ROOT, "config-bot.mjs")).href);
const CM = await import(pathToFileURL(path.join(ROOT, "ctl-module.mjs")).href);
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const recs = fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8")));
const kinds = CM.ctlKinds(recs, { modelsIn: bot.ctlModelsIn });
const seen = new Map(); // key → {model, make, by:Set, sheet:bool}
for (const r of recs) {
  const add = (c, where) => { if (!c?.model || !/^(DEIF|Woodward)$/i.test(c.brand || c.make || "")) return; const k = CM.ctlKey(c.model); const e = seen.get(k) || { model: c.model, make: c.brand, by: new Set(), sheetTables: [] }; e.by.add(r.id); seen.set(k, e); };
  for (const c of r.controllers || []) add(c);
  for (const t of r.specTables || []) { const txt = [t.title, ...(t.rows || [])].join("\n"); for (const c of C.controllersIn(txt)) if (c.model && /^(DEIF|Woodward)$/i.test(c.brand)) { add(c); if (r.role === "controller_maker" && /^Datasheet/i.test(t.title || "")) seen.get(CM.ctlKey(c.model)).sheetTables.push(`${r.id}#${t.n}`); } }
}
const out = [];
for (const [k, e] of seen) out.push({ key: k, model: e.model, make: e.make, kind: CM.kindOf(kinds, e.model) || "", nNcc: [...e.by].filter((x) => !/^(deif|woodward)$/.test(x)).length, own: [...e.by].filter((x) => /^(deif|woodward)$/.test(x)), sheets: [...new Set(e.sheetTables)] });
out.sort((a, b) => a.make.localeCompare(b.make) || a.key.localeCompare(b.key));
console.log(JSON.stringify(out, null, 1));
