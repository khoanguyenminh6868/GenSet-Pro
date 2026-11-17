const fs = require("fs");
const J = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const vnd = (n) => (n == null ? "null" : Math.round(n).toLocaleString("en-US"));
const near = (a, b) => b && Math.abs(a / b - 1) <= 0.005;
const res = { ok: [], total: [], dupHalf: [], cap100: [], vat: [], other: [] };
let bothNull = 0, onlyFinal = 0, crossLot = [];
for (const [id, { d }] of Object.entries(J)) {
  for (const l of d.lots || []) {
    for (const b of l.bidders || []) { if (!(b.bidPrice > 0)) { if (b.finalPrice > 0) onlyFinal++; else bothNull++; } }
    // giá sau giảm của nhà thầu trúng trùng với giá của chính họ ở lô khác
    for (const b of l.bidders || []) if (b.bidPrice > 0 && b.finalPrice > 0 && !near(b.finalPrice, b.bidPrice) && !b.discount) { const o = (d.lots || []).find((x) => x !== l && (x.bidders || []).some((y) => y.taxCode === b.taxCode && near(y.bidPrice, b.finalPrice))); if (o) crossLot.push(`${id} ${l.lotNo} ${b.taxCode}: dự thầu ${vnd(b.bidPrice)}, "sau giảm" ${vnd(b.finalPrice)} = giá của lô ${o.lotNo}`); }
    const g = l.goods || [], w = (l.bidders || []).find((b) => b.won); const ref = w && (w.winPrice || w.finalPrice);
    if (!g.length || !ref || g.some((x) => !(x.qty > 0) || !(x.unitPrice > 0))) continue;
    const sum = g.reduce((a, x) => a + x.qty * x.unitPrice, 0), sumU = g.reduce((a, x) => a + x.unitPrice, 0);
    const uniq = new Map(); for (const x of g) uniq.set([x.name, x.code, x.qty, x.unit, x.unitPrice, x.maker, x.desc].join("|"), x); const sumD = [...uniq.values()].reduce((a, x) => a + x.qty * x.unitPrice, 0);
    const tag = `${id} (${g.length} dòng, Σ/trúng ${(sum / ref).toFixed(2)})`;
    if (near(sum, ref)) res.ok.push(tag);
    else if (near(sumU, ref) && g.some((x) => x.qty > 1)) res.total.push(tag);
    else if (uniq.size < g.length && near(sumD, ref)) res.dupHalf.push(tag);
    else if (g.length === 100) res.cap100.push(tag);
    else if (sum / ref > 0.86 && sum / ref < 0.94) res.vat.push(tag);
    else res.other.push(tag);
  }
}
console.log("nhà thầu không có giá dự thầu: có giá sau giảm", onlyFinal, "| không có cả hai", bothNull);
console.log("giá 'sau giảm' lấy từ lô khác:", crossLot.length); console.log(crossLot.slice(0, 10).join("\n"));
for (const [k, v] of Object.entries(res)) console.log(`\n${k}: ${v.length}${k === "ok" ? "" : "\n  " + v.slice(0, 40).join("\n  ")}`);
