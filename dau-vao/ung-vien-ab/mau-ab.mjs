// MẪU (không phải toàn bộ): top 30 ứng viên của 1/STEP gói máy phát trong bidhist, bốn bản trên cùng code nhánh:
// off (A=0,B=0, = main), A, B, AB. Chạy: node mau-ab.mjs <worktree> <bidhist.json> <out.json> [STEP] [OFFSET]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, BH, OUT, STEP = "10", OFF = "0"] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const CN = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const blocked = RF.blockedRows(sups, {});
const docs = J(BH).docs;
const hist = Object.values(docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text)
  .sort((a, b) => String(a.notifyNo).localeCompare(String(b.notifyNo))).filter((_, i) => i % Number(STEP) === Number(OFF));
console.error(`mẫu: ${hist.length} gói (1/${STEP}, lệch ${OFF})`);
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
// Khoá dòng KHÔNG có đầu phát (suppliers/CLAUDE.md: khoá có đầu phát đổi khi dòng không đổi).
const rowKey = (r) => `${r.u.supplierId}|${r.e.key}|${CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" "))}`;
const V = { off: ["0", "0"], A: ["1", "0"], B: ["0", "1"], AB: ["1", "1"] };
const out = {};
let i = 0;
const t0 = Date.now();
for (const d of hist) {
  if (++i % 10 === 0) console.error(i, Math.round((Date.now() - t0) / 1000) + "s");
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    if (!rn.cap) return;
    const o = {};
    try {
      const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
      const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
      const { cat, facts } = catFor(origin, sync, partsOnly, brand);
      o.origin = origin; o.cap = rn.cap;
      for (const [v, [a, b]] of Object.entries(V)) {
        process.env.GENBID_CAND_A = a; process.env.GENBID_CAND_B = b;
        const R = B.candidates(cat, rn.cap, hints0, { suppliers: sups, origin, cn, sync, facts, blocked });
        o[v] = R.top.map((r) => [rowKey(r), r.score, r.e.make || "", r.e.model, r.why.includes("động cơ có datasheet hãng") ? 1 : 0]);
      }
    } catch (e) { o.error = String(e.stack || e); }
    out[`${key}#${ri}`] = o;
  });
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.error("xong", Object.keys(out).length, Math.round((Date.now() - t0) / 1000) + "s");
