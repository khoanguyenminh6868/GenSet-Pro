// Vòng 3, luật chốt F: node an-f.mjs <worktree> <gop-main.json> <gop-nhanh.json> <do-v.json> <do-w.json> <out.txt>
// So V (do-v "on"), W1, W2 với nhánh hiện tại (#939 = gop-nhanh = do-v "off") và với gốc main, trên 261 lượt có ngưỡng dung
// tích: dòng giữ lại / loại thêm (theo nhóm), lượt top đổi; lớp (b) (số thắng = ngưỡng HSMT làm tròn) từng nhóm giữ hay loại;
// nhóm W giữ lại mà đường kính × hành trình × số xi lanh nguồn ghi cho dung tích KHÔNG đạt; 6DTAA89G34.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, GM, NH, DV, DW, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const dv = J(DV), dw = J(DW), nh = J(NH), gm = J(GM);
const noAlt = (k) => { const p = k.split("|"); p[2] = ""; return p.join("|"); };
const runs = Object.keys(dv).filter((k) => !dv[k].error && dw[k] && !dw[k].error);
const L = [`Lượt: ${runs.length} (do-v ${Object.keys(dv).length}, do-w ${Object.keys(dw).length}; lỗi do-w ${Object.values(dw).filter((x) => x.error).length})`];
const thrOf = (rule, h) => (rule === "disp" ? `≥ ${h.minDisp}` : `≤ ${h.maxDisp}`);
const ruleOf = (d) => d.ruled.find((r) => r === "disp" || r === "maxDisp");
const variants = { V: (k) => dv[k].on, F: (k) => dw[k].fin };
const keptGroups = {}, dropGroups = {};
// DS: đường kính × hành trình × số xi lanh theo nguồn (như ds.mjs).
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => J(path.join(dir, f))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups), engByKey = new Map(cat.engines.map((e) => [e.key, e]));
function dsOf(key) {
  const e = engByKey.get(key); if (!e) return [];
  const ef = facts.get(`engine:${e.key}`) || [];
  const all = [...ef.map((f) => [f, undefined]), ...e.uses.flatMap((u) => (u.specs || []).map((f) => [{ ...f, supplierId: f.supplierId ?? u.supplierId }, B.useNormCtx(u)]))];
  const by = new Map();
  for (const [f, ctx] of all) {
    if (f.key !== "bore" && f.key !== "cyl") continue;
    const x = B.normFig(f, ctx, f.key === "bore" ? { unit: "mm" } : {});
    if (!x.ok) continue;
    const o = by.get(f.supplierId) || { bore: new Set(), cyl: new Set() };
    if (f.key === "bore" && x.r.bore?.bore && x.r.bore?.stroke) o.bore.add(`${x.r.bore.bore}×${x.r.bore.stroke}`);
    if (f.key === "cyl" && x.r.count) o.cyl.add(x.r.count);
    by.set(f.supplierId, o);
  }
  const out = new Map();
  for (const [s, o] of by) for (const bs of o.bore) for (const z of o.cyl) {
    const [D, S] = bs.split("×").map(Number), l = Math.round(Math.PI / 4 * D * D * S * z / 1e3) / 1e3, k = `${bs}×${z}=${l.toFixed(3)}`;
    out.set(k, (out.get(k) || 0) + 1);
  }
  return [...out].map(([k, n]) => ({ k, n, l: Number(k.split("=")[1]) }));
}
for (const [name, get] of Object.entries(variants)) {
  const kB = new Map(), dB = new Map(), kM = new Map(), dM = new Map();
  let topB = 0, topM = 0, nKB = 0, nDB = 0, nKM = 0, nDM = 0;
  const add = (m, key, run) => { const o = m.get(key) || { rows: 0, runs: new Set() }; o.rows++; o.runs.add(run); m.set(key, o); };
  for (const k of runs) {
    const x = get(k), b = nh[k], m = gm[k], h = dv[k].hints;
    const aX = new Set(x.all.map(([q]) => q)), aB = new Set(b.all.map(([q]) => q)), aM = new Set(m.all.map(([q]) => q));
    const offD = new Map(dv[k].off.drop.map((d) => [noAlt(d.k), d])), xD = new Map(x.drop.map((d) => [noAlt(d.k), d]));
    const label = (d, tag) => { const r = ruleOf(d), s = d[r] || {}; return `${d.e}\t${r}\t${thrOf(r, h)}\t${tag} ${s.win}${s.group ? ` nhóm ${s.group.join("/")}` : ""}${s.exact != null ? ` chính xác ${s.exact}` : ""}\tsố ${(s.vals || []).join(",")}`; };
    for (const q of aX) if (!aB.has(q)) { nKB++; const d = offD.get(noAlt(q)); add(kB, d ? label(d, "thắng nhánh") : "(không thấy trong dòng bị loại vì dung tích của nhánh)", k); }
    for (const q of aB) if (!aX.has(q)) { nDB++; const d = xD.get(noAlt(q)); add(dB, d ? label(d, `thắng ${name}`) : "(loại vì lý do khác)", k); }
    for (const q of aX) if (!aM.has(q)) { nKM++; const d = offD.get(noAlt(q)) || null; add(kM, d ? label(d, "thắng nhánh") : "(main loại, nhánh cũng giữ)", k); }
    for (const q of aM) if (!aX.has(q)) { nDM++; const d = xD.get(noAlt(q)); add(dM, d ? label(d, `thắng ${name}`) : "(loại vì lý do khác)", k); }
    if (x.top.join("\n") !== b.top.join("\n")) topB++;
    if (x.top.join("\n") !== m.top.join("\n")) topM++;
  }
  keptGroups[name] = kB; dropGroups[name] = dB;
  const dump = (title, mp, n) => {
    L.push(`\n${name} — ${title}: ${mp.size} nhóm, ${n} dòng`);
    for (const [key, o] of [...mp].sort((a, c) => c[1].rows - a[1].rows)) L.push(`  ${key}\t${o.rows} dòng / ${o.runs.size} lượt (${[...o.runs].slice(0, 4).join(" ")}${o.runs.size > 4 ? " …" : ""})`);
  };
  L.push(`\n===== ${name}: top đổi so nhánh ${topB} lượt, so main ${topM} lượt =====`);
  dump("giữ lại so với nhánh (#939)", kB, nKB);
  dump("loại thêm so với nhánh (#939)", dB, nDB);
  dump("giữ lại so với main", kM, nKM);
  dump("loại thêm so với main", dM, nDM);
}
// Lớp (b): dòng nhánh loại mà số thắng tương thích làm tròn với ngưỡng.
L.push("\n===== Lớp (b): số thắng là ngưỡng HSMT làm tròn — từng nhóm giữ / loại =====");
const gb = new Map();
for (const k of runs) {
  const h = dv[k].hints;
  for (const d of dv[k].off.drop) {
    const r = ruleOf(d), s = d[r]; if (!s) continue;
    const t = r === "disp" ? h.minDisp : h.maxDisp; if (!B.roundCompat(s.win, t)) continue;
    const key = `${d.e}\t${r}\tthắng ${s.win}\t${thrOf(r, h)}\tsố ${(s.vals || []).join(",")}`;
    const o = gb.get(key) || { rows: 0, V: 0, F: 0 };
    o.rows++;
    for (const [n, get] of Object.entries(variants)) if (get(k).all.some(([q]) => noAlt(q) === noAlt(d.k))) o[n]++;
    gb.set(key, o);
  }
}
for (const [key, o] of [...gb].sort((a, c) => c[1].rows - a[1].rows)) L.push(`  ${key}\t${o.rows} dòng\tgiữ: V ${o.V}, F ${o.F}`);
// Đối chiếu D × S × z nguồn ghi: nhóm F giữ lại / loại thêm so nhánh. Loại thêm mà D×S×z đạt = số đông có thể sai (báo riêng).
const judge = (key) => {
  const [e, r, thr] = key.split("\t"), t = Number(thr.slice(2)), ds = dsOf(e);
  const fail = ds.filter((x) => (r === "disp" ? x.l < t : x.l > t * 1.005)), pass = ds.filter((x) => !fail.includes(x));
  return { v: !ds.length ? "không nguồn nào ghi D×S×z" : !pass.length ? "D×S×z KHÔNG ĐẠT" : !fail.length ? "D×S×z ĐẠT" : "D×S×z nguồn ghi khác nhau", ds };
};
for (const [title, m] of [["F giữ lại so nhánh", keptGroups.F], ["F loại thêm so nhánh", dropGroups.F]]) {
  L.push(`\n===== ${title}: đối chiếu đường kính × hành trình × xi lanh nguồn ghi =====`);
  const tally = {};
  for (const [key, o] of [...m].sort((a, c) => c[1].rows - a[1].rows)) {
    const { v, ds } = judge(key);
    tally[v] = (tally[v] || 0) + 1;
    L.push(`  ${key}\t${o.rows} dòng / ${o.runs.size} lượt\t${v}\t${ds.map((x) => `${x.k} (${x.n} NCC)`).join("; ")}`);
  }
  L.push(`  → ${JSON.stringify(tally)}`);
}
L.push(`\n6DTAA89G34 D×S×z: ${dsOf("6DTAA89G34").map((x) => `${x.k} (${x.n} NCC)`).join("; ")}`);
fs.writeFileSync(OUT, L.join("\n"));
console.log(L.filter((l) => !l.startsWith("  ")).join("\n"));
