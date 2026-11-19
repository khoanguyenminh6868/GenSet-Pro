// node them.mjs: lần rời `all` (lượt × khoá, đa tập) có ở đo cloud lần 2 (a89b88be ↔ 93f4586c) mà không có ở lần 1
// (671797e4 ↔ 48044c61), và ngược lại; gom theo lượt × động cơ, kèm ngưỡng dung tích của lượt (do-r-nhanh lần 1).
import fs from "node:fs";
const J = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), "utf8"));
const g2 = J("./gop-goc.json"), n2 = J("./gop-nhanh.json"), g1 = J("../top30-cloud/gop-goc.json"), n1 = J("../top30-cloud/gop-nhanh.json"), r = J("../top30-cloud/do-r-nhanh.json");
const outs = (g, n) => { const m = new Map(); for (const k of Object.keys(g)) { const c = new Map(); for (const [q] of g[k].all) c.set(q, (c.get(q) || 0) + 1); for (const [q] of n[k].all) c.set(q, (c.get(q) || 0) - 1); for (const [q, v] of c) if (v > 0) m.set(`${k}\t${q}`, v); } return m; };
const o1 = outs(g1, n1), o2 = outs(g2, n2);
const diff = (a, b) => { const m = new Map(); for (const [x, v] of a) { const d = v - (b.get(x) || 0); if (d > 0) { const [k, q] = x.split("\t"), key = `${k}\t${q.split("|")[1]}\t${r[k]?.hints ? JSON.stringify(r[k].hints) : "lượt không có ở lần 1"}`; m.set(key, (m.get(key) || 0) + d); } } return m; };
const seen1 = new Set([...o1.keys()].map((x) => { const [k, q] = x.split("\t"); return `${k}\t${q.split("|")[1]}`; }));
const add = diff(o2, o1), newPairs = [...add.keys()].filter((x) => !seen1.has(x.split("\t").slice(0, 2).join("\t")));
console.log(`Cặp (lượt, động cơ) thêm ở lần 2 mà lần 1 KHÔNG có dòng nào rời: ${newPairs.length}${newPairs.length ? " — " + newPairs.join("; ") : ""}`);
for (const [t, m] of [["Thêm ở lần 2", add], ["Mất ở lần 2", diff(o1, o2)]]) {
  console.log(`${t}: ${[...m.values()].reduce((s, v) => s + v, 0)} lần`);
  for (const [k, v] of [...m].sort((a, b) => b[1] - a[1])) console.log(`  ${k}\t${v}`);
}
