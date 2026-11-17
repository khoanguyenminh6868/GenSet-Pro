// Mục 7: Tìm NCC — fitsCap / engineRows, dải cũ vs mới. node find.mjs
import fs from "node:fs";
import * as L from "./lib.mjs";
const sups = L.loadSuppliers(), byId = new Map(sups.map((s) => [s.id, s])), C = L.corpus();
const fm = L.J2(L.RAW.W + "/doc-cache/findmatch.json").docs;
const inB = (x, v, lo, hi) => x >= v * lo && x <= v * hi + 1e-9;
const rows100 = (rec, cap) => L.CAT.build([rec]).engines.flatMap((e) => e.uses.filter((u) => inB(Math.min(...Object.values(u.power || {}).map((p) => p[cap.unit] ?? 1e9), 1e9), cap.value, 1, 1.4)).map((u) => e.model));
const res = [];
for (const [key, v] of Object.entries(fm)) {
  const r = v.d.result, caps = [r.cap];
  const e = C.get(key); const sz = e ? L.sizesOfEntry(e).found.map((s) => s.cap) : [];
  for (const a of r.added || []) {
    const rec = byId.get(a.supplierId); if (!rec) { res.push({ key, id: a.supplierId, missing: true }); continue; }
    for (const cap of [r.cap, ...sz.filter((c) => c.value !== r.cap.value)]) {
      const nn = L.B.engineRows(rec, cap), oo = L.OLD.engineRows(rec, cap), o100 = rows100(rec, cap);
      res.push({ key, id: a.supplierId, cap: `${cap.value} ${cap.unit}`, main: cap.value === r.cap.value, error: a.error || null, fitsNew: L.B.fitsCap(rec, cap), fitsOld: L.OLD.fitsCap(rec, cap), rowsNew: nn.length, rows100_140: o100.length, rows95_140: oo.length,
        lines: (rec.productLines || []).filter((p) => p.power?.unit === cap.unit).map((p) => `${p.power.min}-${p.power.max}`).slice(0, 6).join(" ; "), sample: nn.slice(0, 3) });
    }
  }
}
fs.writeFileSync(L.HERE + "/out/find.json", JSON.stringify(res, null, 1));
for (const x of res) console.log(JSON.stringify(x));
const m = res.filter((x) => x.main && !x.missing);
console.log("NCC×gói (cỡ chính):", m.length, "fits cũ", m.filter((x) => x.fitsOld).length, "fits mới", m.filter((x) => x.fitsNew).length, "| có dòng bảng: 95-140", m.filter((x) => x.rows95_140).length, "100-140", m.filter((x) => x.rows100_140).length, "mới", m.filter((x) => x.rowsNew).length);
process.exit(0);
