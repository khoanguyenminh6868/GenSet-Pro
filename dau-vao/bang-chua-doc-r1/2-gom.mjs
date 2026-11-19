// Gom kết quả 1-chan-doan theo nguyên nhân chính của từng bảng. node 2-gom.mjs chan-doan-goc.json [--list "<nguyên nhân>"]
import fs from "node:fs";
const [F] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(F, "utf8"));
const list = process.argv.includes("--list") ? process.argv[process.argv.indexOf("--list") + 1] : null;
// Nguyên nhân chính: chốt mức bảng nếu có (bảng nhãn), không thì lý do của nhiều dòng nhất.
export const mainOf = (x) => {
  if (x.used) return "đã đọc";
  if (x.tableReason) return x.tableReason;
  const e = Object.entries(x.rowReasons).sort((a, b) => b[1] - a[1]);
  return e.length ? e[0][0] : "không dòng nào";
};
const g = new Map();
for (const x of A) { const k = mainOf(x); if (!g.has(k)) g.set(k, []); g.get(k).push(x); }
if (list) {
  for (const x of g.get(list) || []) {
    console.log(`\n### ${x.sup} n${x.n} b${x.ti} — ${x.title.slice(0, 90)}  [tiêu đề ô: ${x.headerCells.join("/")}, dòng ô (trung vị): ${x.medRowCells}] ${JSON.stringify(x.rowReasons)}`);
    for (const h of x.header) console.log("H " + h.slice(0, 260));
    for (const r of x.rows.slice(0, 3)) console.log("  " + r.slice(0, 260));
    if (x.sample[0]) console.log("  vết: " + JSON.stringify(x.sample[0].d).slice(0, 260));
  }
} else {
  for (const [k, v] of [...g].sort((a, b) => b[1].length - a[1].length)) {
    const sups = new Map();
    for (const x of v) sups.set(x.sup, (sups.get(x.sup) || 0) + 1);
    console.log(`${String(v.length).padStart(4)} bảng ${String(sups.size).padStart(3)} NCC  ${k}  — ${[...sups].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([s, n]) => s + " " + n).join(", ")}`);
  }
}
