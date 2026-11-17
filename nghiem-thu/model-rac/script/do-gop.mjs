// node do-gop.mjs <worktree code> <thư mục cn dữ liệu> <out.json>
// Ứng viên (candidates, không agent) của mọi gói mua sắm máy phát có Chương V, cờ GENBID_SPEC_NORM=1 như bot.
// Khoá dòng không gồm số nguồn n (gộp đổi n của bản giữ lại): NCC | động cơ | đầu phát | dòng.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
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
// Tiếp tục được: mỗi gói xong ghi một dòng vào <out>.part (JSONL); chạy lại thì đọc lại và bỏ qua gói đã có (mất điện chỉ mất gói đang chạy).
const PART = OUT + ".part";
const out = {};
if (fs.existsSync(PART)) for (const l of fs.readFileSync(PART, "utf8").split("\n")) { if (!l.trim()) continue; try { const o = JSON.parse(l); out[o.k] = o.v; } catch {} }
console.error("đã có sẵn", Object.keys(out).length);
let i = 0;
const done = new Set(Object.keys(out));
for (const d of hist) {
  if (++i % 100 === 0) console.error(i);
  if (Object.keys(out).some((k) => k.startsWith(`${d.notifyNo}#`))) continue;
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    if (!rn.cap) return;
    try {
      const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
      const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
      const { cat, facts } = catFor(origin, sync, partsOnly, brand);
      const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts });
      out[`${key}#${ri}`] = { top: R.top.map(rowKey), topMake: R.top.map((r) => r.e.make || ""), all: R.all.length, dropped: R.dropped.length };
    } catch (e) { out[`${key}#${ri}`] = { error: String(e.message || e) }; }
  });
  for (const k of Object.keys(out)) if (k.startsWith(`${d.notifyNo}#`) && !done.has(k)) { done.add(k); fs.appendFileSync(PART, JSON.stringify({ k, v: out[k] }) + "\n"); }
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.error("xong", Object.keys(out).length);
