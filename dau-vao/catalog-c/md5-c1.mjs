// node md5.mjs <catalog.js> <suppliers/cn> : md5 JSON của build() từng phần (Set → mảng như JSON.stringify bỏ qua)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
const [CAT, DIR] = process.argv.slice(2);
await import(pathToFileURL(path.resolve(CAT)).href);
const C = globalThis.GenbidCatalog;
const sups = fs.readdirSync(DIR).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));
const b = C.build(sups);
const md5 = (x) => crypto.createHash("md5").update(JSON.stringify(x)).digest("hex");
for (const k of Object.keys(b)) console.log(k.padEnd(12), String(b[k].length).padStart(6), md5(b[k]));
const u = C.unread(sups);
const by = {}; for (const x of u) by[x.reason] = (by[x.reason] || 0) + 1;
console.log("unread:", u.length, "bảng không cho bản ghi nào:", by["bảng không cho bản ghi nào"]);
if (process.argv[4]) fs.writeFileSync(process.argv[4], JSON.stringify(u.map((x) => [x.supplierId, x.n, x.table, x.row, x.reason, x.detail].join(" | "))));
