// node keys.mjs <worktree>: các khoá thông số có trong facts của động cơ (modelFacts) và u.specs của dòng, đếm số lần.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups);
const ef = {}, us = {};
for (const e of cat.engines) {
  for (const f of facts.get(`engine:${e.key}`) || []) ef[f.key] = (ef[f.key] || 0) + 1;
  for (const u of e.uses) for (const f of u.specs || []) us[f.key] = (us[f.key] || 0) + 1;
}
console.log("facts:", ef);
console.log("u.specs:", us);
const e = cat.engines.find((x) => x.key === "TAD1341GE");
console.log(e.model, e.uses.length, e.uses.slice(0, 3).map((u) => ({ sid: u.supplierId, line: u.line, specs: (u.specs || []).map((f) => [f.key, f.value]) })));
console.log((facts.get("engine:TAD1341GE") || []).slice(0, 5));
