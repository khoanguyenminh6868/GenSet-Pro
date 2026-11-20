// node thu.mjs : thử dropspec cyl (GP1000 A/M): 10 lượt, khoá 12V1600G31F / G21F của NCC khác và dòng green G31F: gốc / nhánh / thử
import fs from "node:fs";
const J = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url)));
const A = J("r-goc.json"), B = J("r-nhanh.json"), T = J("r-thu.json");
const st = (r, k) => { const a = r.all.filter(([x]) => x === k).map(([, s]) => s); const d = r.drop.filter((x) => x.k === k).map((x) => x.ruled.join("+")); return a.length ? "all " + a.join(",") : d.length ? "loại " + d.join(",") : "-"; };
for (const id of Object.keys(T)) {
  const ks = new Set([...A[id].all, ...B[id].all, ...T[id].all].map(([k]) => k).concat([...A[id].drop, ...B[id].drop, ...T[id].drop].map((d) => d.k)).filter((k) => /\|12V1600G31F\|/.test(k)));
  console.log(id, "minCyl", T[id].hints.minCyl, "exact", T[id].hints.cylExact, "top thử = top gốc?", T[id].top.filter((k) => !k.startsWith("green-power")).join() === A[id].top.filter((k) => !k.startsWith("green-power")).join());
  for (const k of ks) console.log(`   ${k.slice(0, 50).padEnd(50)} gốc: ${st(A[id], k).padEnd(12)} nhánh: ${st(B[id], k).padEnd(12)} thử: ${st(T[id], k)}`);
}
