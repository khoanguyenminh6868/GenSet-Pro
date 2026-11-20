// node fuel-x.mjs <repo> : nhiên liệu (fuel / fuelFrom / fuelWhy) của MỌI bản ghi 4 bảng bỏ sót, cùng URL nguồn
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const REPO = process.argv[2];
await import(pathToFileURL(path.join(REPO, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const X = { "green-power-generators": [115, 117, 126], "lees-power": [133] };
for (const [id, ns] of Object.entries(X)) {
  const s = JSON.parse(fs.readFileSync(path.join(REPO, "suppliers", "cn", id + ".json"), "utf8"));
  const recs = C.fromSupplier(s, []);
  for (const n of ns) {
    const rs = recs.filter((r) => r.n === n);
    const t = s.specTables.find((x) => x.n === n);
    const by = {};
    for (const r of rs) { const k = `${r.fuel || "-"} | ${r.fuelFrom || "-"} | ${r.fuelWhy || "-"}`; (by[k] ||= []).push(r.genset); }
    console.log(`${id} n${n} "${t.title}" ${s.sources.find((x) => x.n === n)?.url}: ${rs.length} bản ghi`);
    for (const [k, g] of Object.entries(by)) console.log(`   ${k}  ×${g.length}: ${g.join(", ")}`);
  }
}
