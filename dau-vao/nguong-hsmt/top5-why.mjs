// node top5-why.mjs <thư mục code ĐÃ vá dropped kèm why> <thư mục đo> > ra màn hình (CHỈ ĐỌC): mọi dòng hạng 1–5 gốc ra khỏi top 30 (gt-top5.tsv):
// dòng bị loại: câu lý do của candidates + chữ dòng NCC; dòng bị đẩy: hạng mới và số dòng mới vào đứng trước nó. Không in chữ HSMT.
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
const ga = J(path.join(S, "gt-goc.json")), gb = J(path.join(S, "gt-nhanh.json"));
const rows = fs.readFileSync(path.join(S, "gt-top5.tsv"), "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const runs = new Map();
for (const r of rows) (runs.get(r[0]) || runs.set(r[0], []).get(r[0])).push(r);
for (const [id, list] of runs) {
  const [no, ri] = id.split("#"), d = byKey.get(no), text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const rn = (found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }])[+ri];
  const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text), partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
  const { cat, facts } = catFor(origin, sync, partsOnly, brand);
  const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, blocked });
  console.log(`\n=== ${id} ${rn.cap.value} ${rn.cap.unit}`);
  const fullKey = new Map(ga[id].all.map((x) => [x[0].split("|").slice(0, 2).join("|") + "|" + x[0].split("|").slice(3).join("|"), x[0]]));
  for (const r of list) {
    const p = r[2].split("|"), k = `${p[0]}|${p[1]}|${p.slice(3).join("|")}`;
    if (r[3] === "bị loại") {
      const x = R.dropped.find((y) => `${y.u.supplierId}|${y.e.key}|${lk(y.u)}`.startsWith(k.slice(0, 130)));
      console.log(`  #${r[1]} ${p[0]} ${x?.e.model ?? p[1]} | LOẠI ${r[4]} | ${(x?.why || []).filter((w) => /<|>|xi lanh|Prime/.test(w)).join("; ").slice(0, 230)}`);
    } else {
      const whole = fullKey.get(k) || r[2], at = gb[id].all.findIndex((y) => y[0].startsWith(whole.slice(0, 130))), sa = new Set(ga[id].all.map((y) => y[0]));
      const before = gb[id].all.slice(0, Math.max(at, 0)), nw = before.filter((y) => !sa.has(y[0])).length;
      const same = gb[id].top.filter((y) => y.split("|")[1] === p[1]).length, sup = gb[id].top.filter((y) => y.split("|")[0] === p[0]).length;
      console.log(`  #${r[1]} ${p[0]} ${p[1]} | ĐẨY: hạng thô ${at + 1}, dòng mới vào đứng trước ${nw}; top có ${same} dòng cùng động cơ, ${sup} dòng cùng NCC`);
    }
  }
}
