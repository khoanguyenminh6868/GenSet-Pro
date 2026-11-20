// node k1.mjs : từng khoá NCC khác (không green-power / lees 4 bảng) đổi ở all: số bản A/B, điểm A/B theo lượt
import fs from "node:fs"; import zlib from "node:zlib";
const rd = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL(f, import.meta.url))));
const A = rd("gop-goc.json.gz"), B = rd("gop-nhanh.json.gz");
const pat = new Map();
for (const id of Object.keys(A)) {
  const a = A[id], b = B[id]; if (!b) continue;
  const g = (all) => { const m = new Map(); for (const [k, s] of all || []) m.set(k, [...(m.get(k) || []), s]); return m; };
  const ga = g(a.all), gb = g(b.all);
  for (const k of new Set([...ga.keys(), ...gb.keys()])) {
    const x = (ga.get(k) || []).sort((p, q) => q - p), y = (gb.get(k) || []).sort((p, q) => q - p);
    if (x.join() === y.join()) continue;
    if (k.startsWith("green-power-generators|")) continue;
    const key = k.slice(0, 70) + "  A=" + JSON.stringify(x) + " B=" + JSON.stringify(y);
    pat.set(key, [...(pat.get(key) || []), id]);
  }
}
for (const [k, ids] of [...pat].sort()) console.log(ids.length + "×", k, ids.slice(0, 3).join(" "));
