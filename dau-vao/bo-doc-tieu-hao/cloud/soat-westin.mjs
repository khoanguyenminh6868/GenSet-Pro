// Soát mọi dòng −300 (fuelMinus): số 100% của model trong bảng nguồn, thứ tự 100 > 75 > 50, suất theo kW của tờ.
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync(new URL("./giai-thich.json", import.meta.url), "utf8"));
const W = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/wt-tieu-hao/suppliers/cn/westinpower.json", "utf8"));
const num = (v) => { const m = String(v ?? "").replace(",", ".").match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
const models = new Map();
for (const x of T.fuelMinus.filter((y) => y.sup === "westinpower")) { const e = models.get(x.model) || { n: 0, f: new Set() }; e.n++; e.f.add((x.fuel || []).map((f) => `${f.k}=${f.v}`).join(" ")); models.set(x.model, e); }
for (const [m, e] of models) {
  console.log(`\n## ${m} (${e.n} dòng) ${[...e.f].join(" || ")}`);
  const ts = W.specTables.filter((t) => [...(t.header || []), ...(t.rows || [])].some((r) => String(r).includes(m)));
  let shown = 0;
  for (const t of ts) {
    const rows = [...(t.header || []), ...(t.rows || [])].map(String), fr = rows.filter((r) => /fuel\s*consum/i.test(r));
    if (!fr.length || shown++ >= 2) continue;
    const pw = rows.filter((r) => /prime power|rated power|standby power|output/i.test(r)).slice(0, 2).map((r) => r.slice(0, 70));
    console.log(`  n${t.n} ${String(t.title).slice(0, 50)} | công suất: ${pw.join(" ; ")}`);
    fr.slice(0, 5).forEach((r) => console.log("    ", r.slice(0, 110)));
  }
}
let bad = 0; const seen = new Set();
for (const x of T.fuelMinus) {
  const g = (k) => num((x.fuel || []).find((f) => f.k === k)?.v), a = g("fuel"), b = g("fuel75"), c = g("fuel50"), key = `${x.sup}|${x.model}|${a}|${b}|${c}`;
  if (seen.has(key)) continue; seen.add(key);
  if ((a != null && b != null && b >= a) || (b != null && c != null && c >= b)) { bad++; console.log("\nTHỨ TỰ SAI:", key); }
}
console.log("\nbộ số khác nhau:", seen.size, "| thứ tự sai:", bad);
