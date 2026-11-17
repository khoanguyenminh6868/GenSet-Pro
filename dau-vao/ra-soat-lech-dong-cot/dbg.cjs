// node dbg.cjs <repo> <supplierId> <chuỗi trong dòng> [số bản ghi]: in toàn bộ tiêu đề + dòng + công suất đọc được
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [repo, sup, needle, max = 2] = process.argv.slice(2);
const { C, S } = load(repo);
let n = 0;
for (const s of S) {
  if (s.id !== sup) continue;
  for (const o of C.fromSupplier(s)) {
    if (o.row == null || !String(o.line).includes(needle)) continue;
    console.log(`\n[n${o.n} bảng ${o.table} dòng ${o.row}] ${o.kind} ${o.model} | genset ${o.genset}`);
    for (const h of o.header || []) console.log("  H:", String(h).slice(0, 400));
    console.log("  R:", String(o.line).slice(0, 300));
    console.log("  →", JSON.stringify(o.power));
    if (++n >= +max) return;
  }
}
