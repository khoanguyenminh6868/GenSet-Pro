// suppliers.json của prep gốc ↔ nhánh: bản ghi nào khác, khác ở khoá nào.
// node so-suppliers.mjs <a/suppliers.json> <b/suppliers.json>
import fs from "node:fs";
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const list = (x) => (Array.isArray(x) ? x : Object.values(x)).map((r) => r.data || r);
const A = new Map(list(a).map((r) => [r.id, r])), B = new Map(list(b).map((r) => [r.id, r]));
console.log("bản ghi", A.size, "→", B.size);
for (const id of new Set([...A.keys(), ...B.keys()])) {
  const x = A.get(id), y = B.get(id);
  if (JSON.stringify(x) === JSON.stringify(y)) continue;
  const keys = Object.keys({ ...x, ...y }).filter((k) => JSON.stringify(x?.[k]) !== JSON.stringify(y?.[k]));
  const tn = (r) => (r?.specTables || []).map((t) => t.n);
  console.log(id, "khoá khác:", keys.join(","), "| bảng thêm:", tn(y).filter((n) => !tn(x).includes(n)).join(","), "| bảng mất:", tn(x).filter((n) => !tn(y).includes(n)).join(","));
}
