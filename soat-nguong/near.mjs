// Các dòng bị loại "disp" ở 167 lượt, tỉ lệ dung tích/ngưỡng; node near.mjs [mã: instr|path]
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const WT = "C:/Projects/GenSet Pro/wt-soat-nguong/suppliers";
const B = await import(pathToFileURL(WT + "/" + (process.argv[2] || "_instr.mjs")).href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const W = "C:/Projects/GenSet Pro/genbid-work", KR = W + "/dieu-phoi/kiem-rong/data";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = Object.values(J(W + "/doc-cache/supplier.json").docs).map((x) => x.d).filter((d) => d && d.status !== "incomplete");
const an = Object.fromEntries(Object.entries(J(W + "/doc-cache/analysis.json").docs).map(([k, v]) => [k, (v.d || v).result]).filter(([, r]) => r));
const CM = Object.fromEntries(Object.entries(J(W + "/doc-cache/configmatch.json").docs).map(([k, v]) => [k, v.d.result]));
const text = (k) => { if (fs.existsSync(`${KR}/hc/${k}.json`)) { const h = J(`${KR}/hc/${k}.json`); return [h.text, [h.text]]; } if (fs.existsSync(`${KR}/hsmt-${k}.json`)) { const h = J(`${KR}/hsmt-${k}.json`); return [h.text, h.parts]; } const t = fs.readFileSync(`${W}/specs/${k}/text.txt`, "utf8"); return [t, [t]]; };
const full = CAT.build(sups), cnS = B.cnSuppliers(sups), cache = new Map();
const catFor = (origin, sync, partsOnly, brand) => { const k = [origin, !!sync, partsOnly, brand].join("|"); if (!cache.has(k)) { const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand), cat = { ...full, engines: B.byOrigin(full.engines, origin, cnS, grp) };
  const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cnS) }, sups) : B.modelFacts(cat, sups); cache.set(k, { cat, facts }); } return cache.get(k); };
const DISP_UNIT_L = /\(\s*(?:l|lít|lit)\s*\)|\b(?:litres?|liters?)\b/i, DISP_UNIT_CC = /\(\s*(?:cc|cm\s?[3³]|ml)\s*\)/i;
const dl = (f) => B.litres(DISP_UNIT_L.test(f.label || "") && !/\d\s*(?:cc|cm|ml)/i.test(f.value) ? `${f.value} L` : DISP_UNIT_CC.test(f.label || "") ? `${f.value} cc` : f.value);
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null; const o = J("out.json").filter((r) => !ONLY || ONLY.includes(r.key)), res = [];
for (const r of o) {
  const [t, parts] = text(r.key), a = an[r.key], name = a?.keyInfo?.bidName || "";
  const found = B.sizesOf([a?.keyInfo?.generatorCapacity, name], name);
  const sizing = found.length > 1 && r.i != null ? { size: found[r.i], sizes: found.slice(0, B.MAX_SIZES) } : null;
  const pj = parts.join(""), auto = B.originOfHsmt(pj), origin = auto?.origin || "all", sync = BP.brandSyncOf(t);
  const partsOnly = B.partsOnlyOf(origin, pj), brand = auto?.basis === "brand" && !partsOnly, { cat, facts } = catFor(origin, sync, partsOnly, brand);
  let keep = null; const prev = CM[r.key]; if (prev) { const pr = prev.sizes ? prev.sizes.find((x) => x.cap?.value === r.cap.value || x.kva === r.cap.value)?.result : prev; keep = B.keepOf(pr); }
  const hints = B.hintsOf(t, "", sizing), c = B.candidates(cat, r.cap, hints, { suppliers: sups, origin, cn: cnS, sync, keep, facts });
  if (ONLY && !globalThis.__p) { globalThis.__p = 1; console.log(JSON.stringify(c.dropped[0], (k, v) => (k === "e" || k === "u" || k === "a" ? undefined : v)).slice(0, 600)); }
  const hp = B.plausible(hints, r.cap), min = hp.minDisp;
  const ds = c.dropped.filter((d) => d.ruled.includes("disp")).map((d) => { const fs = [...(facts.get(`engine:${d.e.key}`) || []), ...(d.u.specs || [])].filter((f) => f.key === "disp").map((f) => dl(f)).filter((x) => x != null); return fs.length ? Math.max(...fs) : null; });
  res.push({ key: r.key, i: r.i, cap: r.cap, min, nDisp: ds.length, nDropped: c.dropped.length, ratios: ds.filter((x) => x != null && min).map((x) => x / min), top: c.top.length });
}
fs.writeFileSync((ONLY ? "near-sub.json" : "near.json"), JSON.stringify(res));
const all = res.flatMap((x) => x.ratios);
const bins = [[0.99, 1], [0.97, 0.99], [0.95, 0.97], [0.9, 0.95]];
console.log("lượt", res.length, "dòng loại disp", res.reduce((s, x) => s + x.nDisp, 0), "có tỉ lệ", all.length);
for (const [a, b] of bins) console.log(`${a}–${b}:`, all.filter((x) => x >= a && x < b).length);
process.exit(0);
