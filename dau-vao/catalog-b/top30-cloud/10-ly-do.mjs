// node 10-ly-do.mjs <gop-goc.json> <gop-nhanh.json> <ct-goc.json> <ct-nhanh.json> > ly-do.txt
// catalog-b: (1) lần chạy lại trên máy (luot-chi-tiet.mjs, cùng mã, bidhist chụp trên máy) có khớp cloud không (all / top / số
// dropped, sau chuẩn hoá khoá); (2) MỌI khoá (đã chuẩn hoá) rời / vào `all` và đổi điểm, mỗi dòng-lượt một lý do lấy từ `dropped`
// (luật candidates) của bên kia, hoặc "bản ghi không còn / mới".
import fs from "node:fs";
const [GB, GH, CB, CH] = process.argv.slice(2);
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const gb = J(GB), gh = J(GH), cb = J(CB), ch = J(CH);
const cm = (k) => String(k).replace(/[–—]/g, "").replace(/[*†‡^×★]+$/, "");
const cl = (k) => String(k).replace(/[–—]/g, "").replace(/[*†‡^×]+$/, "");
const split = (s, n) => { const out = []; let i = 0; for (let j = 0; j < n - 1; j++) { const k = s.indexOf("|", i); out.push(s.slice(i, k)); i = k + 1; } out.push(s.slice(i)); return out; };
const c4 = (k) => { const p = split(String(k), 4); return [p[0], cm(p[1]), cm(p[2]), cl(p[3])].join("|"); };
const c3 = (k) => { const p = split(String(k), 3); return [p[0], cm(p[1]), cl(p[2])].join("|"); };
const drop3 = (k4) => { const p = split(k4, 4); return [p[0], p[1], p[3]].join("|"); };
const msAll = (all) => JSON.stringify(all.map(([k, s]) => [c4(k), s]).sort());
let ok = 0, lech = [];
for (const id of Object.keys(cb)) {
  const same = (g, c) => g && msAll(g.all) === msAll(c.all) && JSON.stringify(g.top.map(c4)) === JSON.stringify(c.top.map(c4)) && g.dropped === c.dropped.length;
  if (same(gb[id], cb[id]) && same(gh[id], ch[id])) ok++; else lech.push(id);
}
console.log(`Lần chạy lại trên máy khớp cloud: ${ok}/${Object.keys(cb).length} lượt; lệch: ${lech.length} ${lech.slice(0, 20).join(" ")}`);
const cls = new Map(); // "rời|vào|điểm" + lý do → { keys: Set, n }
const add = (kind, why, key) => { const k = `${kind}\t${why}`; if (!cls.has(k)) cls.set(k, { keys: new Map(), n: 0 }); const c = cls.get(k); c.n++; c.keys.set(key, (c.keys.get(key) || 0) + 1); };
for (const id of Object.keys(cb)) {
  const b = cb[id], h = ch[id];
  const ab = new Map(b.all.map(([k, s]) => [c4(k), s])), ah = new Map(h.all.map(([k, s]) => [c4(k), s]));
  const db = new Map(), dh = new Map();
  for (const [k, w] of b.dropped) db.set(c3(k), w);
  for (const [k, w] of h.dropped) dh.set(c3(k), w);
  for (const [k] of ab) if (!ah.has(k)) {
    const w = dh.get(drop3(k));
    add("RỜI all", w != null ? `nhánh loại: ${w || "(không ghi)"}` : "bản ghi / dòng không còn ở nhánh", split(k, 4).slice(0, 3).join("|"));
  }
  for (const [k] of ah) if (!ab.has(k)) {
    const w = db.get(drop3(k));
    add("VÀO all", w != null ? `gốc loại: ${w || "(không ghi)"}` : "bản ghi / dòng mới ở nhánh", split(k, 4).slice(0, 3).join("|"));
  }
  for (const [k, s] of ab) if (ah.has(k) && ah.get(k) !== s) add("ĐIỂM", `${ah.get(k) - s > 0 ? "+" : ""}${ah.get(k) - s}`, split(k, 4).slice(0, 3).join("|"));
}
for (const [k, v] of [...cls].sort()) {
  console.log(`\n${k}\t${v.n} dòng-lượt, ${v.keys.size} khoá`);
  for (const [kk, n] of [...v.keys].sort((a, b) => b[1] - a[1])) console.log(`   ${n}\t${kk}`);
}
