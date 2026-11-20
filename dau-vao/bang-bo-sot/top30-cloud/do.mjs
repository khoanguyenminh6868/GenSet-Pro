// node do.mjs <code> <ids.json> <out.json> : chạy lại các lượt khác nhau của top 30 cloud (như do-r.mjs của so-dong-dung-tich),
// ghi top / all (khoá, điểm, why) / mọi dòng bị loại (khoá, ruled, src) để giải thích từng khoá.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, IDS, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa", CN = path.join(WT, "suppliers", "cn");
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const want = new Set(J(IDS));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const blocked = RF.blockedRows(sups, {});
const hist = Object.values(J(`${SNAP}/bidhist.json`).docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
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
const rowKey = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" "))}`;
const out = {};
for (const d of hist) {
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    const id = `${key}#${ri}`;
    if (!rn.cap || !want.has(id)) return;
    try {
      const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
      const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
      const { cat, facts } = catFor(origin, sync, partsOnly, brand);
      const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, blocked });
      const hk = Object.fromEntries(Object.entries(hints0).filter(([, v]) => v != null && typeof v !== "object").slice(0, 40));
      out[id] = { cap: rn.cap, hints: hk, top: R.top.map(rowKey), all: R.all.map((r) => [rowKey(r), r.score, (r.why || []).join("; ")]),
        drop: R.dropped.map((x) => ({ k: rowKey(x), ruled: x.ruled, src: x.src || {} })) };
    } catch (e) { out[id] = { error: String(e.message || e) }; }
  });
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.error("xong", Object.keys(out).length);
