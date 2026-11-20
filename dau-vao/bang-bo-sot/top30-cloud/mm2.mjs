// node mm2.mjs : 5 lượt cục bộ lệch cloud (khác bản chụp chữ HSMT): giải thích khác biệt gốc ↔ nhánh từ CHÍNH số cloud
import fs from "node:fs"; import zlib from "node:zlib";
const rd = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL(f, import.meta.url))));
const CA = rd("gop-goc.json.gz"), CB = rd("gop-nhanh.json.gz");
for (const id of "IB2200052056#0 IB2300133361#0 IB2300133361#1 IB2400457172#0 IB2500416364#0".split(" ")) {
  const a = CA[id], b = CB[id], sA = new Map(), sB = new Map();
  for (const [k, s] of a.all) sA.set(k, [...(sA.get(k) || []), s]); for (const [k, s] of b.all) sB.set(k, [...(sB.get(k) || []), s]);
  const d = [];
  for (const k of new Set([...sA.keys(), ...sB.keys()])) { const x = (sA.get(k) || []).join(), y = (sB.get(k) || []).join(); if (x !== y) d.push(`${k.slice(0, 55)} [${x}]→[${y}]`); }
  const tb = new Set(b.top), ta = new Set(a.top);
  console.log(id, "\n   all đổi:", d.join("\n            "), "\n   ra top:", a.top.filter((k) => !tb.has(k)).map((k) => k.slice(0, 45)).join(" ; "), "\n   vào top:", b.top.filter((k) => !ta.has(k)).map((k) => k.slice(0, 45)).join(" ; "));
}
