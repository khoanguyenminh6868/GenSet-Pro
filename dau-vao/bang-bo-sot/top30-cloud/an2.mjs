// node an2.mjs : (a) cylExact + số xi lanh của lượt có khoá rời; baifa ở dropped dưới khoá nào; (b) mọi khoá ra / vào top: lý do
import fs from "node:fs";
const J = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url)));
const LA = J("r-goc.json"), LB = J("r-nhanh.json"), ids = J("ids.json");
const P = (...a) => console.log(a.join(" "));
for (const id of "IB2200018828#0 IB2200035219#0 IB2300005377#0 IB2300096122#0 IB2300254479#0 IB2300268389#0 IB2300315082#0 IB2400302943#0 IB2400377756#0 IB2500320544#0 IB2500432527#0 IB2600418114#0 IB2600588204#0".split(" ")) {
  const h = LB[id].hints; P(id, "minCyl", h.minCyl, "cylExact", h.cylExact);
  for (const d of LB[id].drop) if (/^baifa-power\|16V2000/.test(d.k)) P("   baifa dropped:", d.k.slice(0, 60), d.ruled.join("+"));
  const inA = LA[id].all.some(([k]) => /^baifa-power\|16V2000/.test(k)), inB = LB[id].all.some(([k]) => /^baifa-power\|16V2000/.test(k));
  if (inA || inB) P("   baifa all gốc", inA, "nhánh", inB, "| dropped gốc:", LA[id].drop.filter((d) => /^baifa-power\|16V2000/.test(d.k)).map((d) => d.ruled.join("+")).join(","));
}
// (b) top
const NEW = (k) => k.startsWith("green-power-generators|") || /^lees-power\|[^|]*\|[^|]*\|\|LSMU/.test(k);
const ms = (arr) => { const m = new Map(); for (const x of arr) m.set(x, (m.get(x) || 0) + 1); return m; };
const cls = new Map(); let runsTop = 0, runsNoNew = [];
for (const id of ids) {
  const a = LA[id], b = LB[id]; if (!a?.top) continue;
  const tA = ms(a.top), tB = ms(b.top); const outs = [], ins = [];
  for (const [k, c] of tA) for (let i = (tB.get(k) || 0); i < c; i++) outs.push(k);
  for (const [k, c] of tB) for (let i = (tA.get(k) || 0); i < c; i++) ins.push(k);
  if (!outs.length && !ins.length) continue; runsTop++;
  const sA = new Map(a.all.map(([k, s]) => [k, s])), sB = new Map(b.all.map(([k, s]) => [k, s]));
  const why = (k) => !sB.has(k) ? "rời all" : sB.get(k) !== sA.get(k) ? `điểm ${sA.get(k)}→${sB.get(k)}` : "điểm không đổi, bị chen";
  const newIn = ins.filter(NEW).length, upIn = ins.filter((k) => !NEW(k)).map((k) => `${k.split("|")[0]} ${sA.has(k) ? `${sA.get(k)}→${sB.get(k)}` : "mới vào all"}`);
  if (!newIn && !ins.every((k) => sA.get(k) !== sB.get(k))) runsNoNew.push(id);
  for (const k of outs) { const c = `RA ${k.split("|").slice(0, 2).join("|")} ${k.split("|")[4] || ""}: ${why(k)}`; cls.set(c, [...(cls.get(c) || []), `${id}(vào: ${newIn} dòng 4 bảng${upIn.length ? "; " + upIn.join(", ") : ""})`]); }
}
P(`\n(b) lượt đổi top: ${runsTop}; lượt có khoá ra mà KHÔNG có dòng 4 bảng vào và không khoá vào nào tăng điểm: ${runsNoNew.length} ${runsNoNew.join(" ")}`);
for (const [k, v] of [...cls].sort()) P(`   ${v.length}× ${k}\n        ${v.join("\n        ")}`);
