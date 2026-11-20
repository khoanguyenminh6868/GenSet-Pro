// node cop.mjs <catalog gốc> <catalog nhánh> <cn> : engines / alternators / controllers giống hệt; gensets giống hệt sau khi đổi
// khoá `unrated` → `rated` ở bản gốc (không bản ghi nào có cả hai), đếm số bản ghi đổi khoá.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
const [A, B, DIR] = process.argv.slice(2);
const sups = () => fs.readdirSync(DIR).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));
const md5 = (x) => crypto.createHash("md5").update(JSON.stringify(x)).digest("hex");
await import(pathToFileURL(path.resolve(A)).href + "?a");
const a = globalThis.GenbidCatalog.build(sups());
delete globalThis.GenbidCatalog;
await import(pathToFileURL(path.resolve(B)).href + "?b");
const b = globalThis.GenbidCatalog.build(sups());
for (const k of ["engines", "alternators", "controllers"]) console.log(k, a[k].length, b[k].length, md5(a[k]) === md5(b[k]) ? "GIỐNG" : "KHÁC");
let moved = 0, both = 0;
const fix = (u) => {
  if (!u.power?.unrated) return u;
  moved++; if (u.power.rated) both++;
  const { unrated, ...rest } = u.power;
  return { ...u, power: { ...rest, rated: unrated } };
};
// Thứ tự khoá của power: gốc prime, standby, rated, unrated → nhánh prime, standby, rated: so theo khoá đã sắp.
const norm = (g) => JSON.parse(JSON.stringify(g, (k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort()) : v)));
const ga = norm(a.gensets.map((e) => ({ ...e, uses: e.uses.map(fix) })));
const gb = norm(b.gensets);
console.log("gensets", a.gensets.length, b.gensets.length, md5(ga) === md5(gb) ? "GIỐNG (sau đổi khoá)" : "KHÁC", "| lượt đổi unrated→rated:", moved, "| có sẵn rated:", both);
const un = b.gensets.flatMap((e) => e.uses).filter((u) => u.power?.unrated).length;
console.log("nhánh còn unrated:", un);
