// node runs-doi.mjs: lượt mà `all` (đa tập khoá) hoặc `top` khác giữa gop-goc.json (main 671797e4) và gop-nhanh.json
// (nhánh 48044c61) của lượt đo cloud → runs-doi.json { ids, sum }.
import fs from "node:fs";
const J = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), "utf8"));
const g = J("./gop-goc.json"), n = J("./gop-nhanh.json");
const ms = (a) => { const m = new Map(); for (const [k] of a) m.set(k, (m.get(k) || 0) + 1); return m; };
const ids = [], sum = { runs: 0, same: 0, allDiff: 0, topDiff: 0, out: 0, in: 0, topOut: 0, topIn: 0 };
for (const k of Object.keys(g)) {
  sum.runs++;
  const a = ms(g[k].all), b = ms(n[k].all);
  let out = 0, inn = 0;
  for (const [q, c] of a) out += Math.max(0, c - (b.get(q) || 0));
  for (const [q, c] of b) inn += Math.max(0, c - (a.get(q) || 0));
  const ta = ms(g[k].top.map((x) => [x])), tb = ms(n[k].top.map((x) => [x]));
  let to = 0, ti = 0;
  for (const [q, c] of ta) to += Math.max(0, c - (tb.get(q) || 0));
  for (const [q, c] of tb) ti += Math.max(0, c - (ta.get(q) || 0));
  const allD = out + inn > 0 || g[k].dropped !== n[k].dropped, topD = to + ti > 0;
  if (allD) sum.allDiff++;
  if (topD) sum.topDiff++;
  if (!allD && !topD && g[k].top.join("\n") === n[k].top.join("\n")) sum.same++;
  if (allD || topD || g[k].top.join("\n") !== n[k].top.join("\n")) ids.push(k);
  sum.out += out; sum.in += inn; sum.topOut += to; sum.topIn += ti;
}
fs.writeFileSync(new URL("./runs-doi.json", import.meta.url), JSON.stringify({ ids, sum }));
console.log(JSON.stringify(sum), "lượt khác:", ids.length);
