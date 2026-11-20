// So hai bản chụp dump-ratings: mọi tệp, mọi mục. In: tệp đổi (ngoài các mục cũ giữ y), mục cũ mất / đổi, mục mới theo model.
// node so-dump.mjs truoc.json sau.json
import fs from "node:fs";
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const key = (x) => JSON.stringify(x);
let lost = 0, same = 0, added = 0;
for (const f of new Set([...Object.keys(A), ...Object.keys(B)])) {
  const a = A[f] || { r: [], a: [], l: [] }, b = B[f] || { r: [], a: [], l: [] };
  for (const part of ["r", "a"]) {
    const bs = new Set((b[part] || []).map(key));
    for (const x of a[part] || []) { if (bs.has(key(x))) same++; else { lost++; console.log(`MẤT/ĐỔI ${f} ${part}: ${key(x)}`); } }
    const as = new Set((a[part] || []).map(key));
    const nw = (b[part] || []).filter((x) => !as.has(key(x)));
    if (nw.length) { added += nw.length; const by = new Map(); for (const x of nw) by.set(x.model || x.key, (by.get(x.model || x.key) || 0) + 1); console.log(`MỚI ${f} ${part}: ${nw.length} mục; ${[...by].map(([m, n]) => `${m}×${n}`).join(", ")}`); }
  }
  if ((b.l || []).length) console.log(`THUỘC TÍNH LS ${f}: ${(b.l || []).map((x) => `${x.key}=${JSON.stringify(x.value)}`).join("; ")}`);
}
console.log(`giữ y: ${same}, mất/đổi: ${lost}, mới: ${added}`);
