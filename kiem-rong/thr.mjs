// Mục 4 + 8: ngưỡng đọc từ HSMT cho từng cỡ. node thr.mjs  -> out/thr.json
import fs from "node:fs";
import * as L from "./lib.mjs";
const C = L.corpus();
const rows = [];
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let mismatch = 0;
const fnum = (v) => String(v).replace(".", "[.,]");
for (const e of C.values()) {
  const { found, runs } = L.sizesOfEntry(e);
  const h0 = L.B.hintsOf(e.text, ""), hi = L.INS.hintsOf(e.text, "");
  for (const k of ["minDisp", "maxDisp", "minCyl", "minPrime", "maxFuel"]) if (!eq(h0[k], hi[k])) mismatch++;
  const text = L.B.unflatten(e.text).split("\n").map((l) => l.replace(/[ \t ]{2,}/g, " "));
  for (const run of runs) {
    const cap = run.cap; if (!cap) continue;
    const h1 = L.B.plausible(h0, cap);
    const rec = { key: e.key, src: e.src, i: run.i, nSizes: found.length, nRuns: runs.length, cap, sizeQuote: run.size?.quote || null,
      raw: hi._raw, prime: hi._prime, primeKept: hi._primeKept, th0: { minDisp: h0.minDisp, maxDisp: h0.maxDisp, minCyl: h0.minCyl, minPrime: h0.minPrime }, th1: { minDisp: h1.minDisp, maxDisp: h1.maxDisp, minCyl: h1.minCyl, minPrime: h1.minPrime },
      cells: { minDisp: [...new Set(hi._src.disp)].slice(0, 4), maxDisp: [...new Set(hi._src.dmax)].slice(0, 4), minCyl: [...new Set(hi._src.cyl)].slice(0, 4) } };
    // dòng nguồn của minPrime: các dòng có nhãn Prime / liên tục + giá trị
    if (h0.minPrime) {
      const v = h0.minPrime.kVA ?? h0.minPrime.kW, re = new RegExp(`(?<![\\d.,])${fnum(v)}(?![\\d])`);
      rec.primeLines = text.map((l, i) => ({ l, i })).filter(({ l }) => re.test(l) && /prime|li[êe]n t[ụu]c|continuous|c[ơo] b[ảa]n|công suất/i.test(l)).slice(0, 3).map(({ l, i }) => ({ prev: (text[i - 1] || "").slice(0, 160), line: l.slice(0, 260) }));
    }
    rows.push(rec);
  }
}
fs.writeFileSync(L.HERE + "/out/thr.json", JSON.stringify(rows));
const cnt = (f) => rows.filter(f).length;
console.log("lượt", rows.length, "mismatch hints thật vs bản đo", mismatch);
console.log("có minDisp", cnt((r) => r.th1.minDisp != null), "maxDisp", cnt((r) => r.th1.maxDisp != null), "minCyl", cnt((r) => r.th1.minCyl != null), "minPrime", cnt((r) => r.th1.minPrime != null));
console.log("plausible cắt: minDisp", cnt((r) => r.th0.minDisp != null && r.th1.minDisp == null), "maxDisp", cnt((r) => r.th0.maxDisp != null && r.th1.maxDisp == null), "minCyl", cnt((r) => r.th0.minCyl != null && r.th1.minCyl == null), "minPrime", cnt((r) => r.th0.minPrime && !r.th1.minPrime));
process.exit(0);
