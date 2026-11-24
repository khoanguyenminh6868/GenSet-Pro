// node ngu-canh.mjs out.json ngu-canh.json  → thêm 2 dòng trước / sau trong tệp nguồn cho từng dòng (kể cả khi lặp nhiều vị trí: lấy vị trí đầu + số lần).
import fs from "node:fs";
import path from "node:path";
const SRC = "C:/Projects/GenSet Pro/GenSet-Pro/suppliers/sources";
const { rows } = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const cache = new Map();
const load = (s, n) => { const k = `${s}/${n}`; if (!cache.has(k)) { const f = path.join(SRC, s, `${n}.md`); cache.set(k, fs.existsSync(f) ? fs.readFileSync(f, "utf8").split(/\r?\n/) : null); } return cache.get(k); };
const squash = (s) => String(s).replace(/[\s|]+/g, "").toLowerCase();
for (const r of rows) {
  const L = load(r.supplier, r.n);
  if (!L) { r.ctx = null; r.hits = 0; continue; }
  const want = squash(r.line);
  const at = [];
  for (let i = 0; i < L.length; i++) if (squash(L[i]) === want || (want.length > 12 && squash(L[i]).includes(want))) at.push(i);
  // dòng cắt qua nhiều dòng nguồn: thử ghép 2-3 dòng liên tiếp
  if (!at.length) for (let i = 0; i < L.length; i++) for (const k of [2, 3]) if (squash(L.slice(i, i + k).join("")) === want) { at.push(i); break; }
  r.hits = at.length;
  r.ctx = at.length ? L.slice(Math.max(0, at[0] - 2), at[0] + 3).map((x) => x.slice(0, 220)) : null;
  r.srcLine = at.length ? at[0] + 1 : null;
}
fs.writeFileSync(process.argv[3], JSON.stringify(rows, null, 1), "utf8");
console.log("không thấy trong nguồn:", rows.filter((r) => !r.hits).length, "/", rows.length);
