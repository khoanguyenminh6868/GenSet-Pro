// Tổng hợp đo mẫu A/B: node tong-hop.mjs <out1.json> [out2.json ...]
import fs from "node:fs";
const all = Object.assign({}, ...process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8"))));
const runs = Object.entries(all).filter(([, o]) => !o.error && o.off), errs = Object.entries(all).filter(([, o]) => o.error);
const keys = (l) => new Set(l.map((x) => x[0])), diff = (a, b) => { const A = keys(a), Bk = keys(b); return { inn: b.filter((x) => !A.has(x[0])), out: a.filter((x) => !Bk.has(x[0])) }; };
const n = (v) => runs.filter(([, o]) => diff(o.off, o[v]).inn.length).length;
console.log(`lượt: ${runs.length} (lỗi ${errs.length}); gói: ${new Set(runs.map(([k]) => k.split("#")[0])).size}`);
console.log(`top 30 đổi tập dòng: A ${n("A")}, B ${n("B")}, A+B ${n("AB")}`);
const order = runs.filter(([, o]) => o.off.map((x) => x[0]).join() !== o.AB.map((x) => x[0]).join()).length;
console.log(`A+B đổi tập hoặc thứ tự: ${order}`);
const byOrigin = {}; for (const [, o] of runs) { const k = o.origin; byOrigin[k] ||= [0, 0]; byOrigin[k][0]++; if (diff(o.off, o.AB).inn.length) byOrigin[k][1]++; }
console.log("theo xuất xứ [lượt, đổi]:", JSON.stringify(byOrigin));
let tin = 0, tout = 0, aRows = 0, aTop = 0; const makesIn = {}, makesOut = {};
for (const [, o] of runs) { const d = diff(o.off, o.AB); tin += d.inn.length; tout += d.out.length; for (const x of d.inn) makesIn[x[2] || "?"] = (makesIn[x[2] || "?"] || 0) + 1; for (const x of d.out) makesOut[x[2] || "?"] = (makesOut[x[2] || "?"] || 0) + 1; aTop += o.AB.filter((x) => x[4]).length; aRows += o.AB.length; }
console.log(`dòng vào ${tin}, ra ${tout}; dòng top 30 (A+B) có "động cơ có datasheet hãng": ${aTop}/${aRows}`);
const s = (m) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ${v}`).join(", ");
console.log("hãng vào:", s(makesIn)); console.log("hãng ra:", s(makesOut));
// Số model khác nhau trong top 30 (trung bình) trước / sau.
const avg = (v) => (runs.reduce((t, [, o]) => t + new Set(o[v].map((x) => x[3])).size, 0) / runs.length).toFixed(1);
console.log(`số model động cơ khác nhau trung bình trong top 30: off ${avg("off")}, A ${avg("A")}, B ${avg("B")}, A+B ${avg("AB")}`);
console.log("\n== 10 lượt đổi nhiều nhất (A+B so với main) ==");
const top = runs.map(([k, o]) => [k, o, diff(o.off, o.AB)]).sort((a, b) => b[2].inn.length - a[2].inn.length).slice(0, 10);
for (const [k, o, d] of top) {
  const dA = diff(o.off, o.A).inn.length, dB = diff(o.off, o.B).inn.length;
  console.log(`\n${k} | ${o.origin} | ${o.cap.value} ${o.cap.unit} | đổi ${d.inn.length} dòng (chỉ A: ${dA}, chỉ B: ${dB})`);
  const f = (x) => `${x[2] || "?"} ${x[3]} | ${x[0].split("|")[0]} | ${x[1]}đ${x[4] ? " +A" : ""}`;
  for (const x of d.inn) console.log("   VÀO " + f(x));
  for (const x of d.out) console.log("   RA  " + f(x));
}
if (errs.length) console.log("\nlỗi:", errs.slice(0, 3).map(([k, o]) => `${k}: ${o.error.slice(0, 200)}`).join("\n"));
