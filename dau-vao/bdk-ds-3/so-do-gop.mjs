// bdk-ds-4: so gop-goc.json ↔ gop-dau.json (do-gop cloud): mọi lượt đổi, phân loại đổi điểm / tập / thứ tự. node so-do-gop.mjs <thư mục có hai tệp>
import fs from "node:fs"; import path from "node:path";
const D = process.argv[2];
const a = JSON.parse(fs.readFileSync(path.join(D, "gop-goc.json"), "utf8")), b = JSON.parse(fs.readFileSync(path.join(D, "gop-dau.json"), "utf8"));
const out = { turns: 0, scoreChanged: [], setChanged: [], orderOnly: 0 };
for (const k of Object.keys(a)) {
  const x = a[k], y = b[k]; if (!y) continue;
  const mx = new Map(x.all), my = new Map(y.all);
  const keys = new Set([...mx.keys(), ...my.keys()]);
  const ds = [], onlyA = [], onlyB = [];
  for (const key of keys) { if (!mx.has(key)) onlyB.push(key); else if (!my.has(key)) onlyA.push(key); else if (mx.get(key) !== my.get(key)) ds.push({ key, from: mx.get(key), to: my.get(key) }); }
  const topA = new Set(x.top), topB = new Set(y.top);
  const outTop = x.top.filter((t) => !topB.has(t)), inTop = y.top.filter((t) => !topA.has(t));
  const sameOrder = JSON.stringify(x.top) === JSON.stringify(y.top);
  if (ds.length || onlyA.length || onlyB.length || outTop.length || inTop.length || !sameOrder) {
    out.turns++;
    out.scoreChanged.push(...ds.map((d) => ({ turn: k, ...d, delta: d.to - d.from })));
    if (onlyA.length || onlyB.length) out.setChanged.push({ turn: k, onlyA, onlyB });
    if (outTop.length || inTop.length) (out.topSet ||= []).push({ turn: k, out: outTop.map((t) => ({ t, inAll: my.has(t), scoreB: my.get(t), scoreA: mx.get(t) })), in: inTop.map((t) => ({ t, scoreA: mx.get(t), scoreB: my.get(t) })) });
    out.dropped = (out.dropped || 0) + (x.dropped !== y.dropped ? 1 : 0);
  }
}
const dist = {}; for (const s of out.scoreChanged) dist[s.delta] = (dist[s.delta] || 0) + 1;
out.deltaDist = dist; out.nScoreLines = out.scoreChanged.length;
console.log(JSON.stringify(out));
