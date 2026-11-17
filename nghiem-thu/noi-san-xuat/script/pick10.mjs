// 10 gói đổi nhiều nhất (một cỡ, #0), rải nhiều cỡ công suất
import fs from "node:fs";
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const rows = Object.keys(A).filter((k) => k.endsWith("#0") && B[k] && !A[k].error).map((k) => ({ k: k.slice(0, -2), n: B[k].top.filter((x) => !A[k].top.includes(x)).length })).filter((x) => x.n > 0);
rows.sort((a, b) => b.n - a.n);
const seen = new Set(), pick = [];
for (const r of rows) { if (pick.length >= 10) break; const sig = A[r.k + "#0"].top.slice(0, 3).join(); if (seen.has(sig)) continue; seen.add(sig); pick.push(r); }
console.log(pick.map((p) => p.k).join(","));
console.error(pick.map((p) => `${p.k}:${p.n}`).join(" "));
