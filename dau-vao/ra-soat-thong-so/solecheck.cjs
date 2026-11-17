// How often does soleUnit hand a unit cell to a column when another column of the header could own that unit?
const fs = require("fs"), path = require("path");
const REPO = process.argv[2];
for (const f of ["web/conversions.js", "web/spec-norm.js"]) new Function(fs.readFileSync(path.join(REPO, f), "utf8"))();
const { C, S } = require("./load.cjs")(REPO);
const SN = globalThis.GenbidSpecNorm;
const nf = (s) => String(s == null ? "" : s).normalize("NFKC").replace(/\s+/g, " ").trim();
const cellsOf = (line) => { const s = String(line || "").trim(); if (!s.startsWith("|")) return [s]; const c = s.split("|").slice(1).map((x) => x.trim()); return s.endsWith("|") ? c.slice(0, -1) : c; };
const COMP = {
  mm: /bore|缸径|stroke|行程|dimen|size|尺寸|l\s*[x×*]\s*[wm]\s*[x×*]\s*h|长.{0,3}宽/i,
  l: /displace|排量|swept|oil|机油|润滑油|tank|油箱|coolant|冷却液|capacity|容量/i,
  kg: /weigh|重量|毛重|净重/i, lh: /consum|油耗|耗油|fuel/i, db: /noise|db|噪/i, rpm: /speed|转速|rpm/i,
};
const unitKind = (u) => { const x = nf(u).toLowerCase().replace(/[()（）\[\]\s]/g, ""); return /^(mm|cm|m)$/.test(x) ? "mm" : /^(l|lt|ltr|cc)$/.test(x) ? "l" : /kg/.test(x) ? "kg" : /l\/h|lph|g\/kw|m3\/h|lt\/h/.test(x) ? "lh" : /db/.test(x) ? "db" : /rpm|r\/min/.test(x) ? "rpm" : null; };
const stat = new Map(), ex = new Map(); let sole = 0, byIndex = 0;
for (const s of S) {
  if (s.status === "incomplete") continue;
  for (const o of C.fromSupplier(s)) {
    const list = SN.normalizeRecord(o) || []; const arr = Array.isArray(list) ? list : list.specs || [];
    for (const r of arr) {
      const hu = r.cond && r.cond.headerUnit; if (!hu) continue;
      if (SN.headerUnit(r.raw.label, o.header || [])) { byIndex++; continue; }
      sole++;
      const kind = unitKind(hu); if (!kind) { stat.set(`${r.key}:?`, (stat.get(`${r.key}:?`) || 0) + 1); continue; }
      const cells = [...new Set((o.header || []).flatMap(cellsOf).map(nf).filter(Boolean))];
      const titles = cells.filter((c) => COMP[kind].test(c) && !unitKind(c));
      const k = `${r.key} <- ${kind} | so tieu de co the nhan don vi nay: ${titles.length >= 2 ? ">=2 (MO HO)" : titles.length}`;
      stat.set(k, (stat.get(k) || 0) + 1);
      if (titles.length >= 2) { if (!ex.has(r.key)) ex.set(r.key, new Map()); const m = ex.get(r.key); const e = `[${s.id} n${o.n}] nhan "${r.raw.label}" <- "${hu}" | tieu de canh tranh: ${titles.join(" ; ").slice(0, 160)}`; m.set(e, (m.get(e) || 0) + 1); }
    }
  }
}
console.log("headerUnit theo dung cot:", byIndex, "| theo luat 'duy nhat cung loai' (soleUnit):", sole);
for (const [k, n] of [...stat].sort()) console.log("  ", n, k);
for (const [k, m] of ex) { console.log("\n", k, "- vi du mo ho (", m.size, "bang-nhan):"); for (const [e, n] of [...m].sort((a, b) => b[1] - a[1]).slice(0, 7)) console.log("    ", n, e); }
