// So hints cũ ↔ mới từng byte cho mọi lượt; lượt khác: trường đổi + dòng HSMT nêu xi lanh / "N kỳ" (ngữ cảnh ngắn) → tsv.
// node so-hints.mjs <hints-goc.json> <hints-moi.json> <bidhist.json> <out.tsv>
import fs from "node:fs";
const [A, B, BH, OUT] = process.argv.slice(2);
const a = JSON.parse(fs.readFileSync(A, "utf8")), b = JSON.parse(fs.readFileSync(B, "utf8"));
const raw = JSON.parse(fs.readFileSync(BH, "utf8")), docs = raw.docs || raw;
const text = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.config?.text).map((d) => [d.notifyNo, d.config.text]));
const rows = ["lượt\ttrường\tcũ\tmới\tdòng HSMT (ngắn)"];
let same = 0, diff = 0;
const keys = new Set([...Object.keys(a.hints), ...Object.keys(b.hints)]);
for (const k of keys) {
  if (a.hints[k] === b.hints[k]) { same++; continue; }
  diff++;
  const x = JSON.parse(a.hints[k] || "{}"), y = JSON.parse(b.hints[k] || "{}");
  const fields = [...new Set([...Object.keys(x), ...Object.keys(y)])].filter((f) => JSON.stringify(x[f]) !== JSON.stringify(y[f]));
  const t = text.get(k.split("#")[0]) || "";
  const ls = t.split("\n").filter((l) => /(?:xi|xy)[\s-]?lanh|cylind/i.test(l) && /\d\s*-?\s*(?:k[ỳìyi]|th[ìi]|stroke|cycle)(?![a-zà-ỹ])/i.test(l))
    .map((l) => { const i = l.search(/(?:xi|xy)[\s-]?lanh|cylind/i); return l.slice(Math.max(0, i - 50), i + 70).replace(/\s+/g, " ").trim(); });
  for (const f of fields) rows.push([k, f, JSON.stringify(x[f]), JSON.stringify(y[f]), ls.join(" ‖ ")].join("\t"));
}
fs.writeFileSync(OUT, rows.join("\n") + "\n");
console.log(`lượt ${keys.size}: giống từng byte ${same}, khác ${diff}`);
const by = {}; for (const r of rows.slice(1)) { const c = r.split("\t"); const kk = `${c[1]} ${c[2]}→${c[3]}`; by[kk] = (by[kk] || 0) + 1; }
for (const [kk, n] of Object.entries(by).sort((p, q) => q[1] - p[1])) console.log(" ", n, kk);
