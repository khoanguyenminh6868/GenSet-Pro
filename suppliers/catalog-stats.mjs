// Builds the engine / alternator catalog the web shows (web/catalog.js) from cn/*.json and prints a summary:
// node suppliers/catalog-stats.mjs [--json out.json] [--samples]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const cat = globalThis.GenbidCatalog;
const recs = fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8")));
const c = cat.build(recs);
const by = (list, f) => list.reduce((m, e) => ((m[f(e)] = (m[f(e)] || 0) + 1), m), {});
for (const [kind, list] of [["Động cơ", c.engines], ["Đầu phát", c.alternators]]) {
  const uses = list.reduce((a, e) => a + e.uses.length, 0);
  console.log(`${kind}: ${list.length} model, ${uses} dòng bảng, ${list.filter((e) => e.make).length} có hãng, ${list.filter((e) => e.kva || e.kw).length} có công suất tổ máy`);
  console.log("  theo hãng:", JSON.stringify(Object.entries(by(list, (e) => e.make || "—")).sort((a, b) => b[1] - a[1]).slice(0, 30)));
}
const out = process.argv.indexOf("--json");
if (out > 0) fs.writeFileSync(process.argv[out + 1], JSON.stringify(c, null, 1));
if (process.argv.includes("--samples")) for (const [kind, list] of [["E", c.engines], ["A", c.alternators]]) for (const e of list.slice(0, 40)) console.log(kind, e.model, "|", e.make, "|", e.suppliers.length, "ncc |", e.uses.length, "dòng |", e.kva, e.kw, e.freq);
