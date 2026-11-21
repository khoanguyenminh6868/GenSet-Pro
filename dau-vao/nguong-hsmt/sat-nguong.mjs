// node sat-nguong.mjs <code đã vá dropped kèm why> <thư mục đo> (CHỈ ĐỌC, in màn hình): phân loại mọi dòng ra top 30; dòng bị loại sát ngưỡng (lệch ≤ 1 %);
// dòng vào của IB2400145438#3 có đạt công suất thật 12 kVA không.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, S] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const CN = path.join(WT, "suppliers", "cn");
const docs = J("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const blocked = RF.blockedRows(sups, {}), full = CAT.build(sups), cn = B.cnSuppliers(sups), cache = new Map();
const catFor = (origin, sync, partsOnly, brand) => {
  const k = [origin, !!sync, partsOnly, brand].join("|");
  if (!cache.has(k)) { const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand), cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) }; cache.set(k, { cat, facts: grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups) }); }
  return cache.get(k);
};
const lk = (u) => CAT.keyOf(u.line || (u.lines?.rows || []).join(" "));
const rk = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${lk(r.u)}`, dk3 = (k) => { const p = k.split("|"); return `${p[0]}|${p[1]}|${p.slice(3).join("|")}`; };
const ga = J(path.join(S, "gt-goc.json")), gb = J(path.join(S, "gt-nhanh.json"));
const T = { raTop: 0, loai: 0, day: 0, sat: 0 };
for (const id of Object.keys(gb).sort()) {
  const a = ga[id], b = gb[id], tb = new Set(b.top), sb = new Set(b.all.map((x) => x[0])), ra = a.top.filter((k) => !tb.has(k)), raAll = a.all.map((x) => x[0]).filter((k) => !sb.has(k));
  if (!raAll.length && !ra.length && id !== "IB2400145438#3") continue;
  const [no, ri] = id.split("#"), d = byKey.get(no), text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const rn = (found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }])[+ri];
  const h = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text), partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly, { cat, facts } = catFor(origin, sync, partsOnly, brand);
  const R = B.candidates(cat, rn.cap, h, { suppliers: sups, origin, cn, sync, facts, blocked });
  const why = new Map(); for (const x of R.dropped) { const k = `${x.u.supplierId}|${x.e.key}|${lk(x.u)}`; why.set(k, [...(why.get(k) || []), ...(x.why || [])]); }
  const loai = ra.filter((k) => why.has(dk3(k))).length;
  T.raTop += ra.length; T.loai += loai; T.day += ra.length - loai;
  const near = new Map();
  for (const k of raAll) for (const w of why.get(dk3(k)) || []) {
    const m = w.match(/dung tích ([\d.]+) L < ([\d.]+) L/) || w.match(/Prime ([\d.]+) kVA .*< ([\d.]+) kVA/);
    if (m && +m[1] / +m[2] >= 0.99) { const g = `${k.split("|")[0]} ${R.dropped.find((x) => x.e.key === k.split("|")[1])?.e.model ?? k.split("|")[1]}: ${m[1]} < ${m[2]}`; near.set(g, (near.get(g) || 0) + 1); }
  }
  T.sat += [...near.values()].reduce((x, y) => x + y, 0);
  console.log(`${id}: ra top ${ra.length} (loại ${loai}, đẩy ${ra.length - loai}); sát ngưỡng ≤ 1%: ${[...near.values()].reduce((x, y) => x + y, 0)}`);
  const byModel = {}; for (const [g, n] of near) { const key = g.split(" ").slice(1).join(" "); byModel[key] = (byModel[key] || 0) + n; }
  for (const [g, n] of Object.entries(byModel)) console.log(`    ${g} × ${n}`);
  if (id === "IB2400145438#3") {
    const sa = new Set(a.all.map((x) => x[0])), nw = R.all.filter((r) => !sa.has(rk(r))), p = (r) => r.u.power?.prime?.kVA ?? (r.u.power?.prime?.kW != null ? r.u.power.prime.kW / 0.8 : null);
    const vals = nw.map(p), known = vals.filter((v) => v != null);
    console.log(`    dòng vào ${nw.length}: có prime ${known.length}, prime nhỏ nhất ${Math.min(...known)}, lớn nhất ${Math.max(...known)}, dưới 12 kVA: ${known.filter((v) => v < 12).length}, không ghi prime: ${vals.length - known.length}`);
  }
}
console.log(JSON.stringify(T));
