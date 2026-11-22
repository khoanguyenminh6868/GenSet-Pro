// bdk-ds-4: MỌI model ComAp trong cn/ : số NCC chào, số dòng datasheet (factsFor), khoá. node comap-all.mjs <suppliers>
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const R = path.resolve(process.argv[2]);
const bot = await import(pathToFileURL(path.join(R, "config-bot.mjs")).href);
await import(pathToFileURL(path.join(R, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const recs = fs.readdirSync(path.join(R, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(R, "cn", f), "utf8")));
const built = C.build(recs);
const facts = bot.modelFacts(built, recs);
const rows = [];
for (const c of built.controllers) {
  if (!/comap/i.test(c.make || "")) continue;
  const f = bot.factsFor(facts, "controller", c.model);
  const by = new Set((c.suppliers || c.offeredBy || []).map((x) => x.id || x.supplierId || x));
  rows.push({ model: c.model, key: c.key, ncc: Object.keys(c).includes("suppliers") ? by.size : null, lines: f.length, sheets: [...new Set(f.map((x) => x.sheetModel || x.version || ""))].join("/") });
}
console.log(JSON.stringify(rows.sort((a, b) => a.key.localeCompare(b.key)), null, 1));
const cs = built.controllers.find((x) => /comap/i.test(x.make));
console.error(Object.keys(cs));
