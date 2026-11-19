// Vòng 4: node an-r.mjs <worktree> <out.txt>: giải thích top 30 cloud (gop-goc.json = main 671797e4 ↔ gop-nhanh.json =
// nhánh 48044c61) bằng lượt chạy lại cục bộ do-r-nhanh.json (code nhánh, cùng cn; mọi dòng bị loại kèm ruled / src).
// 0. Lượt chạy lại khớp cloud không. 1. Mọi khoá rời `all`: nhóm theo động cơ × luật × ngưỡng, số đông, số chính xác, D×S×z,
// lớp. 2. Khoá vào `all`. 3. Lượt top đổi: rời / vào top và lý do; top < 5 / rỗng. 4. 10 động cơ mất nhiều dòng nhất.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const J = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), "utf8"));
const g = J("./gop-goc.json"), n = J("./gop-nhanh.json"), r = J("./do-r-nhanh.json"), ids = J("./runs-doi.json").ids;
const noAlt = (k) => { const p = k.split("|"); p[2] = ""; return p.join("|"); };
const eng = (k) => k.split("|")[1];
const L = [];
// D×S×z
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups), byKey = new Map(cat.engines.map((e) => [e.key, e])), dsMemo = new Map();
function dsOf(key) {
  if (dsMemo.has(key)) return dsMemo.get(key);
  const e = byKey.get(key); if (!e) return [];
  const ef = facts.get(`engine:${key}`) || [];
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
  for (const [, o] of by) for (const bs of o.bore) for (const z of o.cyl) {
    const [D, S] = bs.split("×").map(Number), l = Math.PI / 4 * D * D * S * z / 1e6, k = `${bs}×${z}=${l.toFixed(3)}`;
    out.set(k, { k, n: (out.get(k)?.n || 0) + 1, l });
  }
  const v = [...out.values()].sort((a, b) => b.n - a.n);
  dsMemo.set(key, v);
  return v;
}
// 0
let same = 0; const bad = [];
for (const k of ids) {
  const x = r[k];
  if (!x || x.error) { bad.push(`${k} ${x ? x.error : "không chạy lại được (không có trong bidhist cục bộ)"}`); continue; }
  const ok = JSON.stringify(x.fin.all) === JSON.stringify(n[k].all) && x.fin.top.join("\n") === n[k].top.join("\n");
  ok ? same++ : bad.push(`${k} chạy lại ≠ cloud`);
}
L.push(`0. Chạy lại cục bộ ${ids.length} lượt khác nhau bằng code nhánh: ${same} khớp cloud (all + top), ${bad.length} không khớp${bad.length ? ": " + bad.join("; ") : ""}`);
// 1
const grp = new Map(), byEng = new Map();
let nOut = 0, unk = 0;
const cls = (rule, s, t) => {
  if (!s || s.exact == null) return "sai thật (số đông cũ, không qua nhóm làm tròn)";
  const g2 = s.group || [s.exact], pass = (x) => (rule === "disp" ? x >= t : x <= t * 1.005);
  if (g2.some(pass)) return "(a) nhóm có số làm tròn đạt, số chính xác không đạt: Khoa quyết LOẠI";
  if (B.roundCompat(s.exact, t)) return "(b) nguồn chỉ có số làm tròn của ngưỡng: Khoa quyết LOẠI";
  return "sai thật (số chính xác không đạt)";
};
const leftOf = new Map();
for (const k of ids) {
  const x = r[k]; if (!x || x.error) continue;
  const drop = new Map(); for (const d of x.fin.drop) drop.set(noAlt(d.k), d);
  const a = new Set(g[k].all.map(([q]) => q)), b = new Set(n[k].all.map(([q]) => q));
  const left = [];
  for (const q of a) if (!b.has(q)) {
    nOut++; left.push(q);
    const d = drop.get(noAlt(q));
    let key;
    if (!d) { unk++; key = `${eng(q)}\tKHÔNG RÕ (không thấy trong dòng bị loại)`; }
    else {
      const rule = d.ruled.find((y) => y === "disp" || y === "maxDisp");
      if (!rule) key = `${d.e}\tluật khác: ${d.ruled.join(",")}`;
      else {
        const s = d.src[rule] || {}, t = rule === "disp" ? x.hints.minDisp : x.hints.maxDisp;
        const ds = dsOf(d.e);
        key = `${d.e}\t${rule} ${rule === "disp" ? "≥" : "≤"} ${t}\tphiếu ${JSON.stringify(s.votes || {})}\tnhóm ${(s.group || []).join("/")}\tchính xác ${s.exact ?? s.win ?? "-"}\t${cls(rule, s, t)}\t${(s.group || []).length > 1 ? "có gộp làm tròn" : "nhóm một số (số đông dung tích chặng B / C6)"}\tD×S×z ${ds.slice(0, 3).map((y) => `${y.k}×${y.n}`).join("; ") || "-"}`;
      }
    }
    const o = grp.get(key) || { rows: 0, runs: new Set() }; o.rows++; o.runs.add(k); grp.set(key, o);
    const e = byEng.get(eng(q)) || { rows: 0, runs: new Set(), thr: new Map() }; e.rows++; e.runs.add(k);
    if (d) { const rule = d.ruled.find((y) => y === "disp" || y === "maxDisp"); const t = `${rule === "disp" ? "≥" : "≤"} ${rule === "disp" ? x.hints.minDisp : x.hints.maxDisp}`; e.thr.set(t, [...(e.thr.get(t) || []), k]); e.src = d.src[rule]; }
    byEng.set(eng(q), e);
  }
  leftOf.set(k, left);
}
const byCls = {};
for (const [key, o] of grp) { const c = key.split("\t")[5] || key.split("\t")[1]; byCls[c] = (byCls[c] || 0) + o.rows; }
L.push(`\n1. Khoá rời all: ${nOut} (không rõ: ${unk}); ${grp.size} nhóm (động cơ × luật × ngưỡng). Theo lớp (dòng): ${JSON.stringify(byCls)}`);
for (const [key, o] of [...grp].sort((p, q) => q[1].rows - p[1].rows)) L.push(`  ${key}\t${o.rows} dòng / ${o.runs.size} lượt (${[...o.runs].slice(0, 3).join(" ")}${o.runs.size > 3 ? " …" : ""})`);
// 2
let nIn = 0; for (const k of ids) { const a = new Set(g[k].all.map(([q]) => q)); for (const [q] of n[k].all) if (!a.has(q)) nIn++; }
L.push(`\n2. Khoá vào all (có ở nhánh, không có ở main): ${nIn}`);
// 3
L.push("\n3. Lượt top đổi (rời top: lý do; vào top: có ở all của main không, điểm)");
let topCh = 0; const small = [];
for (const k of ids) {
  const x = r[k]; if (!x || x.error) continue;
  const ta = g[k].top, tb = n[k].top; if (ta.join("\n") === tb.join("\n")) continue;
  topCh++;
  const sb = new Set(tb), sa = new Set(ta), bAll = new Set(n[k].all.map(([q]) => q)), aAll = new Map(g[k].all.map(([q, s]) => [q, s]));
  const drop = new Map(x.fin.drop.map((d) => [noAlt(d.k), d]));
  const outs = ta.filter((q) => !sb.has(q)), ins = tb.filter((q) => !sa.has(q));
  const oe = new Map();
  for (const q of outs) { const d = drop.get(noAlt(q)); const why = bAll.has(q) ? "còn trong all (bị đẩy)" : d ? d.ruled.join(",") : "KHÔNG RÕ"; const kk = `${eng(q)}:${why}`; oe.set(kk, (oe.get(kk) || 0) + 1); }
  const ie = new Map(); let insNotMain = 0;
  for (const q of ins) { if (!aAll.has(q)) insNotMain++; ie.set(eng(q), (ie.get(eng(q)) || 0) + 1); }
  const minB = Math.min(...n[k].topScore), pushed = outs.filter((q) => bAll.has(q)), pushedHigher = pushed.filter((q) => (aAll.get(q) ?? -1e9) > minB);
  if (tb.length < 5) small.push(`${k}: top nhánh ${tb.length} dòng (main ${ta.length})`);
  L.push(`  ${k}\t${x.hints.minDisp != null ? `≥ ${x.hints.minDisp}` : ""}${x.hints.maxDisp != null ? ` ≤ ${x.hints.maxDisp}` : ""}\ttop ${ta.length}→${tb.length}\trời ${outs.length}: ${[...oe].map(([a, c]) => `${a}×${c}`).join(", ")}\tvào ${ins.length}: ${[...ie].map(([a, c]) => `${a}×${c}`).join(", ")}${insNotMain ? `\tVÀO KHÔNG CÓ Ở ALL MAIN ${insNotMain}` : ""}${pushedHigher.length ? `\tBỊ ĐẨY MÀ ĐIỂM > ĐIỂM THẤP NHẤT TOP MỚI: ${pushedHigher.length}` : ""}`);
}
L.splice(L.findIndex((l) => l.startsWith("\n3.")) + 1, 0, `  Lượt top đổi: ${topCh}; top nhánh < 5 dòng: ${small.length}${small.length ? " — " + small.join("; ") : ""}`);
// 4
L.push("\n4. 10 động cơ mất nhiều dòng nhất (rời all)");
for (const [e, o] of [...byEng].sort((p, q) => q[1].rows - p[1].rows).slice(0, 10)) {
  const thr = [...o.thr].sort((p, q) => q[1].length - p[1].length), k0 = thr[0]?.[1][0], txt = k0 ? (r[k0].dispText || []).join(" ‖ ") : "";
  L.push(`  ${e}\t${o.rows} dòng / ${o.runs.size} lượt\tngưỡng: ${thr.map(([t, ks]) => `${t} (${ks.length})`).join(", ")}\tphiếu ${JSON.stringify(o.src?.votes || {})} nhóm ${(o.src?.group || []).join("/")} chính xác ${o.src?.exact ?? "-"}\tD×S×z ${dsOf(e).slice(0, 2).map((y) => `${y.k}×${y.n}`).join("; ")}\tHSMT ${k0}: ${txt}`);
}
fs.writeFileSync(OUT, L.join("\n"));
console.log(L.filter((l) => !l.startsWith("  ") || l.startsWith("  Lượt top")).join("\n"));
