// Buoc 4 kiem ke, phan 1b: nhan ma specKey DA nhan, liet ke theo khoa de tim nhan-nham. Chay: node nhan-nham.mjs → nhan-da-nhan.tsv
import fs from "node:fs";
import path from "node:path";
const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4";
const labels = JSON.parse(fs.readFileSync(path.join(OUT, "labels.json"), "utf8"));
const squash = (n) => n.replace(/[*:：]+/g, " ").replace(/\s+/g, " ").trim();
const by = {};
for (const e of labels) {
  if (!e.sk || e.kind.startsWith("src")) continue;
  const n = squash(e.n);
  const m = (by[e.sk] = by[e.sk] || new Map());
  const g = m.get(n) || { lines: 0, nccs: new Set(), models: 0 };
  g.lines += e.lines; g.models += e.models; for (const c of e.nccs) g.nccs.add(c);
  m.set(n, g);
}
const t = ["khoa\tnhan\tdong\tncc\tmodel_o"];
const only = process.argv[2] ? process.argv[2].split(",") : null;
for (const [k, m] of Object.entries(by)) {
  if (only && !only.includes(k)) continue;
  const top = [...m.entries()].sort((a, b) => b[1].lines - a[1].lines).slice(0, 40);
  for (const [n, g] of top) t.push([k, n, g.lines, g.nccs.size, g.models].join("\t"));
  if (only) console.log(`## ${k}: ` + top.slice(0, 22).map(([n, g]) => `${n}(${g.nccs.size}/${g.lines})`).join(" ; "));
}
fs.writeFileSync(path.join(OUT, "nhan-da-nhan.tsv"), t.join("\n"));
