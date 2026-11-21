// Khoá mà tecnogen là nguồn số disp duy nhất: bao nhiêu khoá có dòng (uses) của NCC khác.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, KEYS] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = C.build(sups);
const keys = JSON.parse(fs.readFileSync(KEYS, "utf8")).filter((r) => r.cls.some((c) => c.startsWith("tecnogen là"))).map((r) => r.key);
const used = keys.filter((k) => (cat.engines.find((e) => e.key === k)?.uses || []).some((u) => u.supplierId !== "tecnogen"));
console.log(`nguồn duy nhất: ${keys.length}; có dòng NCC khác: ${used.length}`);
console.log(used.join(" "));
