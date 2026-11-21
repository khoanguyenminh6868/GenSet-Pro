// node soat-5.mjs <repoDir> <out.tsv> — MỌI bản ghi có "^" cuối model cạnh dòng nguồn + số xi lanh / dung tích của khoá "^" và khoá trơn.
import fs from "node:fs";
import path from "node:path";
import { loadWeb } from "./load.mjs";
const [dir, out] = process.argv.slice(2);
const C = loadWeb(dir);
const cn = path.join(dir, "suppliers", "cn");
const S = fs.readdirSync(cn).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cn, f), "utf8"))).filter((s) => s.status !== "incomplete");
const num = (v) => { const m = String(v).match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
const byKey = new Map(), carets = [];
for (const s of S) for (const r of C.fromSupplier(s)) {
  const k = r.kind + "|" + C.keyOf(r.model);
  if (!byKey.has(k)) byKey.set(k, { sup: new Set(), cyl: {}, disp: {} });
  const o = byKey.get(k);
  o.sup.add(s.id);
  for (const x of r.specs || []) if (x.key === "cyl" || x.key === "disp") { const v = num(x.value); if (v != null) (o[x.key][v] ||= new Set()).add(s.id); }
  if (/\^$/.test(r.model)) { const t = (s.specTables || []).find((x) => x.n === r.n); carets.push({ r, line: r.line || t?.rows?.[r.row] || "" }); }
}
const fmt = (b) => Object.entries(b || {}).map(([v, n]) => `${v}×${n.size}`).join(" ") || "-";
const rows = [["NCC", "n", "dòng", "vai", "model", "dòng có mã", "NCC khoá ^", "cyl ^", "disp ^", "NCC khoá trơn", "cyl trơn", "disp trơn", "dòng nguồn"].join("\t")];
const keys = new Set();
let noLine = 0, noPlain = 0;
for (const { r, line } of carets) {
  const a = byKey.get(r.kind + "|" + C.keyOf(r.model)), b = byKey.get(r.kind + "|" + C.keyOf(r.model.slice(0, -1)));
  const has = String(line).includes(r.model);
  if (!has) noLine++;
  if (!b) noPlain++;
  keys.add(r.model);
  rows.push([r.supplierId, r.n, r.row, r.kind, r.model, has ? "có" : "KHÔNG", a.sup.size, fmt(a.cyl), fmt(a.disp), b ? b.sup.size : 0, fmt(b?.cyl), fmt(b?.disp), line].join("\t"));
}
fs.writeFileSync(out, rows.join("\n") + "\n");
console.log("bản ghi ^", carets.length, "khoá ^", keys.size, "dòng thiếu mã", noLine, "không có khoá trơn", noPlain);
for (const k of [...keys].sort()) {
  const a = byKey.get("engine|" + C.keyOf(k)), b = byKey.get("engine|" + C.keyOf(k.slice(0, -1)));
  console.log(k, "| ^:", a ? [...a.sup].join(",") : "-", "cyl", fmt(a?.cyl), "disp", fmt(a?.disp), "| trơn:", b ? b.sup.size + " NCC" : "-", "cyl", fmt(b?.cyl), "disp", fmt(b?.disp));
}
