// So hai bản chụp của chup-catalog.mjs: mọi khoá thêm / mất / đổi ở controllers, engines, alternators, facts.
// node so-catalog.mjs <truoc.json> <sau.json>
import fs from "node:fs";
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
let diff = 0;
for (const sec of ["controllers", "engines", "alternators", "facts"]) {
  const A = a[sec], B = b[sec], keys = new Set([...Object.keys(A), ...Object.keys(B)]);
  const add = [], del = [], chg = [];
  for (const k of keys) {
    if (!(k in A)) add.push(k); else if (!(k in B)) del.push(k);
    else if (JSON.stringify(A[k]) !== JSON.stringify(B[k])) chg.push(k);
  }
  diff += add.length + del.length + chg.length;
  console.log(`# ${sec}: ${Object.keys(A).length} → ${Object.keys(B).length}; thêm ${add.length}, mất ${del.length}, đổi ${chg.length}`);
  for (const k of [...add, ...del, ...chg].slice(0, 30)) {
    const x = A[k], y = B[k];
    const extra = Array.isArray(y) && Array.isArray(x) ? ` (+${y.filter((v) => !x.includes(v)).length} / -${x.filter((v) => !y.includes(v)).length}: ${y.filter((v) => !x.includes(v)).slice(0, 3).join(" ; ").slice(0, 300)})` : "";
    console.log(`  ${!(k in A) ? "+" : !(k in B) ? "-" : "~"} ${k}${extra}`);
  }
}
console.log(diff ? `KHÁC: ${diff} khoá` : "GIỐNG HỆT");
