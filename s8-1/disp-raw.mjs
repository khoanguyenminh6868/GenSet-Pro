// node disp-raw.mjs <code dir> <cn dir> <out.json>
// Quét THÔ mọi bảng: ô dưới cột / sau nhãn có specKey = disp, kèm cờ đơn vị cc / ml / cm3 hoặc số trơ > 100.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [WT, CN, OUT] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((d) => d.status !== "incomplete");
const CCU = /\bcc\b|\dcc\b|\bccm\b|cm3|cm³|\bml\b|c\.c\./i;
const out = [];
const num = (s) => { const m = String(s).replace(/(\d),(\d{3})(?!\d)/g, "$1$2").match(/\d+(?:[.,]\d+)?/); return m ? Number(m[0].replace(",", ".")) : null; };
for (const s of sups) (s.specTables || []).forEach((t, ti) => {
  const hs = (t.header || []).map((h) => C.cellsOf(h));
  const hit = (label, value, how) => {
    const x = num(value);
    if (x == null) return;
    const unitCc = CCU.test(value) || CCU.test(label);
    if (!unitCc && !(x > 100)) return;
    out.push({ sid: s.id, n: t.n, table: ti, title: t.title || "", how, label, value, x, unitCc });
  };
  if (hs.length) {
    hs.forEach((h, hi) => h.forEach((c, ci) => {
      if (C.specKey(c) !== "disp") return;
      const unitBelow = hs[hi + 1]?.[ci] ? ` [${hs[hi + 1][ci]}]` : "";
      for (const r of t.rows || []) { const cells = C.cellsOf(r); if (cells[ci] != null) hit(`${c}${unitBelow}`, cells[ci], `cột ${ci} tiêu đề ${hi}`); }
    }));
  } else {
    for (const r of t.rows || []) { const cells = C.cellsOf(r); if (cells.length >= 2 && C.specKey(cells[0]) === "disp") for (const v of cells.slice(1)) hit(cells[0], v, "nhãn"); }
  }
});
fs.writeFileSync(OUT, JSON.stringify(out));
console.error(`ô thô: ${out.length}`);
