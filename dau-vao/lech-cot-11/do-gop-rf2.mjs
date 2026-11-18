// node do-gop-rf.mjs <worktree code> <thư mục cn dữ liệu> <out.json>
// Như genbid-test/lc8/do-gop.mjs (ứng viên mọi gói lịch sử có Chương V, không agent), thêm: nhánh có row-flags-lib.mjs thì
// truyền blocked = blockedRows(sups, {}) (rowok rỗng); ghi cả `all` (khoá + điểm) và dòng bị loại vì rowflag.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const lib = path.join(WT, "suppliers", "row-flags-lib.mjs");
const RF = fs.existsSync(lib) ? await import(pathToFileURL(lib).href) : null;
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const t0 = Date.now();
const blocked = RF ? RF.blockedRows(sups, {}) : null;
console.error(`blocked: ${blocked ? blocked.size : "không có"} (${Date.now() - t0} ms)`);
const hist = Object.values(J(`${SNAP}/bidhist.json`).docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
console.error(`gói: ${hist.length}, NCC: ${sups.length}`);
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
let i = 0;
for (const d of hist) {
  if (++i % 100 === 0) console.error(i);
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    if (!rn.cap) return;
    try {
      const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
      const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
      const { cat, facts } = catFor(origin, sync, partsOnly, brand);
      const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, ...(blocked ? { blocked } : {}) });
      out[`${key}#${ri}`] = {
        top: R.top.map(rowKey), topScore: R.top.map((r) => r.score), all: R.all.map((r) => [rowKey(r), r.score]),
        dropped: R.dropped.length, ruledFreq: R.dropped.filter((x) => x.ruled.includes("freq")).map((x) => rowKey(x)), ruledAll: R.dropped.map((x) => [rowKey(x), x.ruled.join(",")]), rowflag: R.dropped.filter((x) => x.ruled.includes("rowflag")).map((x) => `${x.u.supplierId}|${x.e.key}|${CAT.keyOf(x.u.line || (x.u.lines?.rows || []).join(" "))}`),
      };
    } catch (e) { out[`${key}#${ri}`] = { error: String(e.message || e) }; }
  });
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.error("xong", Object.keys(out).length, `${Math.round((Date.now() - t0) / 1000)} s`);
