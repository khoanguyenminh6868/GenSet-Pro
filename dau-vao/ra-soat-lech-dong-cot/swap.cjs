// node swap.cjs <repo> [id NCC]: bản ghi nghi ĐẢO động cơ ↔ đầu phát: mã mà ≥ 3 NCC KHÁC đọc ở vai kia và không NCC khác nào đọc ở vai này.
// In đếm theo NCC + mỗi (NCC, bảng) một mẫu (tiêu đề + dòng). Có id thì in mọi dòng của NCC đó.
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [repo, only] = process.argv.slice(2);
const { C, S } = load(repo);
const key = (m) => String(m || "").toUpperCase().replace(/[\s._/-]+/g, "");
const recs = [], by = new Map();
for (const s of S) { if (s.status === "incomplete") continue; for (const o of C.fromSupplier(s)) { recs.push(o); const k = key(o.model); if (!by.has(k)) by.set(k, { engine: new Set(), alternator: new Set() }); by.get(k)[o.kind]?.add(o.supplierId); } }
const cnt = {}, shown = new Set(); let n = 0;
for (const o of recs) {
  const v = by.get(key(o.model)), other = o.kind === "engine" ? "alternator" : "engine";
  const oth = [...v[other]].filter((x) => x !== o.supplierId).length, same = [...v[o.kind]].filter((x) => x !== o.supplierId).length;
  if (oth < 3 || same > 0) continue;
  n++; const ck = `${o.supplierId} ${o.kind}←${other}`; cnt[ck] = (cnt[ck] || 0) + 1;
  const tk = o.supplierId + "|" + o.n + "|" + o.table;
  if (only ? o.supplierId === only : !shown.has(o.supplierId + o.kind) && shown.size < 40) {
    if (!only) shown.add(o.supplierId + o.kind);
    console.log(`[${o.supplierId} n${o.n} b${o.table} dòng ${o.row ?? "L"}] đọc ${o.kind}=${o.model} (other=${o.other}) | ${other} ở ${oth} NCC khác`);
    for (const h of (o.header || o.lines?.header || []).slice(0, 2)) console.log("    H: " + String(h).slice(0, 260));
    console.log("    R: " + String(o.line || (o.lines?.rows || []).filter((r) => r.includes(o.model)).slice(0, 3).join("  ¦  ")).slice(0, 300));
  }
}
console.log("\n" + Object.entries(cnt).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}  ${k}`).join("\n"));
console.log("tổng:", n);
