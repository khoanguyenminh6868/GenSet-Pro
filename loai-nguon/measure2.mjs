// node measure2.mjs <shard> <nshards>  -> out/d-<shard>.jsonl ; shard 0 cũng ghi out/d-facts.json
// Sửa litres ("9.726L"): so mã origin/main (_old-config-bot.mjs) với mã sửa trên bộ 1.539 lượt của kiem-rong. CHỈ ĐỌC.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const [shard = 0, nsh = 1] = process.argv.slice(2, 4).map(Number);
const WT = "C:/Projects/GenSet Pro/wt-loai-nguon/suppliers";
const NEW = await import(pathToFileURL(WT + "/config-bot.mjs").href), OLD = await import(pathToFileURL(WT + "/_old-config-bot.mjs").href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const W = "C:/Projects/GenSet Pro/genbid-work", KR = W + "/dieu-phoi/kiem-rong/data", HERE = W + "/dieu-phoi/loai-nguon";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = Object.values(J(W + "/doc-cache/supplier.json").docs).map((x) => x.d).filter((d) => d && d.status !== "incomplete");
const an = Object.fromEntries(Object.entries(J(W + "/doc-cache/analysis.json").docs).map(([k, v]) => [k, (v.d || v).result]).filter(([, r]) => r));
const CM = Object.fromEntries(Object.entries(J(W + "/doc-cache/configmatch.json").docs).map(([k, v]) => [k, v.d.result]));
const C = new Map(), add = (key, src, text, parts) => { if (!C.has(key) && an[key] && text && text.trim()) C.set(key, { key, src, text, parts: parts || [text], analysis: an[key] }); };
for (const f of fs.readdirSync(KR).filter((f) => /^hsmt-IB\d+\.json$/.test(f))) { const h = J(KR + "/" + f); add(f.slice(5, -5), "full12", h.text, h.parts); }
for (const f of fs.readdirSync(KR + "/hc")) { const h = J(KR + "/hc/" + f); add(f.slice(0, -5), "hc243", h.text, [h.text]); }
for (const k of fs.readdirSync(W + "/specs")) { const p = `${W}/specs/${k}/text.txt`; if (fs.existsSync(p)) add(k, "specs", fs.readFileSync(p, "utf8")); }
const B = NEW, full = CAT.build(sups), cnS = B.cnSuppliers(sups), cache = new Map();
const catFor = (origin, sync, partsOnly, brand) => { const k = [origin, !!sync, partsOnly, brand].join("|"); if (!cache.has(k)) {
  const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand), cat = { ...full, engines: B.byOrigin(full.engines, origin, cnS, grp) };
  const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cnS) }, sups) : B.modelFacts(cat, sups);
  cache.set(k, { cat, facts }); } return cache.get(k); };
// Dữ kiện dung tích của catalog đọc khác nhau (dispLitres chép lại, chỉ khác litres)
if (shard === 0) {
  const DISP_UNIT_L = /\(\s*(?:l|lít|lit)\s*\)|\b(?:litres?|liters?)\b/i, DISP_UNIT_CC = /\(\s*(?:cc|cm\s?[3³]|ml)\s*\)/i;
  const dl = (L, f) => L(DISP_UNIT_L.test(f.label || "") && !/\d\s*(?:cc|cm|ml)/i.test(f.value) ? `${f.value} L` : DISP_UNIT_CC.test(f.label || "") ? `${f.value} cc` : f.value);
  const facts = B.modelFacts(full, sups), seen = new Set(), diff = [];
  const look = (f, ek, sid) => { if (f.key !== "disp") return; const k = `${ek}|${sid}|${f.value}|${f.label}`; if (seen.has(k)) return; seen.add(k); const a = dl(OLD.litres, f), b = dl(NEW.litres, f); if (a !== b) diff.push({ ek, sid, label: f.label, value: f.value, old: a, new: b }); };
  for (const e of full.engines) { for (const f of facts.get(`engine:${e.key}`) || []) look(f, e.key, f.supplierId); for (const u of e.uses) for (const f of u.specs || []) look(f, e.key, u.supplierId); }
  const rowsOf = new Map(); for (const e of full.engines) for (const u of e.uses) if (diff.some((d) => d.ek === e.key)) rowsOf.set(e.key, (rowsOf.get(e.key) || 0) + 1);
  fs.writeFileSync(`${HERE}/out/d-facts.json`, JSON.stringify({ n: diff.length, engines: [...new Set(diff.map((d) => d.ek))].length, rowsOfEngines: [...rowsOf.values()].reduce((a, b) => a + b, 0), diff }, null, 1));
}
const sizesOfEntry = (e) => { const a = e.analysis, name = a?.keyInfo?.bidName || "", found = B.sizesOf([a?.keyInfo?.generatorCapacity, name], name);
  if (found.length > 1) return found.slice(0, B.MAX_SIZES).map((s, i) => ({ i, cap: s.cap }));
  return [{ i: null, cap: B.capacity([name, a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]) }]; };
