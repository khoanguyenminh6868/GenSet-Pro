// Buoc 4 kiem ke, phan 1: gom MOI nhan (nhan | gia tri, o tieu de cot) cua specTables (suppliers/cn) va nguon (sources 1001-1999, 3001+).
// Chi doc. Chay: node harvest.mjs  (cwd bat ky). Ra: labels.tsv, labels.json (cho an-xep.mjs).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REPO = "C:/Projects/GenSet Pro/GenSet-Pro";
const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4";
await import(pathToFileURL(path.join(REPO, "web", "catalog.js")).href);
const CAT = globalThis.GenbidCatalog;

const norm = (s) => String(s).normalize("NFKC").replace(/[:：]+\s*$/, "").replace(/\s+/g, " ").trim().toLowerCase();
const isNum = (s) => /^[\d\s.,:/%~≈<>≤≥+\-–()±*×xX]*$/.test(s);
const labelOk = (s) => s && s.length >= 2 && s.length <= 70 && !isNum(s) && /[a-zA-Z\u3400-\u9fffÀ-ɏ]/.test(s) && !/^https?:/.test(s);

// map: key = kind|norm  → {norm, raw, kind, lines, nccs:Set, models, nonempty, ex:[], specKey}
const M = new Map();
function add(kind, rawLabel, ncc, srcRef, line, nModels) {
  const label = String(rawLabel).trim();
  if (!labelOk(label)) return;
  const n = norm(label);
  const k = kind + "|" + n;
  let e = M.get(k);
  if (!e) { e = { n, raw: label, kind, lines: 0, nccs: new Set(), models: 0, ex: [], sk: CAT.specKey(label) || "" }; M.set(k, e); }
  e.lines++; e.models += nModels; e.nccs.add(ncc);
  if (e.ex.length < 6 && !e.ex.some((x) => x.ncc === ncc)) e.ex.push({ ncc, src: srcRef, line: String(line).replace(/\s+/g, " ").trim().slice(0, 220) });
}

// ---- 1. specTables (cn) ----
const cn = path.join(REPO, "suppliers", "cn");
let nTables = 0, nRows = 0;
for (const f of fs.readdirSync(cn).filter((x) => x.endsWith(".json"))) {
  const o = JSON.parse(fs.readFileSync(path.join(cn, f), "utf8"));
  const ncc = o.id || f.replace(/\.json$/, "");
  for (const t of o.specTables || []) {
    nTables++;
    const rows = (t.rows || []).filter((r) => String(r).trim());
    nRows += rows.length;
    const rc = rows.map((r) => CAT.cellsOf(r));
    // cot tieu de: moi o cua moi dong header; models = so dong du lieu co o cung chi so khong rong
    for (const h of t.header || []) {
      const hc = CAT.cellsOf(h);
      hc.forEach((c, i) => {
        if (!c) return;
        const cnt = rc.filter((r) => r[i] && String(r[i]).trim() && !/^[-–—/]+$/.test(r[i])).length;
        add("col", c, ncc, `n${t.n}`, h, cnt);
      });
    }
    // dong nhan | gia tri: o dau la nhan, cac o sau la gia tri (moi o = mot model)
    for (const r of rows) {
      const c = CAT.cellsOf(r);
      if (c.length < 2) continue;
      const vals = c.slice(1).filter((x) => x && !/^[-–—/]+$/.test(x));
      if (!vals.length) continue;
      add("row", c[0], ncc, `n${t.n}`, r, vals.length);
    }
  }
}
console.error("specTables:", nTables, "bang,", nRows, "dong");

// ---- 2. nguon (tep goc to hang): dong "nhan: gia tri" va "| nhan | gia tri" ----
const src = path.join(REPO, "suppliers", "sources");
let nFiles = 0;
for (const id of fs.readdirSync(src)) {
  const dir = path.join(src, id);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^(\d+)\.md$/);
    if (!m) continue;
    const num = +m[1];
    if (!((num >= 1001 && num <= 1999) || num >= 3001)) continue;
    nFiles++;
    const lines = fs.readFileSync(path.join(dir, f), "utf8").split("\n");
    for (const ln of lines) {
      const s = ln.trim();
      if (!s || s.length > 400) continue;
      if (s.startsWith("|")) {
        const c = CAT.cellsOf(s);
        if (c.length >= 2 && c[1]) add("srcrow", c[0], id, `${num}`, s, c.slice(1).filter(Boolean).length);
      } else {
        const mm = s.match(/^([^:：|]{2,60})[:：]\s*(\S.*)$/);
        if (mm) add("srcline", mm[1], id, `${num}`, s, 1);
      }
    }
  }
}
console.error("nguon:", nFiles, "tep");

const arr = [...M.values()].map((e) => ({ ...e, nccs: [...e.nccs] }));
fs.writeFileSync(path.join(OUT, "labels.json"), JSON.stringify(arr));
arr.sort((a, b) => b.lines - a.lines);
const tsv = ["kind\tnhan_chuan_hoa\tnhan_mau\tdong\tncc\tmodel_o\tspecKey"];
for (const e of arr) tsv.push([e.kind, e.n, e.raw, e.lines, e.nccs.length, e.models, e.sk].join("\t"));
fs.writeFileSync(path.join(OUT, "labels.tsv"), tsv.join("\n"));
console.error("nhan khac nhau:", arr.length);
