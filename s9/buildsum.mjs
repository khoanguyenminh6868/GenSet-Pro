// node buildsum.mjs <code dir> <out.json>: build() summary per key (engines / alternators / controllers / gensets md5)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
const [WT, OUT] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const CN = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = C.build(sups);
const md5 = (x) => crypto.createHash("md5").update(JSON.stringify(x)).digest("hex");
const out = { md5: {}, engines: {} };
for (const k of Object.keys(cat)) out.md5[k] = md5(cat[k]);
for (const e of cat.engines) out.engines[e.key] = { model: e.model, make: e.make || "", origin: C.originOf ? C.originOf(e) : null, uses: e.uses.length, sups: [...new Set(e.uses.map((u) => u.supplierId))].sort(), md5: md5(e) };
fs.writeFileSync(OUT, JSON.stringify(out));
