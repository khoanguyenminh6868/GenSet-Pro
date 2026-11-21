// node explain.mjs <code dir> <cn dir> <bidhist.json> <runs.json> <out.json>
// Chạy lại candidates (y phần tính của suppliers/do-gop.mjs) cho các lượt trong runs.json; ghi ngưỡng của gói và MỌI dòng (top / all / dropped)
// kèm điểm, `ruled`, `src`. Không ghi chữ HSMT ra tệp.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, BIDHIST, RUNS, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const lib = path.join(WT, "suppliers", "row-flags-lib.mjs");
const RF = fs.existsSync(lib) ? await import(pathToFileURL(lib).href) : null;
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const want = new Set(J(RUNS));
const docs = J(BIDHIST).docs;
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const blocked = RF ? RF.blockedRows(sups, {}) : null;
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
const rowKey = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" "))}`;
const clean = (src) => JSON.parse(JSON.stringify(src || {}, (k, v) => (v instanceof Set ? [...v] : v)));
const out = {};
for (const d of hist) {
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    const id = `${key}#${ri}`;
    if (!want.has(id) || !rn.cap) return;
    const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
    const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
    const { cat, facts } = catFor(origin, sync, partsOnly, brand);
    const h = B.plausible(hints0, rn.cap);
    const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, ...(blocked ? { blocked } : {}) });
    out[id] = {
      cap: rn.cap, minDisp: h.minDisp ?? null, maxDisp: h.maxDisp ?? null, minCyl: h.minCyl ?? null,
      top: R.top.map(rowKey), all: R.all.map((r) => [rowKey(r), r.score]),
      dropped: R.dropped.map((x) => ({ k: rowKey(x), ruled: x.ruled, src: clean(x.src) })),
    };
  });
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.error("xong", Object.keys(out).length, "/", want.size);
