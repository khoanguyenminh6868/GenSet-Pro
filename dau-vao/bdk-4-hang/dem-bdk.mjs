// Đếm model bộ điều khiển (4 hãng) mà NCC ghi: node dem-bdk.mjs <thư mục suppliers>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const ROOT = path.resolve(process.argv[2]);
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const cat = globalThis.GenbidCatalog;
const recs = fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8")));
const c = cat.build(recs);
const ctl = c.controllers || [];
console.log("tổng model BĐK:", ctl.length, "khoá:", Object.keys(ctl[0] || {}).join(","));
const want = /deif|woodward|datakom|sices/i;
const rows = ctl.filter((e) => want.test(e.make || "")).map((e) => ({ make: e.make, model: e.model, ncc: (e.suppliers || []).length, uses: (e.uses || []).length }));
rows.sort((a, b) => a.make.localeCompare(b.make) || b.ncc - a.ncc);
for (const r of rows) console.log(r.make, "|", r.model, "|", r.ncc, "ncc |", r.uses, "dòng");
