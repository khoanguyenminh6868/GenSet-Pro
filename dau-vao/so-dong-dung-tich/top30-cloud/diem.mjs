// node diem.mjs: (1) 36 lần chênh giữa đếm đa tập (14.609) và đếm tập (14.573) khoá rời `all`; (2) mọi khoá còn trong `all`
// mà điểm đổi giữa main và nhánh (cloud), theo lượt, động cơ, độ chênh; câu HSMT có nêu model động cơ không (lượt chạy lại).
import fs from "node:fs";
const J = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), "utf8"));
const g = J("./gop-goc.json"), n = J("./gop-nhanh.json"), r = J("./do-r-nhanh.json"), ids = J("./runs-doi.json").ids;
const L = [];
// 1
let extra = 0; const ex = [];
for (const k of ids) {
  const ca = new Map(), cb = new Map();
  for (const [q] of g[k].all) ca.set(q, (ca.get(q) || 0) + 1);
  for (const [q] of n[k].all) cb.set(q, (cb.get(q) || 0) + 1);
  for (const [q, c] of ca) { const out = c - (cb.get(q) || 0); if (out > 0 && cb.has(q)) { extra += out; ex.push(`${k}\t${q.slice(0, 90)}\tmain ${c} lần, nhánh ${cb.get(q)} lần`); } else if (out > 1) { extra += out - 1; ex.push(`${k}\t${q.slice(0, 90)}\tmain ${c} lần, nhánh 0 (trùng khoá trong lượt)`); } }
}
L.push(`1. Chênh đa tập − tập: ${extra} lần`, ...ex.map((x) => "  " + x));
// 2
const byRun = new Map();
for (const k of Object.keys(g)) {
  const sb = new Map(); for (const [q, s] of n[k].all) (sb.get(q) || sb.set(q, []).get(q)).push(s);
  const sa = new Map(); for (const [q, s] of g[k].all) (sa.get(q) || sa.set(q, []).get(q)).push(s);
  for (const [q, A] of sa) { const Bs = sb.get(q); if (!Bs) continue; const a = [...A].sort((x, y) => x - y).join(","), b = [...Bs].sort((x, y) => x - y).join(","); if (a !== b) { const o = byRun.get(k) || []; o.push([q, A, Bs]); byRun.set(k, o); } }
}
let tot = 0;
for (const [k, rows] of byRun) {
  tot += rows.length;
  const d = new Map(); for (const [q, A, Bs] of rows) { const key = `${q.split("|")[1]} ${Bs[0] - A[0]}`; d.set(key, (d.get(key) || 0) + 1); }
  L.push(`\n2. ${k}: ${rows.length} dòng đổi điểm; hints ${JSON.stringify(r[k]?.hints)}; theo động cơ, chênh: ${[...d].map(([x, c]) => `${x} ×${c}`).join(", ")}`);
  L.push(`  HSMT dung tích: ${(r[k]?.dispText || []).join(" ‖ ")}`);
  for (const [q, A, Bs] of rows) L.push(`  ${q.slice(0, 80)}\t${A.join(",")} → ${Bs.join(",")}`);
  const ta = g[k].top, tb = n[k].top;
  L.push(`  top main: ${ta.length} dòng, nhánh: ${tb.length} dòng; top giống hệt: ${ta.join("\n") === tb.join("\n")}; dòng đổi điểm ở top main ${rows.filter(([q]) => ta.includes(q)).length}, ở top nhánh ${rows.filter(([q]) => tb.includes(q)).length}`);
}
L.splice(L.findIndex((x) => x.startsWith("\n2.")), 0, `\n2. Tổng dòng đổi điểm (khoá còn trong all): ${tot} ở ${byRun.size} lượt`);
fs.writeFileSync(new URL("./diem.txt", import.meta.url), L.join("\n"));
console.log(L.filter((x) => !x.startsWith("  ") || x.startsWith("  top") || x.startsWith("  HSMT")).join("\n"));
