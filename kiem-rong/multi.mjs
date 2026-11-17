// Mục 8: gói nhiều cỡ và ngưỡng null / ngưỡng của cỡ khác. node multi.mjs -> out/multi.json
import fs from "node:fs";
const R = JSON.parse(fs.readFileSync("out/thr.json", "utf8"));
const M = R.filter((r) => r.nSizes > 1);
const pk = new Set(M.map((r) => r.key));
const distinct = (a) => new Set(a).size;
const rows = [];
for (const r of M) {
  const f = {};
  for (const [k, raw] of [["minDisp", r.raw.disp], ["maxDisp", r.raw.dmax], ["minCyl", r.raw.cyl]]) {
    if (raw.length && distinct(raw) > 1) f[k] = "null vì các giá trị khác nhau: " + [...new Set(raw)].join("/");
  }
  const pv = r.prime.filter((p) => p.sec === "genset");
  // minPrime: null khi các prime cách xa nhau
  if (r.th0.minPrime == null && r.prime.length > 1 && distinct(r.prime.map((p) => p.kVA ?? p.kW)) > 1) f.minPrime = "null vì prime khác nhau: " + [...new Set(r.prime.map((p) => `${p.kVA ?? p.kW}${p.kVA ? "kVA" : "kW"}/${p.sec}`))].join(", ");
  // ngưỡng nghi của cỡ khác: maxDisp thấp hơn một dung tích tối thiểu thô, hay minDisp cao hơn một dung tích tối đa thô
  const sus = {};
  if (r.th1.maxDisp != null && r.raw.disp.some((x) => x > r.th1.maxDisp)) sus.maxDisp = `maxDisp ${r.th1.maxDisp} nhưng HSMT còn dung tích tối thiểu ${[...new Set(r.raw.disp)].join("/")}`;
  if (r.th1.minDisp != null && r.raw.dmax.some((x) => x < r.th1.minDisp)) sus.minDisp = `minDisp ${r.th1.minDisp} nhưng HSMT còn dung tích tối đa ${[...new Set(r.raw.dmax)].join("/")}`;
  if (r.th1.minPrime) { const k = r.cap.unit === "kVA" ? r.cap.value : r.cap.value / 0.8, p = r.th1.minPrime.kVA ?? r.th1.minPrime.kW / 0.8; if (p < k * 0.9 || p > k * 1.1) sus.minPrime = `minPrime ${JSON.stringify(r.th1.minPrime)} lệch cỡ ${r.cap.value} ${r.cap.unit}`; }
  rows.push({ key: r.key, src: r.src, i: r.i, nSizes: r.nSizes, cap: `${r.cap.value} ${r.cap.unit}`, th1: r.th1, nullBecause: f, suspect: sus });
}
fs.writeFileSync("out/multi.json", JSON.stringify(rows, null, 1));
const cnt = (g) => rows.filter(g).length;
console.log("gói nhiều cỡ (có văn bản+phân tích):", pk.size, "| lượt cỡ:", rows.length);
const nsz = {}; for (const r of M) if (r.i === 0) nsz[r.nSizes] = (nsz[r.nSizes] || 0) + 1; console.log("theo số cỡ:", nsz);
console.log("cỡ có ít nhất 1 ngưỡng null vì giá trị khác nhau:", cnt((r) => Object.keys(r.nullBecause).length), "| theo loại:", ["minDisp", "maxDisp", "minCyl", "minPrime"].map((k) => k + "=" + cnt((r) => r.nullBecause[k])).join(" "));
console.log("cỡ nghi nhận ngưỡng của cỡ khác:", cnt((r) => Object.keys(r.suspect).length), "| theo loại:", ["minDisp", "maxDisp", "minPrime"].map((k) => k + "=" + cnt((r) => r.suspect[k])).join(" "));
const gp = {}; for (const r of rows) if (Object.keys(r.nullBecause).length) gp[r.key] = 1; console.log("số gói có ít nhất 1 cỡ null:", Object.keys(gp).length);
for (const r of rows.filter((r) => Object.keys(r.suspect).length)) console.log("NGHI", r.key, r.cap, JSON.stringify(r.suspect));
