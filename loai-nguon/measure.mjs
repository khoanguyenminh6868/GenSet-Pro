// node measure.mjs <shard> <nshards> [code]  -> out/m-<shard>.jsonl
// Đo luật "loại theo nguồn" trên bộ gói của kiem-rong. CHỈ ĐỌC; không mạng, không Supabase, không agent.
// Một mã (worktree wt-loai-nguon): PROOF_RULES rỗng = luật cũ (mọi dòng dưới ngưỡng bị loại; 1a11335),
// PROOF_RULES {disp,maxDisp,cyl} = luật mới, thêm prime = biến thể.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const [shard = 0, nsh = 1] = process.argv.slice(2, 4).map(Number);
const CODE = process.argv[4] || "C:/Projects/GenSet Pro/wt-loai-nguon/suppliers/config-bot.mjs";
const W = "C:/Projects/GenSet Pro/genbid-work", KR = W + "/dieu-phoi/kiem-rong/data", HERE = W + "/dieu-phoi/loai-nguon";
const B = await import(pathToFileURL(CODE).href), CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = Object.values(J(W + "/doc-cache/supplier.json").docs).map((x) => x.d).filter((d) => d && d.status !== "incomplete");
const an = Object.fromEntries(Object.entries(J(W + "/doc-cache/analysis.json").docs).map(([k, v]) => [k, (v.d || v).result]).filter(([, r]) => r));
const CM = Object.fromEntries(Object.entries(J(W + "/doc-cache/configmatch.json").docs).map(([k, v]) => [k, v.d.result]));
const C = new Map(), add = (key, src, text, parts) => { if (!C.has(key) && an[key] && text && text.trim()) C.set(key, { key, src, text, parts: parts || [text], analysis: an[key] }); };
for (const f of fs.readdirSync(KR).filter((f) => /^hsmt-IB\d+\.json$/.test(f))) { const h = J(KR + "/" + f); add(f.slice(5, -5), "full12", h.text, h.parts); }
for (const f of fs.readdirSync(KR + "/hc")) { const h = J(KR + "/hc/" + f); add(f.slice(0, -5), "hc243", h.text, [h.text]); }
for (const k of fs.readdirSync(W + "/specs")) { const p = `${W}/specs/${k}/text.txt`; if (fs.existsSync(p)) add(k, "specs", fs.readFileSync(p, "utf8")); }
const full = CAT.build(sups), cnS = B.cnSuppliers(sups), cache = new Map(), supMap = new Map(sups.map((s) => [s.id, s]));
const catFor = (origin, sync, partsOnly, brand) => { const k = [origin, !!sync, partsOnly, brand].join("|"); if (!cache.has(k)) {
  const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand), cat = { ...full, engines: B.byOrigin(full.engines, origin, cnS, grp) };
  const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cnS) }, sups) : B.modelFacts(cat, sups);
  cache.set(k, { cat, facts }); } return cache.get(k); };
const sizesOfEntry = (e) => { const a = e.analysis, name = a?.keyInfo?.bidName || "", found = B.sizesOf([a?.keyInfo?.generatorCapacity, name], name);
  if (found.length > 1) return found.slice(0, B.MAX_SIZES).map((s, i) => ({ i, cap: s.cap }));
  return [{ i: null, cap: B.capacity([name, a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]) }]; };
