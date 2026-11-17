// node soi-d10.mjs <worktree> <cn dir> <keys,phẩy> <out.json> : chi tiết top 30 (định dạng cmp-d10.mjs) + dòng bị loại vì nơi SX.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, KEYS, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const hist = Object.values(J("C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa/bidhist.json").docs).map((x) => x.d).filter((d) => d?.config?.text);
const want = new Set(KEYS.split(","));
const full = CAT.build(sups), cn = B.cnSuppliers(sups);
const rowKey = (r) => `${r.u.supplierId}|${r.e.key}|${r.a?.key || ""}|${CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" "))}`;
const out = {};
for (const d of hist) {
  const text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    const key = `${d.notifyNo}#${ri}`;
    if (!want.has(key) || !rn.cap) return;
    const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
    const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
    const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand);
    const cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) };
    const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
    const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts });
    const one = (r) => ({ k: rowKey(r), model: r.e.model, make: r.e.make || "", origin: CAT.originOf(r.e), sup: r.u.supplierId, power: r.u.power, score: Math.round(r.score), why: r.why,
      made: CAT.madeAt ? CAT.madeAt(r.e, r.u) : null });
    out[key] = { cap: rn.cap, origin, bidName: d.bidName, engineMakes: hints0.engineMakes, madeRule: hints0.madeRule || null, top: R.top.map(one),
      madeDropped: R.dropped.filter((x) => x.ruled.includes("made")).map((x) => ({ k: rowKey(x), model: x.e.model, sup: x.u.supplierId, made: CAT.madeAt(x.e, x.u) })) };
  });
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.error("xong", Object.keys(out).length);
