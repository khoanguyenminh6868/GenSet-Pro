// node tom-tat.mjs hien-trang.json  → in số đếm theo hãng
import fs from "node:fs";
const j = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
for (const [id, o] of Object.entries(j.makers)) {
  const ms = Object.entries(o.models);
  console.log(`\n=== ${id}: ${o.sheets} tờ, ${ms.length} model đọc ra dòng, ${o.noRows.length} tờ không ra dòng`);
  const vc = {};
  let anyKva = 0, anyKw = 0, anyEff = 0;
  for (const [m, mm] of ms) {
    const vs = Object.entries(mm.volts);
    for (const [k, v] of vs) { const e = (vc[k] ||= { kVA: 0, kW: 0, eff: 0 }); if (v.kVA) e.kVA++; if (v.kW) e.kW++; if (v.eff) e.eff++; }
    if (vs.some(([, v]) => v.kVA)) anyKva++; if (vs.some(([, v]) => v.kW)) anyKw++; if (vs.some(([, v]) => v.eff)) anyEff++;
  }
  console.log(`model có kVA: ${anyKva}, kW: ${anyKw}, hiệu suất: ${anyEff}`);
  console.log("theo hz/pha/điện áp (số model có kVA / kW / eff):");
  for (const [k, e] of Object.entries(vc).sort()) console.log(`  ${k}: ${e.kVA} / ${e.kW} / ${e.eff}`);
  const col = { duty: {}, rise: {}, hz: {}, phase: {}, conn: {} };
  for (const [, mm] of ms) for (const c of Object.keys(col)) for (const v of mm.cols[c]) col[c][v] = (col[c][v] || 0) + 1;
  console.log("cột (số model):", JSON.stringify(col));
  console.log("tờ không ra dòng:", o.noRows.map((x) => `${x.f}[${x.title.slice(0, 40)}|${x.chars}]`).join("; "));
  console.log("thuộc tính code đọc (số tờ):", Object.entries(o.attrKeys).map(([k, v]) => `${k}=${new Set(v).size}`).join(", "));
  console.log("tờ có dòng (regex) / mẫu:");
  for (const [k, v] of Object.entries(o.field)) console.log(`  ${k}: ${v.length}/${o.sheets}  ${o.fieldSample[k] ? `[${o.fieldSample[k].f}] ${o.fieldSample[k].line}` : ""}`);
}
const MK = /stamford|leroy|mecc|marathon|avk|newage/i;
const c = j.catalog.rows.filter((r) => MK.test(r.make));
const byMake = {};
for (const r of c) { const e = (byMake[r.make] ||= { models: 0, sheetRows: 0, attrOnly: 0, makerSup: 0, none: 0 }); e.models++; if (r.ratingRows) e.sheetRows++; else if (r.attrKeys.length) e.attrOnly++; if (r.makerSup.length) e.makerSup++; if (!r.ratingRows && !r.attrKeys.length && !r.makerSup.length) e.none++; }
console.log("\ncatalog theo make:", JSON.stringify(byMake, null, 1));
