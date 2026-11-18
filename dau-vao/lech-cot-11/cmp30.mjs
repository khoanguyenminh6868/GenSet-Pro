// node cmp30.mjs gop-main.json gop-new.json [out.json] — lượt đổi; `all` so theo đa tập (khoá có thể lặp: nhiều dòng cùng khoá, điểm khác nhau)
import fs from "node:fs";
const [A, B] = process.argv.slice(2, 4).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const multi = (all) => { const m = new Map(); for (const [k, s] of all) (m.get(k) || m.set(k, []).get(k)).push(s); for (const v of m.values()) v.sort((a, b) => a - b); return m; };
const C = { same: 0, topSet: 0, order: 0, allOnly: 0, err: 0 };
const rows = [];
for (const k of Object.keys(A)) {
  const a = A[k], b = B[k];
  if (a.error || b.error) { C.err++; continue; }
  const sa = new Set(a.top), sb = new Set(b.top);
  const out = a.top.filter((x) => !sb.has(x)), inn = b.top.filter((x) => !sa.has(x));
  const orderDiff = !out.length && !inn.length && a.top.join() !== b.top.join();
  const ma = multi(a.all), mb = multi(b.all);
  const allIn = [...mb.keys()].filter((x) => !ma.has(x)), allOut = [...ma.keys()].filter((x) => !mb.has(x));
  const allScore = [...ma].filter(([x, v]) => mb.has(x) && mb.get(x).join() !== v.join()).map(([x, v]) => [x, v, mb.get(x)]);
  const dropDiff = a.dropped !== b.dropped;
  if (out.length || inn.length) C.topSet++; else if (orderDiff) C.order++; else if (allIn.length || allOut.length || allScore.length || dropDiff || a.topScore.join() !== b.topScore.join()) C.allOnly++; else { C.same++; continue; }
  rows.push({ k, out, inn, orderDiff, allIn, allOut, allScore, dA: a.dropped, dB: b.dropped, rfA: a.rowflag, rfB: b.rowflag });
}
console.log(JSON.stringify(C), "tổng", Object.keys(A).length);
fs.writeFileSync(process.argv[4] || "cmp30.json", JSON.stringify(rows));
