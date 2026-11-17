// disp after the default-unit rule: what got a default unit, what still lacks one.
const fs = require("fs"), path = require("path");
const REPO = process.argv[2];
for (const f of ["web/conversions.js", "web/spec-norm.js"]) new Function(fs.readFileSync(path.join(REPO, f), "utf8"))();
const { C, S } = require("./load.cjs")(REPO);
const SN = globalThis.GenbidSpecNorm;
const cnt = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
const top = (m, n = 14) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
const st = new Map(), defLab = new Map(), miss = new Map(), other = new Map(); let n = 0, lo = Infinity, hi = -Infinity; const edge = [];
for (const s of S) {
  if (s.status === "incomplete") continue;
  const rowsOf = (o) => (s.specTables[o.table] || {}).rows;
  for (const o of C.fromSupplier(s)) {
    const list = SN.normalizeRecord(o, rowsOf(o)) || []; const arr = Array.isArray(list) ? list : list.specs || [];
    for (const r of arr) {
      if (r.key !== "disp") { if (r.cond && r.cond.unitFrom) cnt(other, r.key); continue; }
      n++;
      const d = r.cond && r.cond.unitFrom === "default";
      cnt(st, `${r.unit || "-"}${d ? " (mac dinh)" : ""}${r.missing.length ? " thieu:" + r.missing.join("+") : ""}`);
      if (d) { cnt(defLab, `[${s.id}] "${r.raw.label.slice(0, 30)}"`); const x = r.num; if (x != null) { lo = Math.min(lo, x); hi = Math.max(hi, x); if (x < 0.6 || x > 80) edge.push(`${s.id} "${r.raw.label}"="${r.raw.value}" (${o.model})`); } }
      if (r.missing.includes("unit")) cnt(miss, `[${s.id}] "${r.raw.label.slice(0, 30)}" = "${r.raw.value.slice(0, 14)}"`);
    }
  }
}
console.log("disp:", n, "|", top(st, 20).map((x) => x.join("=")).join(" | "));
console.log("ma khac co unitFrom (phai la 0):", [...other].map((x) => x.join("=")).join(", ") || "0");
console.log("mac dinh: nho nhat", lo, "lon nhat", hi, "| gan bien (<0,6 hoac >80):", edge.length); for (const e of [...new Set(edge)].slice(0, 12)) console.log("    ", e);
console.log("nhan duoc mac dinh nhieu nhat:", top(defLab, 12).map((x) => x.join("×")).join(" | "));
console.log("con thieu don vi:", [...miss.values()].reduce((a, b) => a + b, 0)); for (const [e, c] of top(miss, 14)) console.log("    ", c, e);
