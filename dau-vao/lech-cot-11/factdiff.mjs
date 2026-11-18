import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const CN = process.argv[2]; process.env.GENBID_SPEC_NORM = "1";
const side = async (WT) => { const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href); const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((d) => d.status !== "incomplete"); const CAT = globalThis.GenbidCatalog; const full = CAT.build(sups); return B.modelFacts(full, sups); };
const a = await side(process.argv[3]);
fs.writeFileSync(process.argv[4], JSON.stringify([...a].map(([k, v]) => [k, v.map((x) => `${x.key}=${x.value}@${x.supplierId}`).sort()])));
