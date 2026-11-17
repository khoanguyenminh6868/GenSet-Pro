// node view.cjs <tiền tố mã, phân cách bằng dấu phẩy> [số NCC mỗi mã] [số mẫu mỗi NCC] [id NCC]
const F = require("./audA.json");
const [codes, nSup = 5, nEach = 1, only] = process.argv.slice(2);
for (const c of codes.split(",")) {
  const list = F.filter((f) => f.code.startsWith(c) && (!only || f.sup === only));
  const bySup = new Map(); for (const f of list) { if (!bySup.has(f.sup)) bySup.set(f.sup, []); bySup.get(f.sup).push(f); }
  console.log(`\n================ ${list[0]?.code} (${list.length})`);
  for (const [sup, l] of [...bySup].sort((a, b) => b[1].length - a[1].length).slice(0, +nSup)) {
    for (const f of l.filter((_, i) => i % Math.max(1, Math.floor(l.length / nEach)) === 0).slice(0, +nEach)) {
      console.log(`\n[${sup} ×${l.length}] n${f.n} bảng ${f.table} dòng ${f.row} | ${f.kind} ${f.model} | tổ máy ${f.genset} | ${f.width}`);
      console.log("  →", f.detail);
      for (const h of f.header.slice(0, 3)) console.log("  H:", h.slice(0, 330));
      if (f.line) console.log("  R:", f.line.slice(0, 330)); else { console.log("  T:", f.title); for (const r of f.near || []) console.log("  L:", r); }
    }
  }
}
