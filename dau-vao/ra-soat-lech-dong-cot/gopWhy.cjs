// node gopWhy.cjs <repo cũ> <repo mới> <gop-cu.json> <gop-moi.json>: giải thích TỪNG dòng vào / ra top 30 của mọi gói: công suất của
// dòng (catalog.js cũ ↔ mới) có đổi không. Dòng ra mà công suất không đổi = bị dòng khác chen; dòng vào mà không đổi = lấp chỗ trống.
const fs = require("fs");
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [RA, RB, FA, FB] = process.argv.slice(2);
const pw = (p) => (p ? ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k[0].toUpperCase()} ${p[k].kVA ?? "·"}/${p[k].kW ?? "·"}`).join(" ") : "∅");
const idx = (repo) => { const { C, S } = load(repo), m = new Map(); for (const s of S) { if (s.status === "incomplete") continue; for (const o of C.fromSupplier(s)) { if (o.kind !== "engine") continue; const k = s.id + "|" + C.keyOf(o.line || (o.lines?.rows || []).join(" ")); const v = m.get(k) || new Set(); v.add(pw(o.power) + " eng=" + o.model + " alt=" + (o.other || "")); m.set(k, v); } } return m; };
const a = idx(RA), b = idx(RB), A = JSON.parse(fs.readFileSync(FA, "utf8")), B = JSON.parse(fs.readFileSync(FB, "utf8"));
const lineOf = (rk) => { const p = rk.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
const cls = {}, ex = {}, pk = { changed: 0, explained: 0 };
for (const k of Object.keys(A)) {
  const x = A[k], y = B[k]; if (!y || x.error || y.error) continue;
  const sa = new Set(x.top.map(lineOf)), sb = new Set(y.top.map(lineOf));
  const ins = [...sb].filter((r) => !sa.has(r)), outs = [...sa].filter((r) => !sb.has(r));
  if (!ins.length && !outs.length) continue;
  pk.changed++; let any = false;
  for (const [dir, list] of [["vào", ins], ["ra", outs]]) for (const r of list) {
    const o = a.get(r), n = b.get(r), so = o ? [...o].sort().join(" ¦ ") : "(không có)", sn = n ? [...n].sort().join(" ¦ ") : "(không có)";
    const c = `${dir}: ${so === sn ? "dòng KHÔNG đổi" : !o ? "dòng mới có" : !n ? "dòng không còn" : "dòng ĐỔI (công suất / model)"}`;
    if (so !== sn) any = true;
    cls[c] = (cls[c] || 0) + 1; (ex[c] = ex[c] || []).length < 4 && ex[c].push(`${k} ${r.slice(0, 90)} :: ${so.slice(0, 90)} → ${sn.slice(0, 90)}`);
  }
  if (any) pk.explained++;
}
console.log(cls); console.log(`lượt có tập top 30 đổi: ${pk.changed}, trong đó có ít nhất một dòng vào / ra đổi công suất hay model: ${pk.explained}`);
for (const [c, l] of Object.entries(ex)) { console.log("\n" + c); for (const e of l) console.log("   " + e); }
