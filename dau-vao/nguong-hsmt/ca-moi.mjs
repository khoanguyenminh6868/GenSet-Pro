// node ca-moi.mjs <worktree nhánh> <thư mục đo> (CHỈ ĐỌC, in màn hình): đọc nguồn các ca nghi và đo hệ quả nếu đặt ngưỡng đúng theo chữ HSMT. Không sửa mã.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, S] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const hb = J(path.join(S, "hl-nhanh.json")), ha = J(path.join(S, "hl-goc.json"));
const CN = path.join(WT, "suppliers", "cn");
const docs = J("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const runOf = (id) => {
  const [no, ri] = id.split("#"), d = byKey.get(no), kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const rn = (found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }])[+ri];
  return { d, found, rn, text: d.config.text };
};
console.log("=== Đọc nguồn");
for (const [id, re] of [["IB2300349583#0", /ti[êe]u\s*(hao|th[ụu])/i], ["IB2200020538#0", /ti[êe]u\s*(hao|th[ụu])/i], ["IB2300032777#1", /x[iy]\s*-?\s*lanh/i], ["IB2500531255#2", /x[iy]\s*-?\s*lanh/i], ["IB2200066148#0", /x[iy]\s*-?\s*lanh/i], ["IB2300108940#0", /dung\s*t[íi]ch/i]]) {
  const { text } = runOf(id);
  console.log(`--- ${id} goc ${JSON.stringify(ha[id]?.eff)}\n    nhánh ${JSON.stringify(hb[id]?.eff)}`);
  for (const l of B.technicalPart(text).split("\n")) if (re.test(l) && /\d/.test(l)) { const m = l.search(re); console.log(`   ${l.slice(0, 30).trim()} … ${l.slice(Math.max(0, m - 15), m + 210).trim()}`); }
}
for (const id of ["IB2400377239#0", "IB2300245748#2", "IB2300046353#1", "IB2500403535#0", "IB2400125924#0", "IB2300293753#0", "IB2300296794#0"]) {
  const { rn, text } = runOf(id), h = B.plausible(B.hintsOf(text, "", rn.sizing), rn.cap);
  console.log(`6 ca ${id}: minPrime ${JSON.stringify(h.minPrime)} minDisp ${h.minDisp} maxDisp ${h.maxDisp} minCyl ${h.minCyl} exact ${h.cylExact}`);
}
console.log("\n=== Hệ quả nếu đặt đúng");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const blocked = RF.blockedRows(sups, {}), full = CAT.build(sups), cn = B.cnSuppliers(sups);
const lk = (u) => CAT.keyOf(u.line || (u.lines?.rows || []).join(" "));
const rk = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${lk(r.u)}`;
for (const [id, fix] of [["IB2300046353#1", { minCyl: 4, cylExact: true }], ["IB2300349583#0", { maxFuel75: 5.5 }]]) {
  const { rn, text } = runOf(id), h0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text), partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
  const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand), cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) };
  const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
  const run = (h) => B.candidates(cat, rn.cap, h, { suppliers: sups, origin, cn, sync, facts, blocked });
  const X = run(h0), Y = run({ ...h0, ...fix });
  const xa = new Set(X.all.map(rk)), ya = new Set(Y.all.map(rk)), xt = new Set(X.top.map(rk)), yt = new Set(Y.top.map(rk));
  console.log(`${id} ${JSON.stringify(fix)}: all ${xa.size} → ${ya.size}; dòng lọt sai ${[...xa].filter((k) => !ya.has(k)).length}, loại oan ${[...ya].filter((k) => !xa.has(k)).length}; top 30 khác ${[...xt].filter((k) => !yt.has(k)).length} chỗ; hạng 1–5 nhánh: ${X.top.slice(0, 5).map((r) => (yt.has(rk(r)) ? "giữ" : `RA ${r.u.supplierId} ${r.e.model}`)).join(", ")}`);
}
