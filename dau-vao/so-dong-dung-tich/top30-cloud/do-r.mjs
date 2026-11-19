// Vòng 4: node do-r.mjs <code> <cn> <runs-doi.json> <out.json>: chạy lại các lượt top 30 cloud khác nhau, ghi mọi dòng bị loại (ruled, src).
// GENBID_DISP_ROUND=1) chỉ trên các lượt HSMT có minDisp / maxDisp (lượt khác không đọc số đông dung tích nên không đổi).
// Mỗi lượt chạy hai lần trong cùng tiến trình: V tắt (GENBID_DISP_ROUND=0, phải trùng gop-nhanh) và V bật. Ghi top / all /
// mọi dòng bị loại vì dung tích kèm src (win, votes, group, vals).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, NH, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const want = new Set(J(NH).ids);
console.error(`lượt có minDisp / maxDisp: ${want.size}`);
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const t0 = Date.now();
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
const pack = (R) => ({
  top: R.top.map(rowKey), topScore: R.top.map((r) => r.score), all: R.all.map((r) => [rowKey(r), r.score]),
  drop: R.dropped.map((x) => ({ k: rowKey(x), e: x.e.key, ruled: x.ruled, src: x.src || {} })),
});
const out = {};
let i = 0;
for (const d of hist) {
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    const id = `${key}#${ri}`;
    if (!rn.cap || !want.has(id)) return;
    if (++i % 20 === 0) console.error(i, `${Math.round((Date.now() - t0) / 1000)} s`);
    try {
      const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
      const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
      const { cat, facts } = catFor(origin, sync, partsOnly, brand);
      const go = () => B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, blocked });
      const fin = pack(go());
      out[id] = { hints: { minDisp: hints0.minDisp ?? null, maxDisp: hints0.maxDisp ?? null }, dispText: text.split(/\n/).filter((l) => /dung t[íi]ch|displacement/i.test(l)).slice(0, 3).map((l) => l.trim().slice(0, 240)), fin };
    } catch (e) { out[id] = { error: String(e.message || e) }; }
  });
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.error("xong", Object.keys(out).length, `${Math.round((Date.now() - t0) / 1000)} s`);