const ck = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || String(r.u.other || "").toLowerCase().replace(/[^a-z0-9]/g, "")}`;
const RULES = { before: [], after: ["disp", "maxDisp", "cyl"], prime: ["disp", "maxDisp", "cyl", "prime"] };
const run = (cat, cap, hints0, opts, which) => { B.PROOF_RULES.clear(); for (const k of RULES[which]) B.PROOF_RULES.add(k); return B.candidates(cat, cap, hints0, opts); };
const all = [...C.keys()].sort().filter((_, i) => i % nsh === shard);
const outF = `${HERE}/out/m-${shard}.jsonl`; fs.writeFileSync(outF, "");
const factLine = (f, x) => ({ sid: f.supplierId ?? null, n: f.n ?? null, v: String(f.value).slice(0, 50), x, sheet: !!f.sheet, role: supMap.get(f.supplierId)?.role || null, line: String(f.line || "").slice(0, 220) });
let n = 0;
for (const key of all) {
  const e = C.get(key);
  for (const { i, cap } of sizesOfEntry(e)) {
    if (!cap) continue;
    try {
      const hints0 = B.hintsOf(e.text, ""), pj = e.parts.join(""), auto = B.originOfHsmt(pj), origin = auto?.origin || "all", sync = BP.brandSyncOf(e.text);
      const partsOnly = B.partsOnlyOf(origin, pj), brand = auto?.basis === "brand" && !partsOnly, { cat, facts } = catFor(origin, sync, partsOnly, brand);
      let keep = null; const prev = CM[key];
      if (prev) { const pr = prev.sizes ? prev.sizes.find((x) => x.cap?.value === cap.value || x.kva === cap.value)?.result : prev; keep = B.keepOf(pr); }
      const opts = { suppliers: sups, origin, cn: cnS, sync, keep, facts };
      const R = Object.fromEntries(Object.keys(RULES).map((w) => [w, run(cat, cap, hints0, opts, w)]));
      // phân loại từng dòng bị loại ở luật cũ: theo lý do × nguồn
      const byReason = {}, rowClass = { maker: 0, multi: 0, single: 0 }, rowClassP = { maker: 0, multi: 0, single: 0 };
      const rank = (cls) => cls.includes("maker") ? "maker" : cls.includes("multi") ? "multi" : "single";
      for (const d of R.before.dropped) {
        for (const k of d.ruled) { const p = d.src[k]?.proof || "?"; byReason[k] = byReason[k] || {}; byReason[k][p] = (byReason[k][p] || 0) + 1; }
        const nonPrime = d.ruled.filter((k) => k !== "prime");
        // dòng được cứu ở luật mới khi mọi lý do là disp/maxDisp/cyl "single"; có prime thì vẫn bị loại
        if (nonPrime.length) rowClass[d.ruled.includes("prime") ? "prime+" + rank(nonPrime.map((k) => d.src[k].proof)) : rank(nonPrime.map((k) => d.src[k].proof))] = (rowClass[d.ruled.includes("prime") ? "prime+" + rank(nonPrime.map((k) => d.src[k].proof)) : rank(nonPrime.map((k) => d.src[k].proof))] || 0) + 1;
        rowClassP[rank(d.ruled.map((k) => d.src[k].proof))]++;
      }
      const t3 = (r) => r.top.slice(0, 3).map(ck), t30 = (r) => new Set(r.top.map(ck));
      const diff3 = (a, b) => JSON.stringify(t3(a)) !== JSON.stringify(t3(b)), set3 = (a, b) => { const x = new Set(t3(a)); return t3(b).some((k) => !x.has(k)); };
      const weakTop = (r) => r.top.filter((x) => x.weak?.length && !x.named);
      const new30 = (a, b) => { const x = t30(a); return b.top.filter((r) => !x.has(ck(r))).length; };
      // mẫu soát tay: dòng được cứu (luật mới), kèm mọi số liệu của lý do
      const samples = R.after.all.filter((x) => x.weak?.length && !x.named).slice(0, 3).map((x) => {
        const ef = facts.get(`engine:${x.e.key}`) || [], given = [...ef, ...(x.u.specs || [])];
        return { sup: x.u.supplierId, model: x.e.model, ek: x.e.key, make: x.e.make || null, weak: x.weak, inTop: R.after.top.includes(x),
          disp: given.filter((f) => f.key === "disp").map((f) => factLine(f, B.dispLitres ? B.dispLitres(f) : null)), cyl: given.filter((f) => f.key === "cyl").map((f) => factLine(f, null)), row: String(x.u.line || "").slice(0, 220) };
      });
      const rec = { key, src: e.src, i, cap, origin, h: { minDisp: R.before.hints?.minDisp ?? null }, nRowsBefore: R.before.all.length, nDropped: R.before.dropped.length,
        nRowsAfter: R.after.all.length, nRowsPrime: R.prime.all.length, byReason, rowClass, rowClassP,
        top3Changed: diff3(R.before, R.after), top3SetChanged: set3(R.before, R.after), top3ChangedP: diff3(R.before, R.prime), top3SetChangedP: set3(R.before, R.prime),
        top30New: new30(R.before, R.after), top30NewP: new30(R.before, R.prime), weakTop: weakTop(R.after).length, weakTopP: weakTop(R.prime).length,
        weakTop3: R.after.top.slice(0, 3).filter((x) => x.weak?.length && !x.named).length, weakTop3P: R.prime.top.slice(0, 3).filter((x) => x.weak?.length && !x.named).length,
        topN: [R.before.top.length, R.after.top.length, R.prime.top.length], top3: { before: t3(R.before), after: t3(R.after), prime: t3(R.prime) }, samples };
      fs.appendFileSync(outF, JSON.stringify(rec) + "\n"); n++;
    } catch (err) { fs.appendFileSync(outF, JSON.stringify({ key, i, error: String(err.stack || err).slice(0, 500) }) + "\n"); }
  }
}
console.log(`shard ${shard} xong: ${n} lượt`);
process.exit(0);
