// node md5-x.mjs <catalog.js> <cn> : md5 engines khi 4 bảng X để rỗng dòng (chỉ số bảng giữ nguyên) + danh sách model mới / đổi
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
const [CAT, DIR] = process.argv.slice(2);
await import(pathToFileURL(path.resolve(CAT)).href);
const C = globalThis.GenbidCatalog;
const X = { "green-power-generators": [16, 18, 27], "lees-power": [31] };
const sups = fs.readdirSync(DIR).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));
const md5 = (x) => crypto.createHash("md5").update(JSON.stringify(x)).digest("hex");
const blank = sups.map((s) => (X[s.id] ? { ...s, specTables: s.specTables.map((t, i) => (X[s.id].includes(i) ? { ...t, rows: [] } : t)) } : s));
const a = C.build(blank), b = C.build(sups);
console.log("engines (4 bảng rỗng):", a.engines.length, md5(a.engines));
const ka = new Map(a.engines.map((e) => [e.key, e]));
for (const e of b.engines) {
  const o = ka.get(e.key);
  const mine = e.uses.filter((u) => X[u.supplierId]?.includes(u.table));
  if (!o) console.log(`  MỚI ${e.key} (${e.model}) dùng ${e.uses.length}, từ 4 bảng ${mine.length}, hãng ${e.make}`);
  else if (md5(o) !== md5(e)) console.log(`  THÊM DÙNG ${e.key} (${e.model}): ${o.uses.length} → ${e.uses.length} (từ 4 bảng ${mine.length}), NCC ${o.suppliers.length} → ${e.suppliers.length}, hãng ${o.make} → ${e.make}`);
}
for (const k of ka.keys()) if (!b.engines.some((e) => e.key === k)) console.log("  MẤT", k);
