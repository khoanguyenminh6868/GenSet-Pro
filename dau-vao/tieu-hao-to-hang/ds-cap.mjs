// Mọi cặp (lượt, NCC, động cơ) dùng số tiêu hao tờ hãng ở candidates: chạy thật bằng code nhánh. Chỉ in số. node ds-cap.mjs <worktree> <bidhist> <out.md>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, BH, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href), RF = await import(pathToFileURL(path.join(WT, "suppliers", "row-flags-lib.mjs")).href), CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice, J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const CN = path.join(WT, "suppliers", "cn"), sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete"), blocked = RF.blockedRows(sups, {}), full = CAT.build(sups), cn = B.cnSuppliers(sups), cache = new Map();
const catFor = (o, s, p, b) => { const k = [o, !!s, p, b].join("|"); if (!cache.has(k)) { const grp = B.groupSuppliers(sups, o, !!s, p, b), cat = { ...full, engines: B.byOrigin(full.engines, o, cn, grp) }; cache.set(k, { cat, facts: grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, o, cn) }, sups) : B.modelFacts(cat, sups) }); } return cache.get(k); };
const LOADS = [["fuel_consumption", "fuel", "maxFuel", "100%"], ["fuel_consumption_75", "fuel75", "maxFuel75", "75%"], ["fuel_consumption_50", "fuel50", "maxFuel50", "50%"]];
const sheetOf = (ef) => { const o = {}; for (const [code, key] of LOADS) { const c = { checks: [], engine: {} }; B.fuelChecks(c, [{ code, item: key, requirement: "≤ 999 L/h", quote: "" }], { specs: [] }, ef); const x = c.checks.find((y) => y.rule === "to-hang-tieu-hao"); if (x) o[key] = parseFloat(x.offered); } return o; };
const own = (u, key, load) => (u.specs || []).filter((y) => y.key === key).some((y) => { const r = globalThis.GenbidSpecNorm?.normalize ? null : null; return /l\s*\/\s*h|l\/hr|lph/i.test(`${y.label} ${y.value} ${y.unitCell || ""}`) && B.fuelAt(y, load) != null; });
const hist = Object.values(J(BH).docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text), rows = [], seen = new Set();
const pctLoad = { fuel: 100, fuel75: 75, fuel50: 50 };
for (const d of hist) {
  const text = d.config.text, kv = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kv, d.bidName], d.bidName), rs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kv]), sizing: null }];
  rs.forEach((rn, ri) => {
    if (!rn.cap) return; const h = B.hintsOf(text, "", rn.sizing); if (![h.maxFuel, h.maxFuel75, h.maxFuel50].some((x) => x != null)) return;
    const auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text), po = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !po, { cat, facts } = catFor(origin, sync, po, brand);
    if (!cat.engines.some((e) => e.model === "6M31G825/5")) return;
    const R = B.candidates(cat, rn.cap, h, { suppliers: sups, origin, cn, sync, facts, blocked }), run = `${d.notifyNo}#${ri}`, top = new Set(R.top.map((x) => x.u));
    for (const x of [...R.all, ...R.dropped]) {
      if (x.e?.model !== "6M31G825/5" || x.u.supplierId === "baudouin" && false) continue; const id = `${run}|${x.u.supplierId}`, sh = sheetOf(facts.get(`engine:${x.e.key}`) || []), parts = [];
      for (const [, k, hk, lab] of LOADS) if (h[hk] != null && sh[k] != null && !own(x.u, k, pctLoad[k])) parts.push({ lab, lim: h[hk], v: sh[k], over: sh[k] > h[hk] });
      if (!parts.length || seen.has(id)) continue; seen.add(id);
      rows.push({ run, sup: x.u.supplierId, parts, over: parts.some((p) => p.over), dropped: R.dropped.includes(x), inTop: top.has(x.u), named: !!x.named, ruled: x.ruled || [], lim: { cap: rn.cap.value, minCyl: h.minCyl, exact: h.cylExact, layout: h.cylLayout, minDisp: h.minDisp, maxDisp: h.maxDisp, freq: h.freq, minPrime: h.minPrime }, pw: x.u.power?.prime, line: String(x.u.line || (x.u.lines?.rows || [])[0] || "").slice(0, 90) });
    }
  });
}
rows.sort((a, b) => a.run.localeCompare(b.run) || a.sup.localeCompare(b.sup));
const md = ["| Lượt | NCC | Động cơ | Ngưỡng HSMT (L/h) | Số tờ hãng (L/h) | Kết quả |", "|---|---|---|---|---|---|", ...rows.map((r) => `| ${r.run} | ${r.sup} | 6M31G825/5 | ${r.parts.map((p) => `${p.lab} ≤ ${p.lim}`).join("; ")} | ${r.parts.map((p) => `${p.lab} ${p.v}`).join("; ")} | ${r.over ? "vượt" : "đạt"}${r.dropped ? ", loại" : ""}${r.named ? ", HSMT nêu" : ""} |`)].join("\n");
fs.writeFileSync(OUT, md); console.log(`cặp ${rows.length} | đạt ${rows.filter((r) => !r.over).length} | vượt ${rows.filter((r) => r.over).length} | vượt mà không bị loại ${rows.filter((r) => r.over && !r.dropped).length} | đạt mà bị loại ${rows.filter((r) => !r.over && r.dropped).length}`); console.log(md);
console.log("\n== Đạt tiêu hao mà bị loại");
for (const r of rows.filter((y) => !y.over && y.dropped)) console.log(r.run, r.sup, "luật", r.ruled.join(",") || "(không ghi)", JSON.stringify(r.lim), "prime", JSON.stringify(r.pw), "|", r.line);
const c = new Map(); for (const r of rows.filter((y) => !y.over && y.dropped)) { const k = r.ruled.join(",") || "(không ghi)"; c.set(k, (c.get(k) || 0) + 1); } console.log("Theo luật:", JSON.stringify([...c]));
console.log("Vượt mà luật không có fuel*:", rows.filter((y) => y.over && !y.ruled.some((x) => /^fuel/.test(x))).length);
