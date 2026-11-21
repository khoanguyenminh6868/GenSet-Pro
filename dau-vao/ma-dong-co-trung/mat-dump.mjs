// node mat-dump.mjs <thư mục code> <thư mục cn> <tên> → mat-<tên>.json (CHỈ ĐỌC). Như do-gop.mjs (bidhist cục bộ), mỗi lượt: danh tính
// (NCC + băm chữ dòng + đầu phát) của mọi dòng trong R.all, và mọi dòng bị loại với model + luật + src.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const [WT, CN, NAME] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const docs = J("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs;
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
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36); };
const id = (r) => `${r.u.supplierId}|${r.a?.key || ""}|${hash(CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" ")))}`;
const out = {};
let i = 0;
for (const d of hist) {
  if (++i % 100 === 0) console.error(i, "/", hist.length);
  const text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    if (!rn.cap) return;
    try {
      const hints = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
      const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
      const { cat, facts } = catFor(origin, sync, partsOnly, brand);
      const R = B.candidates(cat, rn.cap, hints, { suppliers: sups, origin, cn, sync, facts, blocked });
      const drop = {};
      for (const x of R.dropped) drop[id(x)] = [x.e.model, x.e.make || "", x.ruled, x.src || {}];
      out[`${d.notifyNo}#${ri}`] = { all: R.all.map((r) => [id(r), r.e.model, r.e.make || ""]), drop };
    } catch (e) { out[`${d.notifyNo}#${ri}`] = { error: String(e.message) }; }
  });
}
fs.writeFileSync(path.join(HERE, `mat-${NAME}.json`), JSON.stringify(out));
console.log(`${Object.keys(out).length} lượt → mat-${NAME}.json`);
