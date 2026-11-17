// Dòng trong top có dung tích động cơ quá nhỏ so với cỡ (dấu hiệu dòng nguồn có công suất đọc sai, vd khối lượng bị đọc thành kVA).
import fs from "node:fs";
import * as L from "./lib.mjs";
const sups = L.loadSuppliers(), env = new L.Env(sups), facts = L.B.modelFacts(env.full, sups);
const disp = new Map();
for (const [k, fs_] of facts) if (k.startsWith("engine:")) { const v = fs_.filter((f) => f.key === "disp").map((f) => { const n = Number(String(f.value).replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/)?.[0]); return /cc|cm/i.test(String(f.value)) || (n > 400 && Number.isInteger(n)) ? n / 1000 : n; }).filter((x) => x > 0 && x < 300); if (v.length) disp.set(k.slice(7), v.sort((a, b) => a - b)[Math.floor(v.length / 2)]); }
const R = []; for (const f of fs.readdirSync(L.HERE + "/out").filter((f) => /^run-\d+\.jsonl$/.test(f))) for (const l of fs.readFileSync(L.HERE + "/out/" + f, "utf8").split("\n")) if (l.trim()) R.push(JSON.parse(l));
let tot = 0, withD = 0, flag = []; const runs = new Set();
for (const r of R) { if (r.error || r.noCap) continue; const kva = r.cap.unit === "kVA" ? r.cap.value : r.cap.value / 0.8; if (kva < 60) continue;
  for (const x of r.top) { tot++; const d = disp.get(x.ek); if (d == null) continue; withD++; const ratio = d / kva; if (ratio < 0.006) { flag.push({ key: r.key, cap: kva, sup: x.sup, eng: x.model, make: x.make, d, ratio: +ratio.toFixed(4), ratios: x.ratios }); runs.add(r.key + "|" + r.i); } } }
console.log(`dòng trong top (cỡ ≥20 kVA) ${tot}, có dung tích ${withD}, nghi sai (dung tích/kVA <0,006, cỡ ≥60 kVA): ${flag.length} dòng ở ${runs.size} lượt`);
const by = {}; for (const f of flag) by[`${f.make} ${f.eng}`] = (by[`${f.make} ${f.eng}`] || 0) + 1;
console.log(Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 15));
for (const f of flag.slice(0, 15)) console.log(JSON.stringify(f));
process.exit(0);
