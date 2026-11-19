// Đối chiếu chạy lại trên máy (luot-chi-tiet.mjs, bidhist máy 18/11) với kết quả cloud, rồi giải thích dropped và dải của dòng mới vào top.
// node cmp-ct.mjs <catalog-goc.js> <catalog-nhanh.js> <thư mục cn> <thư mục top30-cloud>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [CB_JS, CH_JS, CN, D] = process.argv.slice(2);
const J = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));
const load = (f) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(f, "utf8"), box); return box.GenbidCatalog; };
const CB = load(CB_JS), CH = load(CH_JS), K = CH.keyOf;
const textOf = (o) => o.line || (o.lines?.rows || []).join(" ");
const recB = new Map(), recH = new Map(), tabB = new Set();
for (const f of fs.readdirSync(CN).filter((f) => f.endsWith(".json"))) {
  const s = JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"));
  if (s.status === "incomplete") continue;
  const add = (m, o) => { if (o.kind !== "engine") return; const k = `${s.id}|${K(o.model)}|${K(textOf(o))}`; if (!m.has(k)) m.set(k, []); m.get(k).push(o); };
  const rb = CB.fromSupplier(s); rb.forEach((o) => { tabB.add(`${s.id}|${o.n}|${o.table}`); add(recB, o); });
  CH.fromSupplier(s).forEach((o) => add(recH, o));
}
const cls = (lk) => {
  const b = recB.get(lk) || [], h = recH.get(lk) || [];
  if (!b.length && h.length) return tabB.has(`${h[0].supplierId}|${h[0].n}|${h[0].table}`) ? "A1 bản ghi mới (bảng đang đọc)" : "A2 bản ghi mới (bảng R1)";
  if (b.length && !h.length) return "B1 bản ghi mất";
  if (b.length !== h.length) return "B2 số bản lặp đổi";
  return JSON.stringify(b.map((o) => ({ ...o, also: null }))) === JSON.stringify(h.map((o) => ({ ...o, also: null }))) ? "X bản ghi không đổi" : "C bản ghi đổi";
};
const ms = (all) => JSON.stringify(all.map((x) => x.join("@")).sort());
const GG = JSON.parse(fs.readFileSync(path.join(D, "gop-goc.json"), "utf8")), GH = JSON.parse(fs.readFileSync(path.join(D, "gop-nhanh.json"), "utf8"));
const cg = J("ct-goc.json"), ch = J("ct-nhanh.json");
let md = "# Chạy lại trên máy các lượt chọn (bidhist máy 18/11; nhánh = 82587105 + ngoại lệ 5 dòng)\n\n## Đối chiếu với cloud\n\n";
const val = [];
for (const id of Object.keys(cg)) {
  const okG = ms(cg[id].all) === ms(GG[id].all) && JSON.stringify(cg[id].top) === JSON.stringify(GG[id].top) && cg[id].dropped.length === GG[id].dropped;
  const okH = ms(ch[id].all) === ms(GH[id].all) && JSON.stringify(ch[id].top) === JSON.stringify(GH[id].top) && ch[id].dropped.length === GH[id].dropped;
  if (!okG || !okH) {
    const d = (a, b) => { const x = new Set(a.map((r) => r[0])), y = new Set(b.map((r) => r[0])); return [...x].filter((k) => !y.has(k)).concat([...y].filter((k) => !x.has(k)).map((k) => "+" + k)); };
    val.push(`- ${id}: gốc ${okG ? "khớp" : `LỆCH (all ${d(GG[id].all, cg[id].all).slice(0, 3).join(" ; ").slice(0, 300)}; dropped ${GG[id].dropped}/${cg[id].dropped.length})`}; nhánh ${okH ? "khớp" : `LỆCH (all ${d(GH[id].all, ch[id].all).slice(0, 4).join(" ; ").slice(0, 400)}; dropped ${GH[id].dropped}/${ch[id].dropped.length})`}`);
  }
}
md += `${Object.keys(cg).length} lượt; lệch: ${val.length}\n\n${val.join("\n")}\n`;
// dropped: đa tập khoá|lý do
md += "\n## dropped đổi (mọi lượt chạy lại), theo lớp bản ghi × lý do loại\n\n";
const tally = new Map(), detail = [];
for (const id of Object.keys(cg)) {
  const cnt = (l) => { const m = new Map(); for (const [k, r] of l) { const x = `${k}\t${r}`; m.set(x, (m.get(x) || 0) + 1); } return m; };
  const a = cnt(cg[id].dropped), b = cnt(ch[id].dropped);
  for (const x of new Set([...a.keys(), ...b.keys()])) {
    const n = (b.get(x) || 0) - (a.get(x) || 0);
    if (!n) continue;
    const [k, r] = x.split("\t"), c = `${n > 0 ? "vào" : "ra"} | ${cls(k)} | ${r}`;
    tally.set(c, (tally.get(c) || 0) + Math.abs(n)); detail.push(`${id}\t${n}\t${k}\t${r}\t${cls(k)}`);
  }
}
md += "| hướng / lớp / lý do | dòng |\n|---|---:|\n" + [...tally].sort((x, y) => y[1] - x[1]).map(([c, n]) => `| ${c} | ${n} |`).join("\n") + "\n";
fs.writeFileSync(path.join(D, "ct-dropped.tsv"), "luot\tso\tkhoa\tly-do\tlop\n" + detail.join("\n") + "\n");
// dòng mới vào top: cap thật
const pw = (p) => !p ? "∅" : ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k} ${p[k].kVA ?? "-"}kVA/${p[k].kW ?? "-"}kW`).join("; ");
const nt = fs.readFileSync(path.join(D, "cmp-moi-vao-top.tsv"), "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
md += "\n## Dòng mới vào top (cloud) so với cap thật của lượt\n\n| lượt | cap | dòng | công suất | cờ | prime-tương-đương / cap |\n|---|---|---|---|---|---:|\n";
const ratio = [];
for (const [id, key, , , flags] of nt) {
  const c = cg[id]?.cap; const p = key.split("|"), o = (recH.get(`${p[0]}|${p[1]}|${p.slice(3).join("|")}`) || [])[0];
  const P = o?.power || {}, u = c?.unit;
  const pe = P.prime?.[u] ?? (P.standby?.[u] != null ? P.standby[u] / 1.1 : P.rated?.[u] ?? null);
  const r = c && pe != null ? pe / c.value : null; ratio.push(r);
  md += `| ${id} | ${c ? `${c.value} ${c.unit}` : "?"} | ${p[0]}|${p[1]} | ${pw(o?.power)} | ${flags || ""} | ${r?.toFixed(2) ?? "?"} |\n`;
}
const rr = ratio.filter((x) => x != null);
md += `\nTỉ số: ${rr.length} dòng có số; < 0,9: ${rr.filter((x) => x < 0.9).length}; > 1,25: ${rr.filter((x) => x > 1.25).length}; khoảng ${Math.min(...rr).toFixed(2)}–${Math.max(...rr).toFixed(2)}.\n`;
fs.writeFileSync(path.join(D, "cmp-ct.md"), md);
console.log(md.slice(0, 9000));
