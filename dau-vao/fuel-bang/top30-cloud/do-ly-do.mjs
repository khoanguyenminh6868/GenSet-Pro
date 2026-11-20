// Dò lý do từng dòng đổi của #973: chạy lại candidates (y hệt do-gop.mjs) cho các lượt trong so-du-b-dong.tsv, ghi mỗi khoá đổi:
// điểm, ruled, why, srcOf; kèm facts động cơ (mọi khoá thông số + giá trị theo NCC) của các model bị đổi.
// node do-ly-do.mjs <worktree> <cn> <bidhist.json> <so-du-b-dong.tsv> <out.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, BH, DONG, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const want = new Map(); // lượt -> Set khoá
for (const l of fs.readFileSync(DONG, "utf8").split("\n").slice(1)) { const c = l.split("\t"); if (c.length < 4) continue; if (!want.has(c[0])) want.set(c[0], new Set()); want.get(c[0]).add(c[3]); }
const raw = J(BH), docs = raw.docs || raw;
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const blocked = RF.blockedRows(sups, {});
const hist = Object.values(docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const full = CAT.build(sups), cn = B.cnSuppliers(sups), cache = new Map();
function catFor(origin, sync, partsOnly, brand) {
  const k = [origin, !!sync, partsOnly, brand].join("|");
  if (!cache.has(k)) {
    const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand);
    const cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) };
    const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
    cache.set(k, { cat, facts });
  }
  return cache.get(k);
}
const lk = (u) => CAT.keyOf(u.line || (u.lines?.rows || []).join(" "));
const rowKey = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${lk(r.u)}`;
const out = { luot: {}, facts: {}, missing: [] };
const engKeys = new Set();
for (const ks of want.values()) for (const k of ks) engKeys.add(k.split("|")[1]);
const byNo = new Map(hist.map((d) => [d.notifyNo, d]));
for (const [id, keys] of want) {
  const [no, ri] = id.split("#"), d = byNo.get(no);
  if (!d) { out.missing.push(id); continue; }
  const text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  const rn = runs[+ri]; if (!rn?.cap) { out.missing.push(id); continue; }
  const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
  const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
  const { cat, facts } = catFor(origin, sync, partsOnly, brand);
  const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, blocked });
  const rec = {};
  const topSet = new Set(R.top.map(rowKey));
  for (const r of R.all) { const k = rowKey(r); if (keys.has(k)) (rec[k] ??= []).push({ s: r.score, top: topSet.has(k), why: r.why }); }
  for (const x of R.dropped) { const k = `${x.u.supplierId}|${x.e.key}|${x.a?.key || (x.u.other ? "?" : "")}|${lk(x.u)}`; for (const kk of keys) if (kk.split("|")[0] === x.u.supplierId && kk.split("|")[1] === x.e.key && kk.endsWith(`|${lk(x.u)}`)) (rec[kk] ??= []).push({ dropped: x.ruled, src: x.src }); }
  out.luot[id] = { origin, minDisp: hints0.minDisp, maxDisp: hints0.maxDisp, minCyl: hints0.minCyl, rec };
  if (!out.facts[origin]) { out.facts[origin] = {}; for (const ek of engKeys) out.facts[origin][ek] = (facts.get(`engine:${ek}`) || []).map((f) => [f.key, f.supplierId, String(f.value).slice(0, 40)]); }
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.error("xong", Object.keys(out.luot).length, "thiếu", out.missing.length);
