// node gopRow.mjs <worktree code> <thư mục cn> <out.json> <khoá lượt,khoá lượt…>: như do-gop.mjs nhưng chỉ các lượt nêu, và ghi cho
// TỪNG dòng (top / all / dropped): điểm, lý do, luật loại. So hai bản bằng gopRowCmp.cjs.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, OUT, KEYS] = process.argv.slice(2);
const want = new Set(KEYS.split(","));
process.env.GENBID_SPEC_NORM = "1";
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
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
const lk = (r) => `${r.u.supplierId}|${CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" "))}`;
const out = {};
for (const d of hist) {
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    if (!rn.cap || !want.has(`${key}#${ri}`)) return;
    const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
    const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
    const { cat, facts } = catFor(origin, sync, partsOnly, brand);
    const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts });
    const rows = {};
    R.dropped.forEach((r) => { rows[lk(r)] = { st: "dropped", eng: r.e.key, make: r.e.make || "", ruled: r.ruled }; });
    R.all.forEach((r, i) => { rows[lk(r)] = { st: "all", i, eng: r.e.key, make: r.e.make || "", score: r.score, why: r.why, ruled: r.ruled }; });
    R.top.forEach((r, i) => { rows[lk(r)].st = "top"; rows[lk(r)].ti = i; });
    out[`${key}#${ri}`] = { cap: rn.cap, hints: hints0, origin, rows };
  });
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.error("xong", Object.keys(out).length);
