// node 4-madeat.mjs → nơi sản xuất (CAT.madeAt) của từng dòng thuộc khoá thừa lớp D (nước / nhà máy) và F1 / F2 / AB,
// đọc như hiện nay và khi dòng đó nằm dưới khoá đích (gộp ở keyOf: model, hãng là của khoá đích, dòng nguồn giữ nguyên). CHỈ ĐỌC.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL("C:/Projects/GenSet Pro/GenSet-Pro/suppliers/config-bot.mjs").href);
const CAT = globalThis.GenbidCatalog;
const sups = Object.values(JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/supplier.json", "utf8")).docs).map((x) => x.d).filter((d) => d && d.status !== "incomplete");
const cat = CAT.build(sups), by = new Map(cat.engines.map((e) => [e.key, e]));
const lop = JSON.parse(fs.readFileSync(path.join(HERE, "lop-web.json"), "utf8")).filter((o) => o.kind === "engines" && o.sep !== "kytu");
let same = 0, diff = 0;
const out = [];
for (const o of lop) {
  const e = by.get(o.key), t = by.get(o.target);
  if (!e || !t) continue;
  for (const u of e.uses) {
    const a = CAT.madeAt(e, u), b = CAT.madeAt(t, u);
    if (a.at === b.at) same++; else diff++;
    if (a.at !== b.at || /^D-/.test(o.lop)) out.push(`${o.lop}\t${o.names[0]}\t${o.target}\t${u.supplierId} n${u.n}\tnay ${a.at} (${a.why || ""})\tgộp ${b.at} (${b.why || ""})`);
  }
}
fs.writeFileSync(path.join(HERE, "madeat.tsv"), out.join("\n") + "\n");
console.log(`dòng giữ nguyên nơi sản xuất: ${same}; đổi: ${diff}`);
for (const l of out.filter((l) => !/nay (\S+) .*gộp \1 /.test(l))) console.log(l);
