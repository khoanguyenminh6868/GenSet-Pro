// node keys.mjs <code dir> <key...>: engine keys in build(): model, makes, every use (supplier, n, genset, disp)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, ...KEYS] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const CN = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = C.build(sups);
for (const k0 of KEYS) {
  const k = C.keyOf(k0);
  const hits = [...(cat.engines || []).filter((e) => e.key === k || e.key.includes(k)), ...(cat.alternators || []).filter((a) => a.key === k).map((a) => ({ ...a, alt: true }))];
  if (!hits.length) { console.log(`${k0} (${k}): KHÔNG có khoá`); continue; }
  for (const e of hits) {
    console.log(`${k0} → ${e.alt ? "ĐẦU PHÁT " : ""}key=${e.key} model=${e.model} make=${e.make || ""} uses=${e.uses.length}`);
    for (const u of e.uses) console.log(`   ${u.supplierId} n${u.n} genset=${u.genset} power=${JSON.stringify(u.power)} disp=${JSON.stringify((u.specs || []).filter((p) => p.key === "disp").map((p) => p.value))}`);
  }
}
