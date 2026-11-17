const fs = require("fs");
const J = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const H = require("./audH.json");
const vnd = (n) => (n == null ? "null" : Math.round(n).toLocaleString("en-US"));
const ids = (c) => [...new Set((H[Object.keys(H).find((k) => k.startsWith(c))] || []).map((x) => x.id))];
// 1. nhà thầu lặp trong một lô; H9 phân loại
let dupB = 0, dupBLots = [], h9 = { dup: 0, venture: 0, other: 0 }, exH9 = [];
for (const [id, { d }] of Object.entries(J)) for (const l of d.lots || []) {
  const seen = new Map(); for (const b of l.bidders || []) { const k = (b.taxCode || b.name) + "|" + (b.venture || ""); seen.set(k, (seen.get(k) || 0) + 1); }
  const dup = [...seen].filter((x) => x[1] > 1);
  if (dup.length) { dupB += dup.reduce((n, x) => n + x[1] - 1, 0); dupBLots.push(`${id} ${dup.map((x) => x.join("×")).join(", ")}`); }
  if ((d.lots || []).length === 1 && d.numBidderJoin != null && (l.bidders || []).length && d.numBidderJoin !== l.bidders.length) {
    const v = l.bidders.filter((b) => b.venture).length, tax = new Set(l.bidders.map((b) => b.taxCode)).size;
    if (tax < l.bidders.length) h9.dup++; else if (v) h9.venture++; else { h9.other++; if (exH9.length < 6) exH9.push(`${id}: tham dự ${d.numBidderJoin}, dòng ${l.bidders.length}: ${l.bidders.map((b) => `${b.taxCode}${b.won ? "*" : ""}${b.bidPrice ? "" : "(không giá)"}`).join(" ")}`); }
  }
}
console.log("nhà thầu lặp trong lô:", dupB, "dòng ở", dupBLots.length, "lô"); console.log(dupBLots.slice(0, 8).join("\n"));
console.log("H9 phân loại:", JSON.stringify(h9)); console.log(exH9.join("\n"));
// 2. không có giá dự thầu: trúng hay trượt, lý do
const na = { won: 0, lost: 0, reasons: new Map() };
for (const { d } of Object.values(J)) for (const l of d.lots || []) for (const b of l.bidders || []) if (!(b.bidPrice > 0)) { b.won ? na.won++ : na.lost++; const r = String(b.reason || "(trống)").slice(0, 40); na.reasons.set(r, (na.reasons.get(r) || 0) + 1); }
console.log("\nkhông giá dự thầu: trúng", na.won, "trượt", na.lost, [...na.reasons].sort((a, b) => b[1] - a[1]).slice(0, 6));
const naWon = []; for (const [id, { d }] of Object.entries(J)) for (const l of d.lots || []) for (const b of l.bidders || []) if (!(b.bidPrice > 0) && b.won) naWon.push(`${id} ${b.taxCode} winPrice ${vnd(b.winPrice)} final ${vnd(b.finalPrice)} venture "${b.venture}"`);
console.log(naWon.slice(0, 8).join("\n"));
// 3. hàng hoá: lô đúng 100 dòng (bị cắt?), dòng lặp y hệt
let cap = [], dupG = 0, dupGLots = [], hist = new Map();
for (const [id, { d }] of Object.entries(J)) for (const l of d.lots || []) {
  const g = l.goods || []; const n = g.length; if (n >= 95) hist.set(n, (hist.get(n) || 0) + 1);
  if (n === 100) cap.push(id);
  const seen = new Map(); for (const x of g) { const k = [x.name, x.code, x.qty, x.unit, x.unitPrice, x.maker, x.desc].join("|"); seen.set(k, (seen.get(k) || 0) + 1); }
  const dn = [...seen.values()].filter((v) => v > 1).reduce((a, v) => a + v - 1, 0);
  if (dn) { dupG += dn; dupGLots.push(`${id}: ${dn}/${n} dòng lặp`); }
}
console.log("\nlô có ≥95 dòng hàng hoá:", [...hist].sort((a, b) => a[0] - b[0]).map((x) => x.join("→")).join(", "), "| đúng 100 dòng:", cap.length, cap.slice(0, 12).join(" "));
console.log("dòng hàng hoá lặp y hệt:", dupG, "ở", dupGLots.length, "lô:", dupGLots.slice(0, 14).join("; "));
// 4. H3c chi tiết
console.log("\n== H3c ==");
for (const id of ids("H3c")) {
  const d = J[id].d;
  for (const l of d.lots) { const w = (l.bidders || []).find((b) => b.won); if (!w || !(l.goods || []).length) continue; const g = l.goods, sum = g.reduce((a, x) => a + (x.qty || 0) * (x.unitPrice || 0), 0); const top = [...g].sort((a, b) => b.qty * b.unitPrice - a.qty * a.unitPrice)[0];
    console.log(`${id} lô ${d.lots.length} | ${g.length} dòng | Σ ${vnd(sum)} / trúng ${vnd(w.winPrice || w.finalPrice)} = ${(sum / (w.winPrice || w.finalPrice)).toFixed(2)} | lớn nhất: ${String(top.name).slice(0, 40)} SL ${top.qty} ${top.unit} × ${vnd(top.unitPrice)}`); }
}
// 5. H7a, H6b/d, H7c
console.log("\n== H7a giá trúng > giá gói ==");
for (const id of ids("H7a").slice(0, 12)) { const d = J[id].d; console.log(`${id} gói ${vnd(d.packagePrice)} dự toán ${vnd(d.estimatedPrice)} trúng ${vnd(d.winningPrice)} | lô: ${d.lots.map((l) => `${vnd(l.price)}→${vnd((l.bidders || []).find((b) => b.won)?.winPrice)}`).join("; ")} | ${d.bidForm} ${d.field}`); }
for (const id of ["IB2500312373", "IB2200019427", "IB2300029269"]) { const d = J[id].d; console.log(`\n${id} gói ${vnd(d.packagePrice)} trúng ${vnd(d.winningPrice)}`); for (const l of d.lots) for (const b of l.bidders) console.log(`   ${l.lotNo} ${b.taxCode} won ${b.won} bid ${vnd(b.bidPrice)} discount "${b.discount}" final ${vnd(b.finalPrice)} win ${vnd(b.winPrice)} venture "${b.venture}"`); }
// 6. H12: 0,5 kVA
console.log("\n== H12 ==");
const v12 = new Map(); for (const x of H[Object.keys(H).find((k) => k.startsWith("H12"))]) v12.set(x.detail, (v12.get(x.detail) || 0) + 1); console.log([...v12].sort((a, b) => b[1] - a[1]).slice(0, 12));
for (const id of ids("H12").slice(0, 4)) { const c = J[id].d.config; const t = String(c.text || ""); const i = t.search(/±|\+\/-|0[.,]5/); console.log(`${id} kvas ${JSON.stringify(c.kvas)} at ${c.at} rebuilt ${c.rebuiltAt || "-"} | …${t.slice(Math.max(0, i - 80), i + 60).replace(/\s+/g, " ")}…`); }
console.log("\n== H11 ==");
for (const x of H[Object.keys(H).find((k) => k.startsWith("H11"))]) console.log(`${x.id}: ${x.detail.slice(0, 200)}`);
