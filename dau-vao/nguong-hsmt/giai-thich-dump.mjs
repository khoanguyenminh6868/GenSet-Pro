// node giai-thich-dump.mjs <thư mục code> <thư mục cn> <bidhist.json> <danh sách lượt.txt> <out.json> (CHỈ ĐỌC)
// Chạy lại candidates đúng như suppliers/do-gop.mjs cho các lượt trong danh sách, ghi thêm LÝ DO loại của từng dòng (ruled), thứ do-gop không ghi.
// Không ghi chữ HSMT: chỉ ngưỡng, khoá dòng, điểm, nhãn lý do. Tệp ra để ở scratchpad.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, BIDHIST, LIST, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const want = new Set(fs.readFileSync(LIST, "utf8").split(/\r?\n/).map((x) => x.trim()).filter(Boolean));
const KEYS = ["minDisp", "maxDisp", "minCyl", "cylExact", "minPrime", "maxFuel", "maxFuel75", "maxFuel50"];
const docs = J(BIDHIST).docs;
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
const dropKey = (r) => `${r.u.supplierId}|${r.e.key}|${lk(r.u)}`;
const out = {};
for (const d of hist) {
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    const id = `${key}#${ri}`;
    if (!rn.cap || !want.has(id)) return;
    const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
    const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
    const { cat, facts } = catFor(origin, sync, partsOnly, brand);
    const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, blocked });
    const drop = {};
    for (const x of R.dropped) { const k = dropKey(x); drop[k] = [...new Set([...(drop[k] || []), ...x.ruled])]; }
    out[id] = { h: Object.fromEntries(KEYS.map((k) => [k, hints0[k] ?? null])), top: R.top.map(rowKey), all: R.all.map((r) => [rowKey(r), r.score, r.ruled || []]), drop };
  });
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`${Object.keys(out).length}/${want.size} lượt → ${OUT}`);
