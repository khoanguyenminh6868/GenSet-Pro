// So top 30 / all gốc (main) ↔ nhánh #969 sau sửa named() + OWN_BRAND_ALTS: node so-gop.mjs gop-goc.json gop-nhanh.json
// Khoá dòng bỏ trường đầu phát (đầu phát EL làm khoá đổi chứ dòng không đổi).
import fs from "node:fs";
const [FA, FB] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(FA, "utf8")), B = JSON.parse(fs.readFileSync(FB, "utf8"));
const EL = "eastern-lion-fuan";
const noAlt = (k) => { const p = k.split("|"); p[2] = ""; return p.join("|"); };
const sup = (k) => k.split("|")[0];
const ms = (arr) => { const m = new Map(); for (const x of arr) m.set(x, (m.get(x) || 0) + 1); return m; };
let runs = 0, errs = 0, sameTop = 0, elTopA = 0, elTopB = 0;
const scoreDiff = new Map(); // NCC -> số (lượt, dòng) đổi điểm
const topDiffRuns = { el: 0, other: 0 }, topOut = new Map(), topIn = new Map();
const diffList = [];
for (const id of Object.keys(A)) {
  const a = A[id], b = B[id];
  if (!b || a.error || b.error) { errs++; continue; }
  runs++;
  const sa = new Map(), sb = new Map();
  for (const [k, s] of a.all) sa.set(noAlt(k), [...(sa.get(noAlt(k)) || []), s].sort((x, y) => x - y));
  for (const [k, s] of b.all) sb.set(noAlt(k), [...(sb.get(noAlt(k)) || []), s].sort((x, y) => x - y));
  for (const k of new Set([...sa.keys(), ...sb.keys()])) {
    const x = JSON.stringify(sa.get(k) || []), y = JSON.stringify(sb.get(k) || []);
    if (x !== y) { scoreDiff.set(sup(k), (scoreDiff.get(sup(k)) || 0) + 1); diffList.push(`${id}\t${k}\t${x}\t${y}`); }
  }
  const ta = a.top.map(noAlt), tb = b.top.map(noAlt);
  elTopA += ta.filter((k) => sup(k) === EL).length; elTopB += tb.filter((k) => sup(k) === EL).length;
  const ma = ms(ta), mb = ms(tb);
  let diff = false;
  for (const k of new Set([...ma.keys(), ...mb.keys()])) {
    const d = (mb.get(k) || 0) - (ma.get(k) || 0);
    if (!d) continue;
    diff = true;
    const m = d < 0 ? topOut : topIn; m.set(sup(k), (m.get(sup(k)) || 0) + Math.abs(d));
  }
  if (!diff && JSON.stringify(ta) === JSON.stringify(tb)) sameTop++;
}
console.log(`lượt so ${runs}, lỗi / thiếu ${errs}; top 30 y hệt (cả thứ tự, bỏ trường đầu phát) ${sameTop}`);
console.log(`dòng eastern-lion trong top: gốc ${elTopA}, nhánh ${elTopB}`);
console.log(`(lượt, dòng) đổi điểm theo NCC: ${JSON.stringify(Object.fromEntries(scoreDiff))}`);
console.log(`ra top theo NCC: ${JSON.stringify(Object.fromEntries(topOut))}`);
console.log(`vào top theo NCC: ${JSON.stringify(Object.fromEntries(topIn))}`);
fs.writeFileSync(new URL("./so-gop-doi-diem.tsv", import.meta.url), diffList.join("\n") + "\n");
