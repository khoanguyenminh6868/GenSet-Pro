// node pdfSus.cjs <repo>: bản ghi nguồn 5001–5999 (catalog PDF) có công suất trái quan hệ số (hệ số ≠ 0,8, prime ≥ standby,
// standby / prime ngoài 1,05–1,2) → danh sách phải đối chiếu với trang PDF.
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const { C, S } = load(process.argv[2]);
let n = 0, all = 0;
for (const s of S) for (const o of C.fromSupplier(s)) {
  if (!(o.n >= 5001 && o.n < 6000) || o.row == null || o.kind !== "engine") continue;
  all++;
  const p = o.power || {}, why = [];
  for (const k of ["prime", "standby", "rated"]) { const x = p[k]; if (x && x.kVA && x.kW) { const f = x.kW / x.kVA; if (Math.abs(x.kW - 0.8 * x.kVA) > Math.max(1.01, 0.03 * x.kVA) && Math.abs(f - 1) > 0.005) why.push(`${k} pf ${f.toFixed(2)}`); } }
  for (const u of ["kVA", "kW"]) { const a = p.prime && p.prime[u], b = p.standby && p.standby[u]; if (a && b) { const r = b / a; if (r <= 1) why.push(`prime ≥ standby (${u})`); else if ((r < 1.04 && b - a > 2) || (r > 1.26 && b - a > 3)) why.push(`standby/prime ${r.toFixed(2)} (${u})`); } }
  if (!o.power) why.push("không đọc được công suất");
  if (!why.length) continue;
  n++;
  const t = s.specTables[o.table];
  console.log(`[${s.id} | ${t.title}] dòng ${o.row}: ${o.line}\n     → ${JSON.stringify(o.power)} | ${why.join("; ")}`);
}
console.log(`\n${n} / ${all} bản ghi nguồn catalog PDF cần đối chiếu`);
