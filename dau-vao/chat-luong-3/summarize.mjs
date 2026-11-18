// Tóm report.json + ex-*.json của guess-measure.mjs: mỗi đường một khối (đi qua bao nhiêu, mất gì, phán xét, NCC nhiều nhất, ví dụ).
//   node summarize.mjs out [số ví dụ mỗi nhóm]
import fs from "node:fs";
import path from "node:path";
const OUT = process.argv[2], K = +(process.argv[3] || 2);
const R = JSON.parse(fs.readFileSync(path.join(OUT, "report.json"), "utf8"));
const lines = [`Tổng: ${R.totals.records} bản ghi, ${R.totals.tables} bảng, ${R.totals.sups} NCC`];
for (const [P, r] of Object.entries(R.paths)) {
  lines.push(`\n## ${P}: ${r.desc}`);
  lines.push(`đi qua: ${r.through.records} bản ghi (${r.through.specs} thông số theo vị trí), ${r.through.tables} bảng, ${r.through.sups} NCC; nhiều nhất ${r.through.topSups.slice(0, 8).map(([s, n]) => `${s} ${n}`).join(", ")}`);
  lines.push(`tắt: bản ghi đổi ${r.diff.changed}, mất ${r.diff.onlyA}, thêm ${r.diff.onlyB}; ${r.diff.tables} bảng, ${r.diff.sups} NCC; đảo vai còn ${r.swaps}`);
  lines.push(`dạng: ${JSON.stringify(r.diff.kinds)}`);
  const v = Object.entries(r.verdict).sort();
  for (const [k, n] of v) lines.push(`   ${String(n).padStart(6)}  ${k}`);
  lines.push(`NCC: ${r.bySup.slice(0, 10).map(([s, x]) => `${s} ${Object.values(x).reduce((a, b) => a + b, 0)}`).join(", ")}`);
  const ex = JSON.parse(fs.readFileSync(path.join(OUT, `ex-${P}.json`), "utf8"));
  for (const [k, list] of Object.entries(ex)) {
    if (!/mâu thuẫn|vô lý|xác nhận|hợp lý/.test(k)) continue;
    // ví dụ từ các NCC khác nhau
    const seen = new Set(), pick = [];
    for (const e of list) { if (seen.has(e.sup)) continue; seen.add(e.sup); pick.push(e); if (pick.length >= K) break; }
    for (const e of pick) lines.push(`   [${k}] ${e.sup} n${e.n} b${e.table} dòng ${e.row ?? "L"} ${e.kind} ${e.model} | ${e.val} | ${e.change}\n        H: ${(e.header[0] || "").slice(0, 160)}\n        R: ${e.line.slice(0, 200)}`);
  }
}
console.log(lines.join("\n"));
