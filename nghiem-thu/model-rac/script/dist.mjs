import fs from "node:fs";
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const first = { "1-10": 0, "11-20": 0, "21-30": 0 }, inN = {}, junkIn = [];
let sets = 0, bigs = [];
for (const k of Object.keys(A)) {
  const a = A[k], b = B[k]; if (!b || a.error || b.error) continue;
  const i = b.top.filter((x) => !a.top.includes(x)); if (!i.length && JSON.stringify(a.top) === JSON.stringify(b.top)) continue;
  if (!i.length) continue;
  sets++; inN[i.length] = (inN[i.length] || 0) + 1;
  const pos = Math.min(...i.map((x) => b.top.indexOf(x))) + 1;
  first[pos <= 10 ? "1-10" : pos <= 20 ? "11-20" : "21-30"]++;
  if (i.length >= 5) bigs.push({ k, in: i.length, pos });
}
console.log({ sets, vị_trí_dòng_mới_cao_nhất: first, số_dòng_mới_mỗi_gói: inN });
console.log("đổi nhiều (≥5 dòng mới):", JSON.stringify(bigs.slice(0, 12)), bigs.length);
// nhà cung cấp của dòng mới
const sup = {}; for (const k of Object.keys(A)) { const a = A[k], b = B[k]; if (!b || a.error || b.error) continue; for (const x of b.top) if (!a.top.includes(x)) { const s = x.split("|")[0]; sup[s] = (sup[s] || 0) + 1; } }
console.log("NCC của dòng mới:", JSON.stringify(Object.entries(sup).sort((x, y) => y[1] - x[1]).slice(0, 8)));
const sup2 = {}; for (const k of Object.keys(A)) { const a = A[k], b = B[k]; if (!b || a.error || b.error) continue; for (const x of a.top) if (!b.top.includes(x)) { const s = x.split("|")[0]; sup2[s] = (sup2[s] || 0) + 1; } }
console.log("NCC của dòng ra:", JSON.stringify(Object.entries(sup2).sort((x, y) => y[1] - x[1]).slice(0, 8)));
