// node so-khoa.mjs <gốc> <nhánh> <out.tsv>: so MỌI khoá động cơ / đầu phát / BĐK của build() hai bản (mỗi bản một tiến trình con).
// Dòng được so theo NCC + n + chữ dòng. Đạt khi: khoá mất đúng là khoá ngoặc đã liệt kê, dòng của nó nằm trọn ở khoá trơn, 0 dòng mất.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";

const SELF = fileURLToPath(import.meta.url);
if (process.argv[2] === "--dump") {
  const root = path.resolve(process.argv[3]);
  await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
  const dir = path.join(root, "suppliers", "cn");
  const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const cat = globalThis.GenbidCatalog.build(S);
  const pack = (l) => Object.fromEntries(l.map((e) => [e.key, { make: e.make || "", rows: (e.uses || []).map((u) => `${u.supplierId}|${u.n}|${u.line || u.genset || ""}`).sort() }]));
  fs.writeFileSync(process.argv[4], JSON.stringify({ engines: pack(cat.engines), alternators: pack(cat.alternators), controllers: (cat.controllers || []).length }));
  process.exit(0);
}
const [a, b, out] = process.argv.slice(2), tmp = (x) => `${out}.${x}.json`;
for (const [r, x] of [[a, "a"], [b, "b"]]) execFileSync(process.execPath, ["--max-old-space-size=3000", SELF, "--dump", r, tmp(x)], { stdio: "inherit" });
const A = JSON.parse(fs.readFileSync(tmp("a"))), B = JSON.parse(fs.readFileSync(tmp("b")));
const lines = [["loai", "khoa", "dong_truoc", "dong_sau", "hang_truoc", "hang_sau"].join("\t")];
const gone = [], added = [], moreRows = [], lessRows = [], make = [];
for (const k of Object.keys(A.engines)) { if (!B.engines[k]) gone.push(k); }
for (const k of Object.keys(B.engines)) { if (!A.engines[k]) added.push(k); }
for (const k of Object.keys(A.engines)) {
  const x = A.engines[k], y = B.engines[k];
  if (!y) { lines.push(["mat", k, x.rows.length, 0, x.make, ""].join("\t")); continue; }
  if (y.rows.length > x.rows.length) moreRows.push(k);
  if (y.rows.length < x.rows.length) lessRows.push(k);
  if (x.make !== y.make) make.push(`${k}: ${x.make} → ${y.make}`);
  if (y.rows.length !== x.rows.length || x.make !== y.make) lines.push(["doi", k, x.rows.length, y.rows.length, x.make, y.make].join("\t"));
}
const rowsOf = (P) => Object.values(P.engines).flatMap((e) => e.rows);
const count = (l) => l.reduce((m, r) => m.set(r, (m.get(r) || 0) + 1), new Map());
const ca = count(rowsOf(A)), cb = count(rowsOf(B));
const lost = [...ca].filter(([r, n]) => (cb.get(r) || 0) < n).length, extra = [...cb].filter(([r, n]) => (ca.get(r) || 0) < n).length;
const notHome = gone.filter((k) => { const base = k.replace(/\([^)]*\)/g, ""); return !B.engines[base] || !A.engines[k].rows.every((r) => B.engines[base].rows.includes(r)); });
fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
fs.rmSync(tmp("a")); fs.rmSync(tmp("b"));
console.log(JSON.stringify({ engines: [Object.keys(A.engines).length, Object.keys(B.engines).length], mat: gone.length, moi: added, themDong: moreRows.length, botDong: lessRows, doiHang: make, dongMat: lost, dongThem: extra, khoaMatKhongVeGoc: notHome, dauPhatGiongHet: JSON.stringify(A.alternators) === JSON.stringify(B.alternators), bdk: [A.controllers, B.controllers] }));
