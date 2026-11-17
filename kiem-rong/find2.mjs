// Mục 7 (mở rộng): với mọi cỡ trong corpus, số NCC của hệ thống khớp dải cũ / mới (fitsCap) và có dòng bảng (engineRows).
import fs from "node:fs";
import * as L from "./lib.mjs";
const sups = L.loadSuppliers(), C = L.corpus();
const caps = new Map();
for (const e of C.values()) for (const r of L.sizesOfEntry(e).runs) if (r.cap) caps.set(`${r.cap.value} ${r.cap.unit}`, r.cap);
const built = sups.map((s) => ({ s, uses: L.CAT.build([s]).engines.flatMap((e) => e.uses.map((u) => ({ u, model: e.model }))) }));
const inB = (x, v, lo, hi) => x >= v * lo && x <= v * hi + 1e-9;
const pw = (u, c) => Math.min(...Object.values(u.power || {}).map((p) => p[c.unit] ?? 1e9), 1e9);
const out = [];
for (const [k, cap] of caps) {
  let fo = 0, fn = 0, ro = 0, rn = 0, ro100 = 0;
  for (const { s, uses } of built) {
    if (L.OLD.fitsCap(s, cap)) fo++; if (L.B.fitsCap(s, cap)) fn++;
    const hasN = uses.some(({ u }) => inB(pw(u, cap), cap.value, 0.995, 1.2)), hasO = uses.some(({ u }) => inB(pw(u, cap), cap.value, 1, 1.4)), has95 = uses.some(({ u }) => inB(pw(u, cap), cap.value, 0.95, 1.4));
    if (has95) ro++; if (hasO) ro100++; if (hasN) rn++;
  }
  out.push({ cap: k, fitsOld: fo, fitsNew: fn, rows95_140: ro, rows100_140: ro100, rowsNew: rn });
}
out.sort((a, b) => parseFloat(a.cap) - parseFloat(b.cap));
fs.writeFileSync(L.HERE + "/out/find2.json", JSON.stringify(out, null, 1));
const z = out.filter((x) => x.rowsNew === 0 && x.rows100_140 > 0), z2 = out.filter((x) => x.fitsNew === 0 && x.fitsOld > 0);
console.log("cỡ khác nhau", out.length, "| fits: tổng NCC×cỡ cũ", out.reduce((a, x) => a + x.fitsOld, 0), "mới", out.reduce((a, x) => a + x.fitsNew, 0), "| có dòng bảng 95-140", out.reduce((a, x) => a + x.rows95_140, 0), "100-140", out.reduce((a, x) => a + x.rows100_140, 0), "mới", out.reduce((a, x) => a + x.rowsNew, 0));
console.log("cỡ có NCC có dòng bảng ở 100-140 mà mới = 0:", z.length, z.map((x) => x.cap).join(", "));
console.log("cỡ fitsCap cũ>0 mà mới=0:", z2.length, z2.map((x) => x.cap).join(", "));
console.log("cỡ mới có ít (<3) NCC có dòng bảng:", out.filter((x) => x.rowsNew < 3).length, "/", out.length);
process.exit(0);
