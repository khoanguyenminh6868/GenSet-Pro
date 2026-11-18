// node cylGroup.cjs <gopRow main> <gopRow nhánh> <winDiff.json>: dòng RA khỏi top 30 ở bước luật (d), gom theo động cơ: số xi lanh
// thắng, phiếu NCC, nguồn ghi khác, yêu cầu số xi lanh của các gói (minCyl, "trơ" = cylExact), số dòng / số lượt. Kèm số lượt có top < 30.
const fs = require("fs");
const [RA, RB, WD] = process.argv.slice(2);
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const A = J(RA), B = J(RB), wd = J(WD);
const cylWin = new Map(wd.filter((g) => g.key === "cyl").map((g) => [g.ekey, g]));
const topOf = (R) => Object.entries(R.rows).filter(([, r]) => r.st === "top").sort((a, b) => a[1].ti - b[1].ti).map(([k]) => k);
const G = new Map();
let short = [];
for (const k of Object.keys(A)) {
  const ta = topOf(A[k]), tb = topOf(B[k]), sb = new Set(tb);
  if (tb.length < ta.length) short.push(`${k} ${ta.length}→${tb.length}`);
  for (const r of ta.filter((q) => !sb.has(q))) {
    const x = A[k].rows[r], y = B[k].rows[r];
    if (!(y?.st === "dropped" && (y.ruled || []).includes("cyl"))) continue;
    const h = A[k].hints, req = `${h.cylExact ? "đúng" : "≥"} ${h.minCyl}`;
    const g = G.get(x.eng) || { make: x.make, rows: 0, runs: new Set(), reqs: new Set(), sups: new Set() };
    g.rows++; g.runs.add(k); g.reqs.add(req); g.sups.add(r.split("|")[0]);
    G.set(x.eng, g);
  }
}
console.log("| Động cơ | Hãng | Xi lanh số đông | Phiếu NCC | Nguồn ghi khác | HSMT đòi | Dòng ra | Lượt |\n|---|---|---|---|---|---|---|---|");
for (const [e, g] of [...G].sort((a, b) => b[1].rows - a[1].rows)) {
  const w = cylWin.get(e);
  console.log(`| ${e} | ${g.make} | ${w?.win ?? "?"} | ${w ? Object.entries(w.votes).map(([v, c]) => `${v} × ${c}`).join(", ") : "?"} | ${w ? [...new Set(w.odd.map((o) => `${o.sid} «${o.value}»`))].join("; ") : "?"} | ${[...g.reqs].join(", ")} | ${g.rows} | ${g.runs.size} |`);
}
console.log(`\nLượt có top ngắn lại ở nhánh (không đủ dòng lấp): ${short.length}\n${short.join("\n")}`);
