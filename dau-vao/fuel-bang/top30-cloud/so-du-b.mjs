// So ĐỦ gop-goc ↔ gop-b (đa tập): mỗi lượt × khoá dòng: rời / vào / đổi điểm; top rời / vào. Gom theo NCC và theo khoá.
// node so-du-b.mjs gop-goc.json.gz gop-b.json.gz out-prefix
import fs from "node:fs";
import zlib from "node:zlib";
const [GA, GB, OUT] = process.argv.slice(2);
const rd = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f)));
const A = rd(GA), B = rd(GB);
const ms = (all) => { const m = new Map(); for (const [k, s] of all) { if (!m.has(k)) m.set(k, []); m.get(k).push(s); } for (const v of m.values()) v.sort((a, b) => b - a); return m; };
const rows = [["lượt", "loại", "NCC", "khoá", "điểm gốc", "điểm B", "top gốc", "top B"].join("\t")];
const sup = {}, keyAgg = {};
const bump = (s, t) => { sup[s] ??= { roi: 0, vao: 0, diem: 0, topRa: 0, topVao: 0, luot: new Set() }; sup[s][t]++; };
let luotKhac = 0;
for (const id of Object.keys(A)) {
  const a = A[id], b = B[id]; if (!b) { console.log("thiếu B", id); continue; }
  const ma = ms(a.all), mb = ms(b.all), ta = new Set(a.top), tb = new Set(b.top);
  let khac = false;
  for (const k of new Set([...ma.keys(), ...mb.keys()])) {
    const sa = ma.get(k) || [], sb = mb.get(k) || [];
    const s = k.split("|")[0];
    const inTa = ta.has(k), inTb = tb.has(k);
    let t = null;
    if (sa.length > sb.length) t = "roi"; else if (sb.length > sa.length) t = "vao"; else if (sa.join() !== sb.join()) t = "diem";
    if (inTa && !inTb) bump(s, "topRa"); if (!inTa && inTb) bump(s, "topVao");
    if (!t && inTa === inTb) continue;
    khac = true;
    if (t) { bump(s, t); sup[s].luot.add(id); const kk = `${t}\t${k}`; keyAgg[kk] ??= { n: 0, d: [] }; keyAgg[kk].n++; if (sa[0] != null && sb[0] != null) keyAgg[kk].d.push(sb[0] - sa[0]); }
    rows.push([id, t || "chỉ top", s, k, sa.join(","), sb.join(","), inTa ? 1 : 0, inTb ? 1 : 0].join("\t"));
  }
  if (khac) luotKhac++;
}
fs.writeFileSync(`${OUT}-dong.tsv`, rows.join("\n") + "\n");
const ks = Object.entries(keyAgg).sort((x, y) => y[1].n - x[1].n).map(([k, v]) => { const d = v.d.length ? [...new Set(v.d)].sort((p, q) => p - q).join(",") : ""; return `${v.n}\t${k}\t${d}`; });
fs.writeFileSync(`${OUT}-khoa.tsv`, "lượt\tloại\tkhoá\tđổi điểm (B−gốc)\n" + ks.join("\n") + "\n");
console.log(`lượt khác (all hoặc top): ${luotKhac}; dòng ghi: ${rows.length - 1}`);
console.log("NCC\trời\tvào\tđổi điểm\ttop ra\ttop vào\tlượt");
for (const [s, v] of Object.entries(sup).sort((x, y) => (y[1].roi + y[1].vao + y[1].diem) - (x[1].roi + x[1].vao + x[1].diem))) console.log([s, v.roi, v.vao, v.diem, v.topRa, v.topVao, v.luot.size].join("\t"));
