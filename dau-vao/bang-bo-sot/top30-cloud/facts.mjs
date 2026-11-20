// node facts.mjs <code> <out.json> : facts (modelFacts toàn danh mục) của mọi động cơ: key → [{key, value, supplier}]
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const [WT, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog, CN = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), F = B.modelFacts(cat, sups), o = {};
for (const [k, fs_] of F) if (k.startsWith("engine:")) o[k] = fs_.map((f) => ({ key: f.key, value: f.value, sup: f.supplierId || f.supplier || f.src?.supplierId || "", n: f.n ?? f.src?.n ?? null }));
fs.writeFileSync(OUT, JSON.stringify(o)); console.error(Object.keys(o).length);
