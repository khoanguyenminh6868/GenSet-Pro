// NCC nào có định mức đầu phát có nhãn cột (RT.alt), theo vai trò. node who.mjs <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const role = new Map(sups.map((s) => [s.id, s.role]));
const R = CB.sourceRatings(sups, path.join(root, "suppliers", "sources"));
const by = new Map();
for (const [k, l] of R.alt) for (const x of l) { const o = by.get(x.supplierId) || { models: new Set(), ns: new Set() }; o.models.add(x.model); o.ns.add(x.n); by.set(x.supplierId, o); }
for (const [id, o] of by) console.log(id, role.get(id), "models", o.models.size, "n", [...o.ns].join(","));
const ab = new Map();
for (const [k, l] of R.attr) for (const x of l) ab.set(x.supplierId, (ab.get(x.supplierId) || 0) + 1);
console.log("attr by supplier", JSON.stringify([...ab]));
