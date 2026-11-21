// #1022: mọi dòng MẤT / đổi điểm trong đo cloud (goc.json.gz ↔ nhanh.json.gz): chạy lại candidates bằng code NHÁNH trên các lượt có đổi,
// ghi luật loại và số nguồn. Chỉ đọc. node giai-thich.mjs <worktree nhánh (f47bedcd)> <cn> <bidhist.json> <out.json>
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { pathToFileURL } from "node:url";
const [WT, CN, BH, OUT] = process.argv.slice(2), HERE = import.meta.dirname;
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice, J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), Z = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(HERE, f))));
const noAlt = (k) => { const p = k.split("|"); p[2] = ""; return p.join("|"); };
const G = Z("goc.json.gz"), N = Z("nhanh.json.gz");
const want = new Map(); // lượt -> { lost:Map(khoá -> điểm gốc), chg:Map(khoá -> [gốc, nhánh]) }
for (const [run, g] of Object.entries(G)) {
  const n = N[run]; if (!n?.all || !g?.all) continue;
  const gm = new Map(), nm = new Map();
  for (const [k, s] of g.all) { const x = noAlt(k); if (!gm.has(x) || gm.get(x) < s) gm.set(x, s); }
  for (const [k, s] of n.all) { const x = noAlt(k); if (!nm.has(x) || nm.get(x) < s) nm.set(x, s); }
  const lost = new Map(), chg = new Map();
  for (const [k, s] of gm) { if (!nm.has(k)) lost.set(k, s); else if (nm.get(k) !== s) chg.set(k, [s, nm.get(k)]); }
  if (lost.size || chg.size) want.set(run, { lost, chg, topG: g.top.map(noAlt), topN: new Set(n.top.map(noAlt)) });
}
console.error("lượt có đổi", want.size);
const docs = J(BH).docs, sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const blocked = RF.blockedRows(sups, {}), full = CAT.build(sups), cn = B.cnSuppliers(sups), cache = new Map();
const catFor = (o, s, p, b) => { const k = [o, !!s, p, b].join("|"); if (!cache.has(k)) { const grp = B.groupSuppliers(sups, o, !!s, p, b), cat = { ...full, engines: B.byOrigin(full.engines, o, cn, grp) }; cache.set(k, { cat, facts: grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, o, cn) }, sups) : B.modelFacts(cat, sups) }); } return cache.get(k); };
const rowKey = (r) => `${r.u.supplierId}||${""}|`.slice(0, 0) + `${r.u.supplierId}|${r.e.key}||${CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" "))}`;
const specs = (u, re) => (u.specs || []).filter((s) => re.test(s.key)).map((s) => ({ k: s.key, l: s.label, v: s.value, c: s.unitCell }));
const out = { lost: [], fuelMinus: [], noRun: [], top5: [], eng: {} };
const hist = Object.values(docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
let i = 0;
for (const d of hist) {
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    const run = `${key}#${ri}`, w = want.get(run); if (!w || !rn.cap) return;
    if (++i % 50 === 0) console.error(i);
    w.seen = true;
    const h = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text), po = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !po;
    const { cat, facts } = catFor(origin, sync, po, brand), R = B.candidates(cat, rn.cap, h, { suppliers: sups, origin, cn, sync, facts, blocked });
    const lim = { cap: rn.cap, minCyl: h.minCyl, cylExact: h.cylExact, cylLayout: h.cylLayout, minDisp: h.minDisp, maxDisp: h.maxDisp, maxFuel: h.maxFuel, maxFuel75: h.maxFuel75, maxFuel50: h.maxFuel50, minPrime: h.minPrime, freq: h.freq };
    const dropBy = new Map(); for (const x of R.dropped) { const k = rowKey(x); if (!dropBy.has(k)) dropBy.set(k, x); }
    for (const [k, s] of w.lost) {
      const x = dropBy.get(k);
      if (x?.e?.key && !out.eng[x.e.key]) out.eng[x.e.key] = { model: x.e.model, make: x.e.make, f: (facts.get(`engine:${x.e.key}`) || []).filter((f) => ["cyl", "disp", "bore"].includes(f.key)).map((f) => ({ k: f.key, v: f.value, s: f.supplierId, n: f.n, sheet: !!f.sheet, maker: !!f.maker })) };
      out.lost.push({ run, k: k.slice(0, 120), sup: k.split("|")[0], ekey: x?.e?.key, why: x?.why || [], model: x?.e?.model || k.split("|")[1], score: s, ruled: x?.ruled || ["(không thấy trong dropped)"], lim,
        cyl: x ? specs(x.u, /^cyl$/) : [], fuel: x ? specs(x.u, /^fuel/) : [], disp: x ? specs(x.u, /^disp$/) : [], line: String(x?.u?.line || (x?.u?.lines?.rows || []).slice(0, 2).join(" ¦ ")).slice(0, 220), top: w.topG.indexOf(k) });
    }
    const byK = new Map(R.all.map((r) => [rowKey(r), r]));
    for (const [k, [a, b]] of w.chg) if (b < a) { const r = byK.get(k); out.fuelMinus.push({ run, sup: k.split("|")[0], model: r?.e?.model, a, b, why: (r?.why || []).filter((y) => /tiêu hao/.test(y)), fuel: r ? specs(r.u, /^fuel/) : [], lim: { maxFuel: h.maxFuel, maxFuel75: h.maxFuel75, maxFuel50: h.maxFuel50 } }); }
    w.topG.slice(0, 5).forEach((k, idx) => { if (!w.topN.has(k)) { const x = dropBy.get(k), r = byK.get(k); out.top5.push({ run, rank: idx + 1, sup: k.split("|")[0], model: x?.e?.model || r?.e?.model || k.split("|")[1], state: x ? `loại: ${x.ruled.join(",")}` : r ? `còn trong bảng, điểm ${r.score}` : "không thấy", k: k.slice(0, 100) }); } });
  });
}
for (const [run, w] of want) if (!w.seen) out.noRun.push(run);
fs.writeFileSync(OUT, JSON.stringify(out));
console.error("xong: mất", out.lost.length, "trừ điểm", out.fuelMinus.length, "top5", out.top5.length, "lượt không chạy lại được", out.noRun.length);
