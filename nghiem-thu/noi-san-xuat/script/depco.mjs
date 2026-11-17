import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const WT = process.argv[2], SID = process.argv[3] || "depco-power";
await import(pathToFileURL(path.join(WT, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const recs = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const cat = C.build(recs);
let n = 0;
for (const e of cat.engines) {
  if (!e.suppliers.includes(SID)) continue;
  for (const key of ["cyl", "compr"]) {
    const s = e.specs.find((x) => x.key === key);
    if (!s || s.values.length < 2) continue;
    const mine = s.values.filter((v) => v.suppliers.includes(SID));
    const other = s.values.filter((v) => !v.suppliers.includes(SID) || v.suppliers.length > 1);
    if (!mine.length || mine.every((m) => other.some((o) => o.value === m.value && o.suppliers.length > 1))) continue;
    if (++n > 14) continue;
    const u = e.uses.find((x) => x.supplierId === SID && (x.specs || []).some((q) => q.key === key));
    const sp = (u?.specs || []).filter((q) => q.key === key).map((q) => `${q.label}=${q.value}`).join("; ");
    console.log(`${e.model} [${e.make}] ${key}: depco ${mine.map((v) => v.value).join(",")} | khác: ${s.values.filter((v) => !v.suppliers.includes(SID)).slice(0, 3).map((v) => v.value + "×" + v.suppliers.length).join(", ")} | nhãn ${sp} | n ${u?.n} ${u?.title?.slice(0, 50)}`);
  }
}
console.log("tổng", n);
