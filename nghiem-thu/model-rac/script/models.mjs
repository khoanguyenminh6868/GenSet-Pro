// node models.mjs <catalog.js> <cn dir> <out.json>
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const [CATF, CN, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
import { createRequire } from "node:module"; globalThis.GenbidCatalog = createRequire(import.meta.url)(path.resolve(CATF));
const CAT = globalThis.GenbidCatalog;
const sups = fs.readdirSync(CN).filter(f=>f.endsWith(".json")).map(f=>JSON.parse(fs.readFileSync(path.join(CN,f),"utf8"))).filter(d=>d.status!=="incomplete");
const c = CAT.build(sups);
const out = {};
for (const k of Object.keys(c)) if (Array.isArray(c[k])) out[k] = c[k].map(x=>({key:x.key, model:x.model, n:x.n, brand:x.brand}));
console.error(Object.keys(c).map(k=>k+":"+(Array.isArray(c[k])?c[k].length:typeof c[k])).join(" "));
fs.writeFileSync(OUT, JSON.stringify(out));
