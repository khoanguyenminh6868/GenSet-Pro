// Nhóm ^ trên tệp cloud: có mặt trong `all` (và `top`) theo lượt, gốc ↔ nhánh, theo từng dòng (NCC + chữ dòng).
// node --max-old-space-size=6000 mu2.cjs <gop-goc.json.gz> <gop-nhanh.json.gz> <out.json>
const fs = require("fs"), zlib = require("zlib");
const [G, N, OUT] = process.argv.slice(2);
const load = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString("utf8"));
const goc = load(G), nh = load(N);
const GROUP = /^(12M55G3000\/5|12M55G6D3\/5|16M33D1980E310|16M33G2250\/5|16M33G8D3\/5|16M55G4000\/5|16M55G6D3\/5|20M33G2750\/5|20M33G4D3\/5|6M11G176\/6|6M31G1000\/5|6M31G800\/6|8M33D1012E311|8M33D975E310|8M33G6D3\/5|8M33G900\/6|WP6D180E201)\^?$/;
const parts = (k) => { const a = k.split("|"); return { s: a[0], e: a[1], id: a[0] + "|" + a.slice(3).join("|") }; };
const rows = new Map(); // id -> {s, eG, eN, runsG:{run:score}, runsN:{run:score}, topG, topN}
const get = (p) => { if (!rows.has(p.id)) rows.set(p.id, { s: p.s, id: p.id, eG: null, eN: null, g: {}, n: {}, topG: [], topN: [] }); return rows.get(p.id); };
for (const [run, x] of Object.entries(goc)) {
  for (const [k, v] of x.all) { const p = parts(k); if (GROUP.test(p.e)) { const r = get(p); r.eG = p.e; r.g[run] = v; } }
  for (const k of x.top) { const p = parts(k); if (GROUP.test(p.e)) get(p).topG.push(run); }
}
for (const [run, x] of Object.entries(nh)) {
  for (const [k, v] of x.all) { const p = parts(k); if (GROUP.test(p.e)) { const r = get(p); r.eN = p.e; r.n[run] = v; } }
  for (const k of x.top) { const p = parts(k); if (GROUP.test(p.e)) get(p).topN.push(run); }
}
const list = [...rows.values()].map((r) => {
  const gk = Object.keys(r.g), nk = Object.keys(r.n);
  const moi = nk.filter((k) => !(k in r.g)), mat = gk.filter((k) => !(k in r.n)), ca = gk.filter((k) => k in r.n);
  const delta = {}; for (const k of ca) { const d = r.n[k] - r.g[k]; if (d) delta[d] = (delta[d] || 0) + 1; }
  return { s: r.s, id: r.id, eG: r.eG, eN: r.eN, nG: gk.length, nN: nk.length, moi, mat, delta, topG: r.topG.length, topN: r.topN.length, g: r.g, n: r.n };
});
fs.writeFileSync(OUT, JSON.stringify(list));
list.sort((a, b) => (b.moi.length + b.mat.length) - (a.moi.length + a.mat.length));
console.log("dòng nhóm ^:", list.length, "| có ^ ở nhánh:", list.filter((r) => /\^$/.test(r.eN || "")).length);
console.log("NCC\tkhoá gốc\tkhoá nhánh\tlượt gốc→nhánh\t+mới\t-mất\ttop gốc→nhánh\tđổi điểm");
for (const r of list.filter((r) => r.moi.length || r.mat.length || Object.keys(r.delta).length)) console.log([r.s, r.eG, r.eN, `${r.nG}→${r.nN}`, r.moi.length, r.mat.length, `${r.topG}→${r.topN}`, JSON.stringify(r.delta)].join("\t"));
