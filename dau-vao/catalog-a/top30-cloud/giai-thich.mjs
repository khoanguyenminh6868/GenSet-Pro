// Giải thích MỌI thay đổi top 30 gốc 671797e4 ↔ nhánh 4600d59d, dựa trên chạy lại trên máy (luot-chi-tiet.mjs: cap, all, top,
// dropped kèm lý do) của mọi lượt có đổi, đối chiếu với kết quả cloud (gop-*.json).
// node --max-old-space-size=8192 giai-thich.mjs  → giai-thich.md + roi-all.tsv, vao-all.tsv, top-doi.tsv, giam-diem.tsv
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const load = (f) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(f, "utf8"), box); return box.GenbidCatalog; };
const CB = load("catalog-goc.js"), CH = load("catalog-nhanh.js"), K = CH.keyOf;
const CN = "../../../../../wt-catalog-a/suppliers/cn";
const textOf = (o) => o.line || (o.lines?.rows || []).join(" ");
// bản ghi động cơ theo khoá dòng (NCC|động cơ|chữ dòng), và giá trị mới theo model động cơ
const recB = new Map(), recH = new Map(), newVals = new Map();
const pw = (p) => !p ? "∅" : ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k} ${p[k].kVA ?? "-"}kVA/${p[k].kW ?? "-"}kW`).join("; ");
for (const f of fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort()) {
  const s = J(path.join(CN, f)); if (s.status === "incomplete") continue;
  const add = (m, o) => { if (o.kind !== "engine") return; const k = `${s.id}|${K(o.model)}|${K(textOf(o))}`; if (!m.has(k)) m.set(k, []); m.get(k).push(o); };
  const rb = CB.fromSupplier(s), rh = CH.fromSupplier(s);
  rb.forEach((o) => add(recB, o)); rh.forEach((o) => add(recH, o));
  const rk = (o) => `${o.n}|${o.table}|${o.row}|${o.kind}|${o.model}`;
  const mb = new Map(rb.map((o) => [rk(o), o]));
  for (const o of rh) {
    if (o.kind !== "engine") continue;
    const b = mb.get(rk(o)), sb = new Map((b?.specs || []).map((x) => [x.key, x.value]));
    for (const x of o.specs || []) if (sb.get(x.key) !== x.value) {
      const m = K(o.model); if (!newVals.has(m)) newVals.set(m, []);
      newVals.get(m).push(`${s.id} ${b ? "" : "(bản ghi mới) "}${x.key}=${x.value}`);
    }
  }
  for (const [k, b] of mb) if (b.kind === "engine" && !rh.some((o) => rk(o) === k)) { const m = K(b.model); if (!newVals.has(m)) newVals.set(m, []); newVals.get(m).push(`${s.id} (bản ghi mất)`); }
}
const nv = (e) => { const v = newVals.get(e) || []; const c = {}; for (const x of v) c[x] = (c[x] || 0) + 1; return Object.entries(c).map(([x, n]) => n > 1 ? `${x} ×${n}` : x).join("; "); };
const split = (key) => { const p = key.split("|"); return { sup: p[0], e: p[1], a: p[2], lk: `${p[0]}|${p[1]}|${p.slice(3).join("|")}` }; };
const recOf = (lk) => (recH.get(lk) || recB.get(lk) || [])[0];
const lineCls = (lk) => {
  const b = recB.get(lk) || [], h = recH.get(lk) || [];
  if (!b.length && h.length) return "A dòng mới (chuyển từ tiêu đề)";
  if (b.length && !h.length) return "B dòng mất";
  if (b.length !== h.length) return "B2 gộp also";
  const sb = JSON.stringify(b.map((o) => ({ ...o, also: null, header: null, lines: null }))), sh = JSON.stringify(h.map((o) => ({ ...o, also: null, header: null, lines: null })));
  if (sb === sh) return null;
  const d = [];
  for (let i = 0; i < b.length; i++) {
    const x = b[i], y = h[i];
    if (x.genset !== y.genset) d.push(`genset ${x.genset}→${y.genset}`);
    if (JSON.stringify(x.makes) !== JSON.stringify(y.makes)) d.push(`hãng ${(x.makes || []).map((m) => m.name)}→${(y.makes || []).map((m) => m.name)}`);
    const sx = new Map((x.specs || []).map((s) => [s.key, s.value]));
    for (const s of y.specs || []) if (sx.get(s.key) !== s.value) d.push(`${s.key} ${sx.get(s.key) ?? "∅"}→${s.value}`);
    for (const s of x.specs || []) if (!(y.specs || []).some((t) => t.key === s.key)) d.push(`${s.key} ${s.value}→∅`);
  }
  return "C dòng đổi: " + [...new Set(d)].join(", ");
};
const GG = J("gop-goc.json"), GH = J("gop-nhanh.json"), cg = J("ct-goc.json"), ch = J("ct-nhanh.json");
const ms = (all) => JSON.stringify(all.map((x) => x.join("@")).sort());
let lech = 0; const lechList = [];
for (const id of Object.keys(ch)) {
  const okG = ms(cg[id].all) === ms(GG[id].all) && JSON.stringify(cg[id].top) === JSON.stringify(GG[id].top) && cg[id].dropped.length === GG[id].dropped;
  const okH = ms(ch[id].all) === ms(GH[id].all) && JSON.stringify(ch[id].top) === JSON.stringify(GH[id].top) && ch[id].dropped.length === GH[id].dropped;
  if (!okG || !okH) { lech++; lechList.push(`${id} gốc ${okG ? "khớp" : "LỆCH"} nhánh ${okH ? "khớp" : "LỆCH"}`); }
}
const dmap = (r) => { const m = new Map(); for (const [k, why] of r.dropped) { if (!m.has(k)) m.set(k, []); m.get(k).push(why); } return m; };
const roi = ["luot\tkhoa\tdiem-goc\tlop\tly-do-nhanh\tgia-tri-moi-cua-model"], vao = ["luot\tkhoa\tdiem-nhanh\tlop\tly-do-goc"], topd = ["luot\tcap\tvao/ra\tkhoa\tdiem-goc\tdiem-nhanh\tlop\tcong-suat\tprime-td/cap\tthieu"], giam = ["luot\tkhoa\tdiem-goc\tdiem-nhanh\tlop\tgia-tri-moi-cua-model"];
const T = { roi: {}, vao: {}, topVao: {}, topRa: {}, giam: {}, tang: 0 };
const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
const kvaPrime = (p) => p?.prime?.kVA ?? (p?.prime?.kW != null ? p.prime.kW / 0.8 : p?.standby?.kVA != null ? p.standby.kVA / 1.1 : p?.standby?.kW != null ? p.standby.kW / 0.8 / 1.1 : p?.rated?.kVA ?? (p?.rated?.kW != null ? p.rated.kW / 0.8 : null));
const keyOfAll = (k) => { const s = split(k); return `${s.sup}|${s.e}|${s.lk.split("|").slice(2).join("|")}`; };
const roiKeys = new Map(), vaoKeys = new Map();
for (const id of Object.keys(ch).sort()) {
  const g = cg[id], h = ch[id];
  const ga = new Map(), ha = new Map();
  for (const [k, s] of g.all) ga.set(k, s); for (const [k, s] of h.all) ha.set(k, s);
  const gd = dmap(g), hd = dmap(h);
  for (const [k, s] of ga) if (!ha.has(k)) {
    const { lk, e } = split(k), c = lineCls(lk);
    const why = (hd.get(keyOfAll(k)) || []).join(" / ") || (c?.startsWith("B") ? "không còn bản ghi" : "?");
    const cls = c ? c.split(":")[0] : "D model động cơ có giá trị mới";
    roi.push([id, k, s, c || "D", why, nv(e)].join("\t")); bump(T.roi, `${cls} → ${why.replace(/[0-9]/g, "")}`);
    const kk = `${split(k).sup}|${e}`; if (!roiKeys.has(kk)) roiKeys.set(kk, new Set()); roiKeys.get(kk).add(`${cls} → ${why}`);
  }
  for (const [k, s] of ha) if (!ga.has(k)) {
    const { lk } = split(k), c = lineCls(lk);
    const why = (gd.get(keyOfAll(k)) || []).join(" / ") || (c?.startsWith("A") ? "bản ghi mới" : "?");
    vao.push([id, k, s, c || "D", why].join("\t")); bump(T.vao, `${split(k).sup} | ${c ? c.split(":")[0] : "D"} | gốc: ${why.replace(/[0-9]/g, "")}`);
    const kk = `${split(k).sup}|${split(k).e}`; if (!vaoKeys.has(kk)) vaoKeys.set(kk, new Set()); vaoKeys.get(kk).add(c ? c.split(":")[0] : "D (trước bị loại: " + why + ")");
  }
  for (const [k, s] of ha) if (ga.has(k) && ga.get(k) !== s) {
    const { lk, e } = split(k), c = lineCls(lk);
    if (s < ga.get(k)) { giam.push([id, k, ga.get(k), s, c || "D", nv(e)].join("\t")); bump(T.giam, c ? c.split(":")[0] + ":" + c.split(":")[1]?.slice(0, 60) : "D " + e); } else T.tang++;
  }
  if (JSON.stringify(g.top) !== JSON.stringify(h.top) || JSON.stringify(g.topScore) !== JSON.stringify(h.topScore)) {
    const gt = new Set(g.top), ht = new Set(h.top);
    for (const k of h.top) if (!gt.has(k)) {
      const o = recOf(split(k).lk), c = lineCls(split(k).lk), p = o?.power || {};
      const r = kvaPrime(p), th = [];
      if (!p.prime) th.push("không prime"); if (!p.standby) th.push("không standby"); if (!["prime", "standby", "rated"].some((x) => p[x]?.kVA != null)) th.push("không kVA");
      const capK = h.cap ? (/kw/i.test(h.cap.unit) ? h.cap.value / 0.8 : h.cap.value) : null; const ratio = r && capK ? r / capK : null;
      topd.push([id, `${h.cap?.value} ${h.cap?.unit}`, "vào", k, ga.get(k) ?? "", h.topScore[h.top.indexOf(k)], c || (ga.has(k) ? (ga.get(k) === ha.get(k) ? "E điểm không đổi" : "D điểm đổi") : "D trước bị loại: " + (gd.get(keyOfAll(k)) || []).join("/")), pw(p), ratio?.toFixed(2) ?? "?", th.join(",")].join("\t"));
      bump(T.topVao, c ? c.split(":")[0] : ga.has(k) ? (ga.get(k) === ha.get(k) ? "E điểm không đổi" : "D điểm đổi") : "D trước bị loại");
    }
    for (const k of g.top) if (!ht.has(k)) {
      const c = lineCls(split(k).lk);
      const cls = c ? c.split(":")[0] : !ha.has(k) ? "rời all: " + (hd.get(keyOfAll(k)) || []).join("/") : ha.get(k) === ga.get(k) ? "F điểm không đổi, bị đẩy" : ha.get(k) < ga.get(k) ? "D điểm giảm" : "D điểm tăng nhưng vẫn ra";
      topd.push([id, `${h.cap?.value} ${h.cap?.unit}`, "ra", k, g.topScore[g.top.indexOf(k)], ha.get(k) ?? "", cls, "", "", ""].join("\t"));
      bump(T.topRa, cls.replace(/[0-9]/g, ""));
    }
  }
}
for (const [f, a] of [["roi-all.tsv", roi], ["vao-all.tsv", vao], ["top-doi.tsv", topd], ["giam-diem.tsv", giam]]) fs.writeFileSync(f, a.join("\n") + "\n");
const tab = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join("\n");
let md = `# Giải thích top 30 (chạy lại ${Object.keys(ch).length} lượt có đổi trên máy, bidhist máy 18/11)\n\nĐối chiếu với cloud: lệch ${lech} lượt\n${lechList.slice(0, 50).map((x) => "- " + x).join("\n")}\n`;
md += `\n## Rời all: theo khoá NCC|động cơ (${roiKeys.size})\n\n` + [...roiKeys].sort().map(([k, s]) => `- ${k}: ${[...s].join(" ; ")}`).join("\n") + "\n";
md += `\n## Rời all: dòng-lượt theo lớp → lý do nhánh\n\n| lớp → lý do | dòng-lượt |\n|---|--:|\n${tab(T.roi)}\n`;
md += `\n## Vào all: khoá NCC|động cơ (${vaoKeys.size})\n\n` + [...vaoKeys].sort().map(([k, s]) => `- ${k}: ${[...s].join(" ; ")}`).join("\n") + "\n";
md += `\n## Vào all: dòng-lượt theo NCC × lớp × lý do gốc\n\n| | dòng-lượt |\n|---|--:|\n${tab(T.vao)}\n`;
md += `\n## Top vào\n\n${tab(T.topVao)}\n\n## Top ra\n\n${tab(T.topRa)}\n`;
md += `\n## Dòng cũ giảm điểm (${giam.length - 1} dòng-lượt; tăng ${T.tang})\n\n${tab(T.giam)}\n`;
fs.writeFileSync("giai-thich.md", md);
console.log(md.slice(0, 20000));
