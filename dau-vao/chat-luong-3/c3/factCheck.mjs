// node factCheck.mjs <worktree mới> <ref cũ> <gop-cũ> <gop-mới>: với mỗi gói đổi mà KHÔNG có dòng nào có bản ghi đổi (nhóm "dữ kiện
// model"), kiểm có dòng vào / ra / đổi hạng nào mang mã động cơ hoặc đầu phát mà bộ thông số (specs) gộp theo mã đã đổi giữa hai bên
// (bản ghi thêm / đổi / mất của spec-diff cho mã đó thêm hay bớt dữ kiện). Không có: in ra để soát tay.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, REF, FA, FB] = process.argv.slice(2);
const SD = await import(pathToFileURL(path.join(WT, "suppliers", "spec-diff.mjs")).href);
const sa = SD.loadSide(SD.checkoutRef(REF, WT)), sb = SD.loadSide(WT);
const C = sb.C;
// Theo mã (keyOf): tập "loại|key=value" của mọi bản ghi mang mã đó (động cơ: model; đầu phát: model).
const facts = ({ C, S }) => {
  const m = new Map();
  for (const s of S) {
    if (s.status === "incomplete") continue;
    for (const o of C.fromSupplier(s)) {
      const k = o.kind + "|" + C.keyOf(o.model);
      const v = m.get(k) || m.set(k, new Set()).get(k);
      for (const x of o.specs || []) v.add(`${x.key}=${x.value}`);
    }
  }
  return m;
};
const fa = facts(sa), fb = facts(sb);
const changed = new Set();
for (const k of new Set([...fa.keys(), ...fb.keys()])) {
  const a = [...(fa.get(k) || [])].sort().join("¦"), b = [...(fb.get(k) || [])].sort().join("¦");
  if (a !== b) changed.add(k);
}
// Dòng của lượt có bản ghi đổi (như gopCl3): NCC | chữ dòng.
const recs = (side) => { const m = new Map(); for (const s of side.S) { if (s.status === "incomplete") continue; for (const o of side.C.fromSupplier(s)) m.set(s.id + "|" + side.C.keyOf(o.line || (o.lines?.rows || []).join(" ")), JSON.stringify([o.kind, o.model, o.power, o.specs, o.other])); } return m; };
const ra = recs(sa), rb = recs(sb);
const lineOf = (rk) => { const p = rk.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
const recChanged = (rk) => ra.get(lineOf(rk)) !== rb.get(lineOf(rk));
const codes = (rk) => { const p = rk.split("|"); return [`engine|${p[1]}`, p[2] ? `alternator|${p[2]}` : null].filter(Boolean); };
const A = JSON.parse(fs.readFileSync(FA, "utf8")), B = JSON.parse(fs.readFileSync(FB, "utf8"));
let n = 0, ok = 0;
const bad = [], used = {};
for (const k of Object.keys(A)) {
  const x = A[k], y = B[k];
  if (!x || !y || x.error || y.error) continue;
  const moved = new Set([...x.top.filter((r, i) => y.top[i] !== r), ...y.top.filter((r, i) => x.top[i] !== r)]);
  if (!moved.size && x.all === y.all && x.dropped === y.dropped) continue;
  if ([...new Set([...x.top, ...y.top])].some(recChanged)) continue; // nhóm bản ghi đổi, đã giải thích riêng
  n++;
  const hit = [...moved].flatMap(codes).filter((c) => changed.has(c));
  if (hit.length) { ok++; for (const c of new Set(hit)) used[c] = (used[c] || 0) + 1; }
  else bad.push(`${k} all ${x.all}→${y.all} dropped ${x.dropped}→${y.dropped} moved ${moved.size}`);
}
console.log(`gói không có bản ghi đổi trong top: ${n}; có dòng xê dịch mang mã đổi dữ kiện: ${ok}; không: ${bad.length}`);
console.log("mã đổi dữ kiện gặp nhiều nhất:", Object.entries(used).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([c, v]) => `${c} ${v}`).join("; "));
for (const b of bad) console.log("  " + b);