const ck = (r) => `${r.u.supplierId}|${r.e.key}|${r.u.n}|${r.u.row ?? ""}|${r.a?.key || String(r.u.other || "")}`;
const all = [...C.keys()].sort().filter((_, i) => i % nsh === shard);
const outF = `${HERE}/out/d-${shard}.jsonl`; fs.writeFileSync(outF, "");
let n = 0;
for (const key of all) {
  const e = C.get(key);
  for (const { i, cap } of sizesOfEntry(e)) {
    if (!cap) continue;
    try {
      const pj = e.parts.join(""), auto = B.originOfHsmt(pj), origin = auto?.origin || "all", sync = BP.brandSyncOf(e.text);
      const partsOnly = B.partsOnlyOf(origin, pj), brand = auto?.basis === "brand" && !partsOnly, { cat, facts } = catFor(origin, sync, partsOnly, brand);
      let keep = null; const prev = CM[key];
      if (prev) { const pr = prev.sizes ? prev.sizes.find((x) => x.cap?.value === cap.value || x.kva === cap.value)?.result : prev; keep = B.keepOf(pr); }
      const opts = { suppliers: sups, origin, cn: cnS, sync, keep, facts };
      const o = OLD.candidates(cat, cap, OLD.hintsOf(e.text, ""), opts), w = NEW.candidates(cat, cap, NEW.hintsOf(e.text, ""), opts);
      const dset = (r) => new Map(r.dropped.map((d) => [ck(d), d.ruled.join("+")]));
      const od = dset(o), nd = dset(w);
      const rescued = [...od.keys()].filter((k) => !nd.has(k)), newlyDropped = [...nd.keys()].filter((k) => !od.has(k)), reasonChanged = [...od.keys()].filter((k) => nd.has(k) && nd.get(k) !== od.get(k));
      const h = NEW.plausible(NEW.hintsOf(e.text, ""), cap);
      const t3 = (r) => r.top.slice(0, 3).map(ck).join(";"), t30 = (r) => r.top.map(ck);
      const rec = { key, i, cap, nDroppedOld: od.size, nDroppedNew: nd.size, rescued: rescued.length, newlyDropped: newlyDropped.length, reasonChanged: reasonChanged.length, h: { minDisp: h.minDisp, maxDisp: h.maxDisp },
        rescuedEx: rescued.slice(0, 5).map((k) => [k, od.get(k), nd.get(k) || null]), newlyEx: newlyDropped.slice(0, 5).map((k) => [k, nd.get(k)]),
        top3Changed: t3(o) !== t3(w), top30Diff: t30(w).filter((k) => !t30(o).includes(k)).length };
      if (rec.rescued || rec.newlyDropped || rec.reasonChanged || rec.top3Changed || rec.top30Diff) fs.appendFileSync(outF, JSON.stringify(rec) + "\n");
      n++;
    } catch (err) { fs.appendFileSync(outF, JSON.stringify({ key, i, error: String(err.stack || err).slice(0, 500) }) + "\n"); }
  }
}
fs.appendFileSync(outF, JSON.stringify({ done: n }) + "\n");
console.log(`shard ${shard} xong: ${n} lượt`);
process.exit(0);
