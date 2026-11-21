// node mat-soat.mjs <thư mục code nhánh> <thư mục cn> (CHỈ ĐỌC). Với mỗi (lượt, động cơ, luật) trong mat-dong.tsv: đọc ngưỡng HSMT, mọi số nguồn của động cơ,
// xem có NCC nào ghi số ĐẠT ngưỡng không, và số đó có khớp đường kính × hành trình × xi lanh không. Ra mat-soat.tsv + tóm tắt.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const [WT, CN] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const full = CAT.build(sups), facts = B.modelFacts(full, sups);
const docs = new Map(Object.values(J("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const hintCache = new Map();
function hintsFor(run) {
  if (hintCache.has(run)) return hintCache.get(run);
  const [no, ri] = run.split("#"), d = docs.get(no);
  const kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const sizing = found.length > 1 ? { size: found[+ri], sizes: found } : null;
  const h = B.hintsOf(d.config.text, "", sizing);
  hintCache.set(run, h);
  return h;
}
const litres = (v) => { const m = String(v).replace(",", ".").match(/\d+(?:\.\d+)?/); if (!m) return null; const x = +m[0]; return x >= 400 ? x / 1000 : x; };
const cylNum = (v) => { const m = String(v).match(/\d+/); return m ? +m[0] : null; };
const layoutOf = (v) => { const s = String(v).toLowerCase(); return /\bv\s*-?\d|\d\s*-?\s*v\b|v-type|chữ v/.test(s) ? "v" : /in-?line|\bl\s*-?\d|\d\s*-?\s*l\b|thẳng/.test(s) ? "inline" : null; };
const boreOf = (v) => { const m = String(v).replace(/,/g, ".").match(/(\d{2,3}(?:\.\d+)?)\s*(?:mm)?\s*[x×*/]\s*(\d{2,3}(?:\.\d+)?)/i); return m ? [+m[1], +m[2]] : null; };
const rowsIn = fs.readFileSync(path.join(HERE, "mat-dong.tsv"), "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const G = new Map();
for (const [run, , mg, mb, , rule] of rowsIn) for (const r of rule.split(",")) {
  const k = `${mb || mg}\t${r}`;
  if (!G.has(k)) G.set(k, { rows: 0, runs: new Set() });
  const g = G.get(k); g.rows++; g.runs.add(run);
}
const out = [], tally = {};
for (const [k, g] of G) {
  const [model, rule] = k.split("\t"), ef = facts.get(`engine:${CAT.keyOf(model)}`) || [];
  const by = (re) => ef.filter((f) => re.test(f.key));
  const dv = by(/^disp/), cv = by(/^cyl/), bv = by(/^bore/);
  const geoms = new Set();
  for (const f of bv) { const b = boreOf(f.value); if (!b) continue; for (const c of cv.filter((x) => x.supplierId === f.supplierId)) { const n = cylNum(c.value); if (n) geoms.add(+(n * Math.PI / 4 * b[0] ** 2 * b[1] / 1e6).toFixed(2)); } }
  let okRuns = 0; const okSup = new Set();
  const th = new Set();
  for (const run of g.runs) {
    const h = hintsFor(run);
    let pass = [];
    if (rule === "disp") { th.add(`≥${h.minDisp}`); pass = dv.filter((f) => { const x = litres(f.value); return x != null && x >= h.minDisp; }); }
    else if (rule === "maxDisp") { th.add(`≤${h.maxDisp}`); pass = dv.filter((f) => { const x = litres(f.value); return x != null && x <= h.maxDisp * 1.005; }); }
    else if (rule === "cyl") { th.add(`${h.cylExact ? "=" : "≥"}${h.minCyl}`); pass = cv.filter((f) => { const x = cylNum(f.value); return x != null && (h.cylExact ? x === h.minCyl : x >= h.minCyl); }); }
    else if (rule === "layout") { th.add(h.cylLayout); pass = cv.filter((f) => layoutOf(f.value) === (h.cylLayout === "v" ? "v" : "inline")); }
    if (pass.length) { okRuns++; pass.forEach((f) => okSup.add(f.supplierId)); }
  }
  const src = rule === "cyl" || rule === "layout" ? cv : dv;
  const vals = new Map();
  for (const f of src) { const v = String(f.value).slice(0, 14); if (!vals.has(v)) vals.set(v, new Set()); vals.get(v).add(f.supplierId); }
  const nSup = new Set(src.map((f) => f.supplierId)).size;
  const verdict = okRuns === 0 ? (nSup >= 2 ? "dung_nhieu_nguon" : "dung_mot_nguon") : "CO_NGUON_DAT";
  tally[verdict] = (tally[verdict] || 0) + g.rows;
  out.push([verdict, model, rule, g.rows, g.runs.size, okRuns, [...th].slice(0, 5).join(" "), [...vals].map(([v, s]) => `${v}×${s.size}`).join(" ; "), [...geoms].join("/"), [...okSup].join(",")].join("\t"));
}
out.sort();
fs.writeFileSync(path.join(HERE, "mat-soat.tsv"), "kết luận\tmodel\tluật\tdòng\tlượt\tlượt có nguồn đạt\tngưỡng\tgiá trị×số NCC\tdung tích tính từ bore×stroke×xi lanh\tNCC ghi số đạt\n" + out.join("\n") + "\n");
console.log(JSON.stringify(tally), `${G.size} nhóm`);
