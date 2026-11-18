import fs from "node:fs";
const A = JSON.parse(fs.readFileSync("gop-main.json", "utf8")), B = JSON.parse(fs.readFileSync("gop-lech-cot-11.json", "utf8"));
const by = new Map();
for (const k of Object.keys(A)) { const a = A[k], b = B[k]; if (!a.all) continue; const mb = new Map(b.all); for (const [r, s] of a.all) if (mb.has(r) && mb.get(r) !== s) { const sup = r.split("|")[0]; const key = r.split("|").slice(0, 3).join("|") + " Δ" + (mb.get(r) - s).toFixed(1); const o = by.get(sup) || new Map(); o.set(key, (o.get(key) || 0) + 1); by.set(sup, o); } }
for (const [sup, o] of by) { console.log("\n" + sup); console.log([...o].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => `  ${n}× ${k}`).join("\n")); }
