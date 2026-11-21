// #1022 (b): với MỌI dòng đổi điểm, loại thông số động cơ (facts) của động cơ đó theo một bản code, trong đúng nhóm nguồn của lượt.
// node giai-diem.mjs <worktree> <cn> <bidhist.json> <out.json>. Chỉ đọc. Chạy cho gốc và nhánh rồi so bằng so-diem.mjs.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { pathToFileURL } from "node:url";
const [WT, CN, BH, OUT] = process.argv.slice(2), HERE = import.meta.dirname;
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice, J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), Z = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(HERE, f))));
const noAlt = (k) => { const p = k.split("|"); p[2] = ""; return p.join("|"); };
const G = Z("goc.json.gz"), N = Z("nhanh.json.gz"), want = new Map();
for (const [run, g] of Object.entries(G)) {
  const n = N[run]; if (!n?.all || !g?.all) continue;
  const gm = new Map(), nm = new Map();
  for (const [k, s] of g.all) { const x = noAlt(k); if (!gm.has(x) || gm.get(x) < s) gm.set(x, s); }
  for (const [k, s] of n.all) { const x = noAlt(k); if (!nm.has(x) || nm.get(x) < s) nm.set(x, s); }
  const chg = []; for (const [k, s] of gm) if (nm.has(k) && nm.get(k) !== s) chg.push([k, s, nm.get(k)]);
  if (chg.length) want.set(run, chg);
}
const docs = J(BH).docs, sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const full = CAT.build(sups), cn = B.cnSuppliers(sups), cache = new Map();
const factsFor = (o, s, p, b) => { const k = [o, !!s, p, b].join("|"); if (!cache.has(k)) { const grp = B.groupSuppliers(sups, o, !!s, p, b), cat = { ...full, engines: B.byOrigin(full.engines, o, cn, grp) }; cache.set(k, grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, o, cn) }, sups) : B.modelFacts(cat, sups)); } return cache.get(k); };
const out = {}, hist = Object.values(docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
for (const d of hist) {
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const n = found.length > 1 ? Math.min(found.length, B.MAX_SIZES) : 1;
  for (let ri = 0; ri < n; ri++) {
    const run = `${key}#${ri}`, chg = want.get(run); if (!chg) continue;
    const auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text), po = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !po, facts = factsFor(origin, sync, po, brand);
    out[run] = chg.map(([k, a, b]) => [k, a, b, [...new Set((facts.get(`engine:${k.split("|")[1]}`) || []).map((f) => f.key))].sort()]);
  }
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.error("xong", Object.keys(out).length, "lượt,", Object.values(out).reduce((a, x) => a + x.length, 0), "dòng; thiếu lượt", [...want.keys()].filter((r) => !out[r]).length);
