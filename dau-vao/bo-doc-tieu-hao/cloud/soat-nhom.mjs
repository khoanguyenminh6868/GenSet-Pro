// Soát toàn bộ dòng mất: ngưỡng từng lượt, tỉ lệ công suất dòng / HSMT, vượt bao nhiêu %, ngưỡng lạ.
import fs from "node:fs";
const J = JSON.parse(fs.readFileSync(new URL("./giai-thich.json", import.meta.url), "utf8"));
const out = [];
const p = (...a) => out.push(a.join(" "));
const num = (v) => { const m = String(v ?? "").replace(",", ".").match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
const kvaOf = (x) => {
  const l = x.line || {};
  const vals = [l.primeKva, l.prime, l.kva, l.kVA, l.powerKva].map(num).filter((n) => n != null);
  return vals.length ? vals[0] : null;
};
p("Khoá của 1 bản ghi lost:", Object.keys(J.lost[0]).join(","));
p("line mẫu:", JSON.stringify(J.lost[0].line).slice(0, 500));
p("lim mẫu:", JSON.stringify(J.lost[0].lim));

const LIM = { fuel: "maxFuel", fuel75: "maxFuel75", fuel50: "maxFuel50" };
const fuelRows = J.lost.filter((x) => (x.ruled || []).some((r) => LIM[r]));
let noKva = 0; const ratio = { "<=1.05": 0, "1.05-1.25": 0, "1.25-1.5": 0, "1.5-2": 0, ">2": 0 };
const over = { "<=2%": 0, "2-5%": 0, "5-10%": 0, "10-25%": 0, ">25%": 0 };
const srcLabels = new Map(); const perRun = new Map();
for (const x of fuelRows) {
  const kva = kvaOf(x), cap = x.lim?.cap;
  if (!kva || !cap) noKva++;
  else { const r = kva / cap; ratio[r <= 1.05 ? "<=1.05" : r <= 1.25 ? "1.05-1.25" : r <= 1.5 ? "1.25-1.5" : r <= 2 ? "1.5-2" : ">2"]++; }
  let worst = 0;
  for (const k of x.ruled) if (LIM[k]) {
    const f = (x.fuel || []).find((y) => y.k === k), lim = x.lim?.[LIM[k]];
    if (f) { const key = `${k} | ${f.l} | ${f.c ?? ""}`; srcLabels.set(key, (srcLabels.get(key) || 0) + 1); }
    const v = f ? num(f.v) : null;
    if (v != null && lim) worst = Math.max(worst, v / lim - 1);
  }
  over[worst <= .02 ? "<=2%" : worst <= .05 ? "2-5%" : worst <= .1 ? "5-10%" : worst <= .25 ? "10-25%" : ">25%"]++;
  const rk = `${x.run} cap=${cap} max=${x.lim?.maxFuel ?? "-"}/${x.lim?.maxFuel75 ?? "-"}/${x.lim?.maxFuel50 ?? "-"}`;
  const e = perRun.get(rk) || { n: 0, kv: [] }; e.n++; if (kva) e.kv.push(kva); perRun.set(rk, e);
}
p("\nDòng mất vì tiêu hao:", fuelRows.length, "| không có kVA/cap:", noKva);
p("Tỉ lệ kVA dòng / cap HSMT:", JSON.stringify(ratio));
p("Mức vượt ngưỡng (lớn nhất):", JSON.stringify(over));
p("\nNhãn nguồn của số bị loại:");
for (const [k, n] of [...srcLabels].sort((a, b) => b[1] - a[1])) p(n, k);
p("\nTheo lượt (L/h per kVA ngưỡng; kVA dòng nhỏ nhất..lớn nhất):");
for (const [k, e] of [...perRun].sort((a, b) => b[1].n - a[1].n)) {
  const cap = num(k.match(/cap=([^ ]+)/)?.[1]), max = num(k.match(/max=([^/]+)/)?.[1]);
  p(e.n, k, cap && max ? `L/h/kVA=${(max / cap).toFixed(3)}` : "", e.kv.length ? `kVA ${Math.min(...e.kv)}..${Math.max(...e.kv)}` : "");
}
p("\nNgưỡng xi lanh lạ (min <= 2):");
for (const x of J.lost.filter((y) => (y.ruled || []).includes("cyl") && y.lim?.minCyl <= 2)) p(x.run, x.sup, x.model, JSON.stringify(x.lim));
p("\nKhông có số tiêu hao khớp nhãn:", fuelRows.filter((x) => x.ruled.some((k) => LIM[k] && !(x.fuel || []).some((y) => y.k === k))).length);
fs.writeFileSync(new URL("./soat-nhom.txt", import.meta.url), out.join("\n"));
console.log(out.join("\n").slice(0, 12000));
