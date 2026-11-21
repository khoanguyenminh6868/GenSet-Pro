// Chụp (chỉ đọc) mọi configmatch hiện có trên web. node snap2.mjs <gốc repo> → configmatch.json; in cấu hình #2 của IB2600603983.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]), dir = import.meta.dirname;
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const cm = await CB.allDocs("configmatch");
const list = Array.isArray(cm) ? cm : Object.entries(cm).map(([id, d]) => ({ id, ...d }));
fs.writeFileSync(path.join(dir, "configmatch.json"), JSON.stringify(list), "utf8");
const d = list.find((x) => (x.id || x.key) === "IB2600603983"), data = d.data || d, r = data.result || data;
console.log("lượt", list.length, "| lưu", data.updatedAt || data.at || data.finishedAt || "", "| cấu hình", r.configs.length);
const c = r.configs.find((x) => x.rank === 2) || r.configs[1];
console.log(JSON.stringify({ engine: c.engine, genset: c.genset, alternator: c.alternator, controller: { ...c.controller, alternatives: undefined }, suppliers: c.suppliers }).slice(0, 1800));
const n = {}; for (const x of c.checks) n[x.status] = (n[x.status] || 0) + 1; console.log(n);
for (const x of c.checks) if (x.status !== "met") {
  console.log(`\n[${x.part}/${x.status}${x.byCode ? "/code" : ""}${x.rule ? `/${x.rule}` : ""}${x.confirm ? `/${x.confirm}` : ""}] ${x.item}\n  YC: ${String(x.requirement || "").slice(0, 170)}\n  chào: ${String(x.offered || "").slice(0, 110)} | ghi chú: ${String(x.note || "").slice(0, 170)}`);
  for (const p of x.parts || []) if (p.status !== "met") console.log(`    - ${p.status}: ${String(p.item).slice(0, 80)} | ${String(p.note || "").slice(0, 70)}`);
}
