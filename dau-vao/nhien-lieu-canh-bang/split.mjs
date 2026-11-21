// Với các bảng liệt kê: bản ghi fuel rỗng đến từ fromSupplier (động cơ / đầu phát) hay gensetsOf (tổ máy)?  node split.mjs <gốc repo>
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm";
const ROOT = process.argv[2];
const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(ROOT, "web", "catalog.js"), "utf8"), box);
const C = box.GenbidCatalog;
const L = fs.readFileSync("bang-co-chu-khi-canh-bang.tsv", "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const keys = new Map(); for (const r of L) keys.set(r[0] + "|" + r[1] + "|" + r[2], r);
const tot = { fromSupplier: 0, gensetsOf: 0 }, per = {};
const ids = [...new Set([...keys.keys()].map((k) => k.split("|")[0]))];
for (const id of ids) {
  const s = JSON.parse(fs.readFileSync(path.join(ROOT, "suppliers", "cn", id + ".json"), "utf8"));
  for (const [src, fn] of [["fromSupplier", C.fromSupplier], ["gensetsOf", C.gensetsOf]]) {
    if (typeof fn !== "function") continue;
    for (const o of fn(s)) if (!o.fuel && keys.has(`${id}|${o.n}|${o.table}`)) { tot[src]++; const k = `${id}|${o.n}|${o.table}`; (per[k] = per[k] || { fromSupplier: 0, gensetsOf: 0 })[src]++; }
  }
}
console.log(JSON.stringify(tot)); console.log(Object.keys(C).filter((k) => /genset|from/i.test(k)).join(","));
const both = Object.values(per).filter((p) => p.fromSupplier && p.gensetsOf).length, onlyG = Object.values(per).filter((p) => !p.fromSupplier).length, onlyF = Object.values(per).filter((p) => !p.gensetsOf).length;
console.log({ bang: Object.keys(per).length, bangChiGensetsOf: onlyG, bangChiFromSupplier: onlyF, bangCaHai: both });
for (const k of ["frs-shenyang|107|6", "googol|101|0", "googol|102|2", "teksan|104|3", "teksan|106|5", "vpower-hk|101|0", "vpower-hk|102|1", "westinpower|113|19", "kingway-power|117|12", "man-engines|104|4", "simpson-power|124|15"]) console.log(k, JSON.stringify(per[k]));
