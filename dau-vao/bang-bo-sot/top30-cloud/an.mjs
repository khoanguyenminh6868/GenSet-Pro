// node an.mjs > an.txt : giải thích ĐỦ mọi khác biệt gốc ↔ nhánh của các lượt khác (ids.json), so đa tập, không lấy mẫu.
// (0) chạy lại cục bộ phải trùng cloud (top + all có điểm). (1) mỗi khoá NCC khác rời / vào all hay đổi điểm: lý do.
// (2) dòng green-power / lees của 4 bảng trong ứng viên: dòng khí ở gói diesel. (3) ra / vào top.
import fs from "node:fs"; import zlib from "node:zlib";
const rd = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL(f, import.meta.url))));
const J = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url)));
const CA = rd("gop-goc.json.gz"), CB = rd("gop-nhanh.json.gz"), LA = J("r-goc.json"), LB = J("r-nhanh.json"), ids = J("ids.json");
const ms = (arr) => { const m = new Map(); for (const x of arr) m.set(x, (m.get(x) || 0) + 1); return m; };
const P = (...a) => console.log(a.join(" "));
const NEW = (k) => /^green-power-generators\|/.test(k) || /^lees-power\|[^|]*\|[^|]*\|\|LSMU/.test(k);
const sig = (all) => all.map((x) => x[0] + "@" + x[1]).sort().join("\n");
let ok = 0, bad = [];
for (const id of ids) {
  const a = LA[id], b = LB[id];
  if (!a || !b || a.error || b.error) { bad.push(id + " thiếu/lỗi"); continue; }
  const same = (L, C) => L.top.join() === C.top.join() && sig(L.all) === sig(C.all);
  if (same(a, CA[id]) && same(b, CB[id])) ok++; else bad.push(id);
}
P(`(0) chạy lại cục bộ trùng cloud: ${ok}/${ids.length}${bad.length ? " LỆCH: " + bad.join(" ") : ""}`);
// (1)
const sc = new Map(), drop = new Map(), why = new Map();
const tally = (m, k, v) => m.set(k, [...(m.get(k) || []), v]);
for (const id of ids) {
  const a = LA[id], b = LB[id]; if (!a?.all || !b?.all) continue;
  const g = (all) => { const m = new Map(); for (const [k, s, w] of all) m.set(k, [...(m.get(k) || []), [s, w]]); return m; };
  const ga = g(a.all), gb = g(b.all);
  const dB = new Map(); for (const d of b.drop) dB.set(d.k, [...(dB.get(d.k) || []), d]);
  const dA = new Map(); for (const d of a.drop) dA.set(d.k, [...(dA.get(d.k) || []), d]);
  for (const k of new Set([...ga.keys(), ...gb.keys()])) {
    if (NEW(k)) continue;
    const x = (ga.get(k) || []), y = (gb.get(k) || []);
    if (JSON.stringify(x.map((z) => z[0]).sort()) === JSON.stringify(y.map((z) => z[0]).sort())) continue;
    if (x.length === y.length) {
      const d = y.map((z, i) => z[0] - x[i][0]).join(",");
      const wd = y[0][1] === x[0][1] ? "why giống" : `why ĐỔI: «${x[0][1]}» → «${y[0][1]}»`;
      tally(sc, `${k.split("|").slice(0, 2).join("|")} Δ${d} ${wd}`, id);
    } else if (y.length < x.length) {
      const r = (dB.get(k) || []).map((d) => d.ruled.join("+") + (Object.keys(d.src).length ? " src=" + JSON.stringify(d.src) : "")).join(" / ") || "không ở dropped (ngoài 30 / khác)";
      tally(drop, `RỜI ${k.slice(0, 90)} | ${r}`, id);
    } else {
      const r = (dA.get(k) || []).map((d) => d.ruled.join("+") + (Object.keys(d.src).length ? " src=" + JSON.stringify(d.src) : "")).join(" / ") || "không ở dropped gốc";
      tally(drop, `VÀO ${k.slice(0, 90)} | gốc loại vì ${r}`, id);
    }
  }
}
P(`\n(1a) khoá NCC khác chỉ đổi điểm (cùng số bản): ${[...sc.values()].reduce((s, v) => s + v.length, 0)} lượt-khoá`);
for (const [k, v] of [...sc].sort()) P(`   ${v.length}× ${k}`);
P(`\n(1b) khoá NCC khác rời / vào all: ${[...drop.values()].reduce((s, v) => s + v.length, 0)} lượt-khoá`);
for (const [k, v] of [...drop].sort()) P(`   ${v.length}× ${k}  [${v.join(" ")}]`);
// (1c) hints của lượt có khoá rời
const rIds = new Set([...drop.values()].flat());
P(`\n(1c) hints (minCyl / cylLayout / fuel / freq / minDisp) của ${rIds.size} lượt có khoá NCC khác rời / vào:`);
for (const id of [...rIds].sort()) { const h = LB[id].hints; P(`   ${id} cap=${JSON.stringify(LB[id].cap)} minCyl=${h.minCyl ?? "-"} layout=${h.cylLayout ?? "-"} fuel=${h.fuel ?? "-"} freq=${h.freq ?? "-"} minDisp=${h.minDisp ?? "-"} maxDisp=${h.maxDisp ?? "-"}`); }
// (2) dòng 4 bảng
let gasIn = 0; const gasRuns = [], newIn = new Map(), newDrop = new Map();
for (const id of ids) {
  const b = LB[id]; if (!b?.all) continue;
  for (const [k] of b.all) if (NEW(k)) { tally(newIn, k.split("|").slice(0, 2).join("|") + " " + (k.split("|")[4] || ""), id); if (/\|OC16071A028|\|LSMU|8V4000GS|12V4000GS|16V4000L|20V4000L/.test(k)) { gasIn++; gasRuns.push(id + " " + k.slice(0, 60) + " fuel=" + b.hints.fuel); } }
  for (const d of b.drop) if (NEW(d.k)) tally(newDrop, d.ruled.join("+"), id);
}
P(`\n(2) dòng 4 bảng trong ứng viên (all) ở các lượt khác: ${[...newIn.values()].reduce((s, v) => s + v.length, 0)} lượt-dòng; dòng khí (n126 / lees) trong all: ${gasIn}`);
for (const x of gasRuns) P("   KHÍ " + x);
for (const [k, v] of [...newIn].sort()) P(`   ${v.length}× ${k}`);
P("   dòng 4 bảng bị loại (theo ruled): " + [...newDrop].map(([k, v]) => `${k} ×${v.length}`).join(", "));
