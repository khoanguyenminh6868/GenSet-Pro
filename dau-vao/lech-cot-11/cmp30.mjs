// node cmp30.mjs gop-main.json gop-new.json  — tổng hợp lượt đổi (top, thứ tự, all, dropped, rowflag, điểm)
import fs from "node:fs";
const [A, B] = process.argv.slice(2, 4).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const keys = Object.keys(A);
const C = { same: 0, topSet: 0, order: 0, allOnly: 0, score: 0, err: 0, miss: 0 };
const rows = [];
for (const k of keys) {
  const a = A[k], b = B[k];
  if (!b) { C.miss++; continue; }
  if (a.error || b.error) { C.err++; if (a.error !== b.error) rows.push({ k, kind: "err", a: a.error, b: b.error }); continue; }
  const sa = new Set(a.top), sb = new Set(b.top);
  const out = a.top.filter((x) => !sb.has(x)), inn = b.top.filter((x) => !sa.has(x));
  const orderDiff = !out.length && !inn.length && a.top.join() !== b.top.join();
  const scoreDiff = a.topScore.join() !== b.topScore.join();
  const allA = new Map(a.all), allB = new Map(b.all);
  const allIn = [...allB.keys()].filter((x) => !allA.has(x)), allOut = [...allA.keys()].filter((x) => !allB.has(x));
  const allScore = [...allA].filter(([x, s]) => allB.has(x) && allB.get(x) !== s).map(([x, s]) => [x, s, allB.get(x)]);
  if (out.length || inn.length) C.topSet++; else if (orderDiff) C.order++; else if (allIn.length || allOut.length || a.dropped !== b.dropped || allScore.length || scoreDiff) C.allOnly++; else { C.same++; continue; }
  rows.push({ k, out, inn, orderDiff, allIn, allOut, allScore, dA: a.dropped, dB: b.dropped, rfA: a.rowflag, rfB: b.rowflag });
}
console.log(JSON.stringify(C), "tổng", keys.length);
fs.writeFileSync(process.argv[4] || "cmp30.json", JSON.stringify(rows));
