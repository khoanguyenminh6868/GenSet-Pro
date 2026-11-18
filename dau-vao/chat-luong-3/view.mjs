// Xem ví dụ một nhóm: node view.mjs out <đường> "<chuỗi trong khoá nhóm>" [ví dụ mỗi NCC] [số NCC]
import fs from "node:fs";
import path from "node:path";
const [OUT, P, pat, per = "1", maxS = "12"] = process.argv.slice(2);
const ex = JSON.parse(fs.readFileSync(path.join(OUT, `ex-${P}.json`), "utf8"));
for (const [k, list] of Object.entries(ex)) {
  if (!k.includes(pat)) continue;
  const by = new Map();
  for (const e of list) { if (!by.has(e.sup)) by.set(e.sup, []); by.get(e.sup).push(e); }
  console.log(`== ${k}: ${list.length} | ${[...by].sort((a, b) => b[1].length - a[1].length).map(([s, l]) => `${s} ${l.length}`).join(", ")}`);
  for (const [s, l] of [...by].sort((a, b) => b[1].length - a[1].length).slice(0, +maxS)) for (const e of l.slice(0, +per))
    console.log(`  ${s} n${e.n} b${e.table} r${e.row ?? "L"} ${e.kind} ${e.model} | ${e.val} | ${e.change}\n    H: ${e.header.join(" ⏎ ").slice(0, 300)}\n    R: ${e.line.slice(0, 240)}`);
}
