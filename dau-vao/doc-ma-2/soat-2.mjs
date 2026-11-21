// node soat-2.mjs <repoDir> <out.tsv> — MỌI bản ghi thêm của lỗi (2) (dòng có "(国三)" / "(欧三)") cạnh dòng nguồn:
// model, tổ máy, công suất, hãng, xi lanh, dung tích của dòng + giá trị NCC KHÁC (ngoài bdadl / pengpai) ghi cho cùng khoá.
import fs from "node:fs";
import path from "node:path";
import { loadWeb } from "./load.mjs";
const [dir, out] = process.argv.slice(2);
const C = loadWeb(dir);
const cn = path.join(dir, "suppliers", "cn");
const S = fs.readdirSync(cn).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cn, f), "utf8"))).filter((s) => s.status !== "incomplete");
const TWO = new Set(["bdadl-shanghai", "pengpai-yangzhou"]);
const MARK = /\(\s*[国欧][一二三四五六]\s*\)/;
const num = (v) => { const m = String(v).match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
const others = new Map();
const mine = [];
for (const s of S) {
  const notes = [];
  const recs = C.fromSupplier(s, notes);
  for (const r of recs) {
    if (r.kind !== "engine") continue;
    if (TWO.has(s.id)) {
      const t = (s.specTables || []).find((x) => x.n === r.n);
      const line = r.line || (t && t.rows[r.row]) || "";
      if (MARK.test(line)) mine.push({ r, line, ex: notes.filter((n) => n.n === r.n && n.row === r.row && n.reason === "ngoại lệ theo dòng").map((n) => n.detail).join("; ") });
      continue;
    }
    const k = C.keyOf(r.model);
    if (!others.has(k)) others.set(k, { cyl: {}, disp: {}, sup: new Set() });
    const o = others.get(k);
    o.sup.add(s.id);
    for (const x of r.specs || []) if (x.key === "cyl" || x.key === "disp") { const v = num(x.value); if (v != null) (o[x.key][v] ||= new Set()).add(s.id); }
  }
}
const fmt = (b) => Object.entries(b || {}).sort((x, y) => y[1].size - x[1].size).map(([v, n]) => `${v}×${n.size}`).join(" ") || "-";
const pw = (p) => (p ? ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k} ${p[k].kW ?? "·"}kW/${p[k].kVA ?? "·"}kVA`).join(" ") : "∅");
const rows = [["NCC", "n", "dòng", "model", "tổ máy", "công suất", "hãng", "cyl", "disp", "NCC khác: số NCC", "cyl khác", "disp khác", "cờ", "ngoại lệ", "dòng nguồn"].join("\t")];
const flags = {};
for (const { r, line, ex } of mine) {
  const g = (k) => (r.specs || []).find((x) => x.key === k)?.value ?? "";
  const o = others.get(C.keyOf(r.model));
  const f = [];
  if (!String(line).includes(r.model)) f.push("mã không có trong dòng");
  if (!r.power) f.push("không công suất");
  if (!(r.makes || []).length) f.push("không hãng");
  if (!o) f.push("không NCC khác");
  else {
    const c = num(g("cyl")), d = num(g("disp"));
    if (c != null && Object.keys(o.cyl).length && !o.cyl[c]) f.push("cyl khác mọi NCC");
    if (d != null && Object.keys(o.disp).length && !Object.keys(o.disp).some((v) => Math.abs(+v - d) / d <= 0.01)) f.push("disp khác mọi NCC");
  }
  for (const x of f) flags[x] = (flags[x] || 0) + 1;
  rows.push([r.supplierId, r.n, r.row, r.model, r.genset, pw(r.power), (r.makes || []).map((m) => m.name).join(","), g("cyl"), g("disp"), o ? o.sup.size : 0, fmt(o?.cyl), fmt(o?.disp), f.join("; "), ex, line].join("\t"));
}
fs.writeFileSync(out, rows.join("\n") + "\n");
console.log("bản ghi", mine.length, JSON.stringify(flags));
for (const l of rows.slice(1)) { const c = l.split("\t"); if (/khác mọi|mã không|không công suất|không hãng/.test(c[12]) || c[13]) console.log([c[0].slice(0, 5), c[1], c[2], c[3], "cyl", c[7], "disp", c[8], "| khác", c[10], "/", c[11], "|", c[12], c[13] ? "| NL" : ""].join(" ")); }
