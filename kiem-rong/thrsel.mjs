import fs from "node:fs";
const R = JSON.parse(fs.readFileSync("out/thr.json", "utf8"));
const kva = (c) => (c.unit === "kVA" ? c.value : c.value / 0.8);
const has = (r) => r.th1.minDisp != null || r.th1.maxDisp != null || r.th1.minCyl != null || r.th1.minPrime;
const pool = R.filter(has);
// điểm "bất thường": tỉ lệ dung tích/kVA, xi lanh vs kVA, prime/cỡ, nhiều cỡ
const odd = (r) => { let s = 0; const k = kva(r.cap);
  if (r.th1.minDisp != null) { const x = r.th1.minDisp / k; if (x > 0.06 || x < 0.006) s += 2; }
  if (r.th1.minCyl != null) { if (k > 300 && r.th1.minCyl < 6) s += 2; if (k < 100 && r.th1.minCyl > 4) s += 2; }
  if (r.th1.maxDisp != null) s += 2;
  if (r.th1.minPrime) { const p = r.th1.minPrime.kVA ?? r.th1.minPrime.kW / 0.8; const x = p / k; if (x < 0.8 || x > 1.15) s += 2; }
  if (r.nSizes > 1) s += 3; return s; };
const sorted = [...pool].sort((a, b) => odd(b) - odd(a) || a.key.localeCompare(b.key));
const sel = []; const used = new Set();
for (const r of sorted) { if (sel.length >= 30) break; sel.push(r); used.add(r.key + r.i); }
// thêm 30 ngẫu nhiên có thứ tự cố định, mỗi loại ngưỡng ≥ 8
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (const k of ["minDisp", "minCyl", "minPrime", "maxDisp"]) { const cand = pool.filter((r) => (k === "minPrime" ? r.th1.minPrime : r.th1[k] != null) && !used.has(r.key + r.i)); for (let n = 0; n < 12 && cand.length; n++) { const r = cand.splice(Math.floor(rnd() * cand.length), 1)[0]; sel.push(r); used.add(r.key + r.i); } }
const lines = [];
sel.forEach((r, n) => {
  lines.push(`### #${n + 1} ${r.key} [${r.src}] cỡ ${r.cap.value} ${r.cap.unit}${r.nSizes > 1 ? ` (gói ${r.nSizes} cỡ, lượt ${r.i + 1})` : ""}`);
  lines.push(`ngưỡng sau plausible: ${JSON.stringify(r.th1)} | trước: ${JSON.stringify(r.th0)} | thô disp=${JSON.stringify(r.raw.disp)} dmax=${JSON.stringify(r.raw.dmax)} cyl=${JSON.stringify(r.raw.cyl)}`);
  for (const k of ["minDisp", "maxDisp", "minCyl"]) { const c = r.cells[k]; if (c.length && r.th1[k] != null) lines.push(`  ${k}=${r.th1[k]} ← ${c.map((x) => JSON.stringify(x.slice(0, 220))).join(" ⏐ ")}`); }
  if (r.th1.minPrime) lines.push(`  minPrime=${JSON.stringify(r.th1.minPrime)} (các giá trị prime thô: ${JSON.stringify(r.prime)}) ← ${(r.primeLines || []).map((x) => JSON.stringify((x.prev ? x.prev.slice(0, 80) + " ⏎ " : "") + x.line.slice(0, 200))).join(" ⏐ ")}`);
  if (r.sizeQuote && r.nSizes > 1) lines.push(`  nguồn cỡ: ${JSON.stringify(r.sizeQuote.slice(0, 120))}`);
});
fs.writeFileSync("out/thr-review.md", lines.join("\n"));
console.log("pool", pool.length, "chọn", sel.length);
