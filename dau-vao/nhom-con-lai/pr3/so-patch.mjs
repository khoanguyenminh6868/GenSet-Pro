// Chứng minh một PR sau khi gộp main đổi bản ghi Y HỆT bản đã đo: với mọi NCC, phần (mất, thêm) của fromSupplier + gensetsOf
// giữa [gốc1 → nhánh1] (bản đã đo) bằng phần đó giữa [gốc2 → nhánh2] (main mới → nhánh đã gộp). NCC có tệp cn khác giữa hai cặp
// được so trên dữ liệu RIÊNG của từng cặp (vẫn phải cùng mất / thêm).
// node so-patch.mjs <gốc1 catalog.js> <nhánh1 catalog.js> <cn1> <gốc2 catalog.js> <nhánh2 catalog.js> <cn2>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [G1, B1, CN1, G2, B2, CN2] = process.argv.slice(2);
const load = (f) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(f, "utf8"), box); return box.GenbidCatalog; };
const [g1, b1, g2, b2] = [G1, B1, G2, B2].map(load);
const recs = (C, s) => ["fromSupplier", "gensetsOf"].flatMap((fn) => C[fn](JSON.parse(JSON.stringify(s))).map((o) => fn + " " + JSON.stringify(o)));
const delta = (A, B) => { const m = new Map(); for (const x of A) m.set(x, (m.get(x) || 0) - 1); for (const x of B) m.set(x, (m.get(x) || 0) + 1); return [...m].filter(([, n]) => n).map(([x, n]) => `${n > 0 ? "+" : "-"}${Math.abs(n)} ${x}`).sort().join("\n"); };
const files = [...new Set([...fs.readdirSync(CN1), ...fs.readdirSync(CN2)])].filter((f) => f.endsWith(".json")).sort();
let same = 0, diff = 0, changed1 = 0, cnDiff = 0;
for (const f of files) {
  const p1 = path.join(CN1, f), p2 = path.join(CN2, f);
  if (!fs.existsSync(p1) || !fs.existsSync(p2)) { console.log("chỉ có ở một bên:", f); continue; }
  const t1 = fs.readFileSync(p1, "utf8"), t2 = fs.readFileSync(p2, "utf8");
  if (t1 !== t2) cnDiff++;
  const s1 = JSON.parse(t1), s2 = JSON.parse(t2);
  const d1 = delta(recs(g1, s1), recs(b1, s1)), d2 = delta(recs(g2, s2), recs(b2, s2));
  if (d1) changed1++;
  if (d1 === d2) same++; else { diff++; console.log("KHÁC", f, `(cn ${t1 === t2 ? "giống" : "khác"})`, d1.split("\n").length, "↔", d2.split("\n").length); }
}
console.log(`NCC ${files.length}; cn khác giữa hai cặp ${cnDiff}; NCC bản đã đo có đổi ${changed1}; phần đổi giống ${same}; khác ${diff}`);
