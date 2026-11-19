import fs from "node:fs";
const G = JSON.parse(fs.readFileSync("gop-goc.json")), H = JSON.parse(fs.readFileSync("gop-nhanh.json"));
const c = { set: 0, score: 0, tie: 0, other: [] };
for (const id of Object.keys(G)) {
  const g = G[id], h = H[id];
  if (JSON.stringify(g.top) === JSON.stringify(h.top) && JSON.stringify(g.topScore) === JSON.stringify(h.topScore)) continue;
  const gs = new Set(g.top), hs = new Set(h.top);
  if (g.top.length !== h.top.length || g.top.some((k) => !hs.has(k)) || h.top.some((k) => !gs.has(k))) { c.set++; continue; }
  const sc = (t, s) => JSON.stringify(t.map((k, i) => k + "@" + s[i]).sort());
  if (sc(g.top, g.topScore) !== sc(h.top, h.topScore)) { c.score++; continue; }
  // cùng tập, cùng điểm: chỉ thứ tự; kiểm mọi cặp đổi chỗ có cùng điểm
  const tie = g.top.every((k, i) => h.topScore[i] === g.topScore[i]);
  if (tie) c.tie++; else c.other.push(id);
}
console.log(c);
