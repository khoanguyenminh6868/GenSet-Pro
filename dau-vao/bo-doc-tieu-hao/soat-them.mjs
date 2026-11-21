// Soát MỌI thông số xi lanh / tiêu hao mà nhánh đọc khác gốc. node soat-them.mjs <gốc> <nhánh> <out.tsv>
// Xi lanh thêm: so số và kiểu (L / V) với mọi NCC khác đã ghi model đó ở gốc. Tiêu hao: số L/h đọc ra, mức tải, so với chữ dòng nguồn.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [a, b, out] = process.argv.slice(2);
const load = (root) => {
  const w = {}; w.window = w; w.globalThis = w; w.console = console;
  const ctx = vm.createContext(w);
  for (const f of ["conversions.js", "catalog.js", "spec-norm.js"]) vm.runInContext(fs.readFileSync(path.join(root, "web", f), "utf8"), ctx, { filename: f });
  return w;
};
const A = load(a), B = load(b);
const cn = path.join(b, "suppliers", "cn");
const sups = fs.readdirSync(cn).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cn, f), "utf8"))).filter((s) => s.status !== "incomplete");
const id = (r) => `${r.supplierId}|${r.n}|${r.table}|${r.row ?? "L"}|${r.kind}|${r.model}`;
const others = new Map(), oldRecs = new Map(), newRecs = [];
for (const s of sups) {
  for (const r of A.GenbidCatalog.fromSupplier(JSON.parse(JSON.stringify(s)), [])) {
    oldRecs.set(id(r), r);
    if (r.kind !== "engine" || !r.model) continue;
    for (const x of r.specs || []) if (x.key === "cyl") {
      const n = A.GenbidSpecNorm.normalize(x, { title: r.title, header: r.header || [] }), k = A.GenbidCatalog.keyOf(r.model);
      if (n?.count) others.set(k, [...(others.get(k) || []), { s: s.id, c: n.count, l: n.cond?.layout || "" }]);
    }
  }
  for (const r of B.GenbidCatalog.fromSupplier(JSON.parse(JSON.stringify(s)), [])) newRecs.push([s, r]);
}
const rows = [], tally = {};
const bump = (k) => { tally[k] = (tally[k] || 0) + 1; };
for (const [s, r] of newRecs) {
  const o = oldRecs.get(id(r)), had = new Set((o?.specs || []).map((x) => `${x.key}|${x.label}|${x.value}`));
  for (const x of r.specs || []) {
    if (had.has(`${x.key}|${x.label}|${x.value}`) || !/^(cyl|fuel|fuel75|fuel50)$/.test(x.key)) continue;
    const n = B.GenbidSpecNorm.normalize(x, { title: r.title, header: r.header || r.lines?.header || [], rows: s.specTables?.[r.table]?.rows || [] });
    let verdict;
    if (x.key === "cyl") {
      const oth = (others.get(B.GenbidCatalog.keyOf(r.model || "")) || []).filter((y) => y.s !== s.id);
      const cs = [...new Set(oth.map((y) => y.c))], ls = [...new Set(oth.map((y) => y.l).filter(Boolean))];
      verdict = !oth.length ? "khong-NCC-khac" : !cs.includes(n?.count) ? `LECH-SO(${cs})` : n?.cond?.layout && ls.length && !ls.includes(n.cond.layout) ? `LECH-KIEU(${ls})` : "khop";
    } else {
      const lines = r.line ? [r.line] : r.lines?.rows || [], num = n?.num;
      const inText = num != null && lines.some((l) => new RegExp(`(?<![\\d.])${String(num).replace(".", "\\.")}0*(?![\\d])`).test(l));
      verdict = n?.unit !== "L/h" ? `KHONG-L/h(${n?.unit}|${(n?.missing || []).join("+")})` : !inText ? "SO-KHONG-CO-TRONG-DONG" : n?.cond?.load == null ? "khong-muc-tai" : `L/h@${n.cond.load}`;
    }
    bump(`${x.key} ${verdict.replace(/\(.*/, "")}`);
    rows.push([s.id, r.n, r.model, x.key, x.label, x.value, x.unitCell || "", n?.num ?? n?.count ?? "", verdict].join("\t"));
  }
}
fs.writeFileSync(out, ["ncc\tn\tmodel\tkhoa\tnhan\tgia-tri\to-don-vi\tso\tket-qua", ...rows].join("\n") + "\n");
console.log(rows.length, JSON.stringify(tally, null, 1));
