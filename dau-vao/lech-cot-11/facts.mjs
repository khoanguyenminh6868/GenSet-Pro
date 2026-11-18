import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const [WT, CN, ...keys] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((d) => d.status !== "incomplete");
const full = CAT.build(sups); const facts = B.modelFacts(full, sups);
for (const k of keys) for (const kind of ["engine", "alternator"]) { const f = facts.get(`${kind}:${k}`); if (f) console.log(kind, k, f.map((x) => `${x.key}=${x.value}@${x.supplierId}`).join(" ; ")); }
// engine "uses": which suppliers carry the key
for (const k of keys) { const e = (full.engines || []).find((x) => x.key === k); console.log("catalog engine", k, e ? `${e.uses.length} dòng NCC; make=${JSON.stringify(e.makes || e.make)}; specs=${JSON.stringify((e.specs || []).map((s) => s.key + "=" + (s.win ?? s.values?.map((v) => v.value ?? v).join("/"))))}`.slice(0, 400) : "không có"); }
