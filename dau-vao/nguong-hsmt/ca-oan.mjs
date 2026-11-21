// node ca-oan.mjs <worktree nhánh> <thư mục đo> (CHỈ ĐỌC): chạy candidates của nhánh với ngưỡng ĐÚNG THEO CHỮ HSMT ở các ca đã đọc nguồn, đo số dòng lệch so với nhánh.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, S] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const CASES = [
  ["IB2400377239#0", { minPrime: { kVA: 400 } }, "mất ngưỡng: 'Công suất liên tục tối thiểu 400 kVA'"],
  ["IB2300245748#2", { minPrime: { kVA: 12 } }, "mất ngưỡng: '≥ 12.5 ±0.5 kVA'"],
  ["IB2300046353#1", { minDisp: 1.95 }, "mất ngưỡng: 'dung tích > 1,950 lít'"],
  ["IB2500403535#0", { minCyl: 3 }, "mất ngưỡng: '≥ 3 xilanh'"],
  ["IB2400125924#0", { minPrime: { kVA: 8 } }, "ngưỡng chặt hơn: '≥ 8.5 KVA ± 0.5'"],
  ["IB2300293753#0", { maxDisp: 1.365 }, "ngưỡng chặt hơn: '≤ 1,3 lít ± 5%'"],
];
const CN = path.join(WT, "suppliers", "cn");
const docs = J("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const blocked = RF.blockedRows(sups, {}), full = CAT.build(sups), cn = B.cnSuppliers(sups);
const lk = (u) => CAT.keyOf(u.line || (u.lines?.rows || []).join(" "));
const rowKey = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${lk(r.u)}`;
const ga = J(path.join(S, "gt-goc.json")), gb = J(path.join(S, "gt-nhanh.json"));
for (const [id, over, note] of CASES) {
  const [no, ri] = id.split("#"), d = byKey.get(no), text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName), rn = { cap: found[+ri].cap, sizing: { size: found[+ri], sizes: found } };
  const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text), partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
  const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand), cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) }, facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
  const R = B.candidates(cat, rn.cap, { ...hints0, ...over }, { suppliers: sups, origin, cn, sync, facts, blocked });
  const sb = new Set(gb[id].all.map((x) => x[0])), sr = new Set(R.all.map(rowKey)), tb = new Set(gb[id].top), tr = new Set(R.top.map(rowKey)), ta = ga[id].top.slice(0, 5);
  const bot = [...sb].filter((k) => !sr.has(k)).length, them = [...sr].filter((k) => !sb.has(k)).length;
  console.log(`${id} ${JSON.stringify(over)} | ${note}\n   so với nhánh: all −${bot} +${them}; top −${[...tb].filter((k) => !tr.has(k)).length} +${[...tr].filter((k) => !tb.has(k)).length}; hạng 1–5 gốc: nhánh giữ ${ta.filter((k) => tb.has(k)).length}/5, ngưỡng đúng giữ ${ta.filter((k) => tr.has(k)).length}/5`);
}
