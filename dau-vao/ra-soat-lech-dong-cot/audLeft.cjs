// node audLeft.cjs <audB.json> <tiền tố mã...>: in các bản ghi còn lại của loại lỗi (một dòng mỗi bảng)
const B = require(require("path").resolve(process.argv[2])), want = process.argv.slice(3);
for (const [k, l] of Object.entries(B)) {
  if (!want.some((w) => k.startsWith(w))) continue;
  console.log(`\n### ${k}: ${l.length}`);
  const seen = new Set();
  for (const f of l) { const t = f.sup + " n" + f.n; if (seen.has(t)) continue; seen.add(t); console.log(`[${t}] ${f.detail}`); for (const h of (f.header || []).slice(0, 3)) console.log("   H:", String(h).slice(0, 260)); console.log("   R:", String(f.line).slice(0, 200)); }
}
