// Nguồn của khoá bị loại (bảng, tiêu đề, why) theo NCC + soi 134 khoá vào top có chữ khí/xăng lọt không + IB2200012797#0.
import fs from "node:fs"; import path from "node:path"; import zlib from "node:zlib"; import { pathToFileURL } from "node:url";
const WT = "C:/Projects/GenSet Pro/wt-khi-fuel", OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/may-khi";
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const G = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(OUT, "top30-cloud-2", f))));
const goc = G("gop-goc.json.gz"), nhanh = G("gop-nhanh.json.gz");
const CN = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const full = CAT.build(sups), alts = new Map((full.alternators || []).map((a) => [a.key, a]));
const rowInfo = new Map();
for (const e of full.engines) for (const u of e.uses) {
  if (!u.line && !u.lines) continue;
  const a = u.other ? B.altOf(alts, u.other) : null;
  const k = `${u.supplierId}|${e.key}|${a?.key || ""}|${CAT.keyOf(u.line || (u.lines?.rows || []).join(" "))}`;
  const v = rowInfo.get(k) || []; v.push({ u, e }); rowInfo.set(k, v);
}
const supById = new Map(sups.map((s) => [s.id, s]));
const urlOf = (u) => ((supById.get(u.supplierId)?.sources || []).find((x) => x.n === u.n) || {}).url || "";
// 1) khoá loại: nguồn theo NCC
const removed = new Set();
for (const [l, g] of Object.entries(goc)) { const n = nhanh[l]; if (!n) continue; const Bn = new Set(n.all.map((x) => x[0])); for (const [k] of g.all) if (!Bn.has(k)) removed.add(k); }
const per = new Map();
for (const k of removed) for (const { u } of rowInfo.get(k) || []) {
  const ncc = u.supplierId, id = `n${u.n}`; const m = per.get(ncc) || new Map();
  const x = m.get(id) || { keys: new Set(), title: u.title || "", url: urlOf(u), fuel: u.fuel, from: u.fuelFrom, why: u.fuelWhy, ex: u.line || "" };
  x.keys.add(k); m.set(id, x); per.set(ncc, m);
}
const L = [];
for (const [ncc, m] of [...per].sort()) { L.push(`## ${ncc}`); for (const [id, x] of m) L.push(`- ${id} | ${x.keys.size} khoá | fuel=${x.fuel}/${x.from} | tiêu đề: ${x.title.slice(0, 110)} | URL: ${x.url.slice(0, 120)} | why: ${(x.why || "").slice(0, 200)}`); }
fs.writeFileSync(path.join(OUT, "4-nguon-bang.md"), L.join("\n") + "\n");
// 2) khoá vào top: soi chữ khí / xăng trong tiêu đề, URL, dòng, mã
const GW = /\bgas\b|natural|\bng\b|lpg|biogas|gasoline|petrol|燃气|天然气|沼气|汽油|\bcng\b|methane/i;
const ent = new Set();
for (const [l, g] of Object.entries(goc)) { const n = nhanh[l]; if (!n) continue; const gt = new Set(g.top); for (const k of n.top) if (!gt.has(k)) ent.add(k); }
const E = [`# 134 khoá vào top: soi chữ khí / xăng`];
const sus = [];
for (const k of [...ent].sort()) {
  const hit = rowInfo.get(k) || [];
  if (!hit.length) { E.push(`- ${k.slice(0, 80)} | KHÔNG TÌM THẤY`); continue; }
  const { u, e } = hit[0];
  const blob = [u.title, urlOf(u), u.line, ...(u.lines?.rows || []), e.model, u.genset].filter(Boolean).join(" ");
  const m = blob.match(GW);
  const rec = `${u.supplierId} n${u.n} | engine ${e.model} | fuel=${u.fuel || "-"} | ${(u.title || "").slice(0, 70)} | ${urlOf(u).slice(0, 90)}`;
  E.push(`- ${m ? "NGHI[" + m[0] + "] " : ""}${rec}`);
  if (m) sus.push(rec + " | " + (blob.match(new RegExp(".{0,30}" + m[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ".{0,30}", "i")) || [""])[0].replace(/\s+/g, " "));
}
E.push(`\nNGHI: ${sus.length}`); for (const s of sus) E.push("  " + s);
fs.writeFileSync(path.join(OUT, "4-vao-top-soi.md"), E.join("\n") + "\n");
// 3) IB2200012797#0
const d = Object.values(J("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs).map((x) => x.d).find((x) => x && x.notifyNo === "IB2200012797");
const t = B.technicalPart(d.config.text), fh = B.fuelOfHsmt(t);
const g = goc["IB2200012797#0"], n = nhanh["IB2200012797#0"];
const gl = g.all.filter((x) => x[0].includes("LT620")), nl = new Set(n.all.map((x) => x[0]));
const V = [`IB2200012797#0 | bidName: ${d.bidName} | fuelOfHsmt: ${JSON.stringify(fh)}`, `LT620 rows gốc: ${gl.length}, còn ở nhánh: ${gl.filter((x) => nl.has(x[0])).length}`];
for (const [k, sc] of gl) { const h = rowInfo.get(k) || []; const u = h[0]?.u; V.push(`${sc}\t${k.slice(0, 70)}\tfuel=${u?.fuel}/${u?.fuelFrom}\t${(u?.fuelWhy || "").slice(0, 150)}\tn=${u?.n} ${(u?.title || "").slice(0, 60)}\t${nl.has(k) ? "CÒN" : "LOẠI"}`); }
const kw = [...t.matchAll(/.{0,60}(nhiên liệu|diesel|dầu|xăng|khí gas|khí tự nhiên|gas|động cơ).{0,60}/gi)].slice(0, 12).map((m) => m[0].replace(/\s+/g, " "));
V.push("--- trích HSMT ---", ...kw);
fs.writeFileSync(path.join(OUT, "4-ib12797.txt"), V.join("\n") + "\n");
console.log(V.join("\n")); console.log("---"); console.log(E.slice(-Math.min(E.length, 40)).join("\n"));
