// HSMT đòi gì ở đầu phát: đếm trên MỌI gói có Phân tích (doc-cache\analysis.json, technicalSpecs) + chữ HSMT (genbid-work\specs).
// node hsmt.mjs <gốc repo> [analysis.json] [thư mục specs]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(process.argv[2] || ".");
const anaFile = process.argv[3] || "C:/Projects/GenSet Pro/genbid-work/doc-cache/analysis.json";
const specsDir = process.argv[4] || "C:/Projects/GenSet Pro/genbid-work/specs";
const RC = await import(pathToFileURL(path.join(root, "suppliers", "reqcodes.mjs")).href);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const BP = globalThis.GenbidBidprice;

const A = JSON.parse(fs.readFileSync(anaFile, "utf8"));
const all = A[Object.keys(A)[0]];
const ALT_ITEM = /đ[ầa]u\s*ph[áa]t|c[ủu]\s*ph[áa]t|alternator|m[áa]y\s*ph[áa]t\s*đi[ệe]n\s*xoay\s*chi[ềe]u/i;
const per = new Map(), pk = (c) => per.get(c) || per.set(c, new Set()).get(c);
let pkgs = 0, withAlt = 0;
const detail = [];
const hit = { kva: 0, insH: 0, insF: 0, pmg: 0, arep: 0, pmgOrArep: 0, selfExc: 0, sc300: 0, vreg: [], makeNamed: 0, makeNamedEq: 0, makes: {}, avrModel: 0, brushless: 0 };
for (const [key, v] of Object.entries(all)) {
  const r = v?.d?.result;
  const ts = r?.technicalSpecs || [];
  if (!ts.length) continue;
  const name = r?.keyInfo?.name || r?.keyInfo?.bidName || r?.summary || "";
  pkgs++;
  const alt = ts.filter((t) => ALT_ITEM.test(`${t.item || ""}`));
  if (!alt.length) continue;
  withAlt++;
  const codes = new Set();
  for (const t of alt) codes.add(RC.codeOf({ item: t.item, requirement: t.requirement, part: "alternator" }));
  for (const c of codes) pk(c).add(key);
  const T = alt.map((t) => `${t.item}: ${t.requirement} | ${t.quote}`).join("\n");
  const o = { key, codes: [...codes] };
  if (/(\d[\d.,]*)\s*kVA/i.test(T) && /c[ôo]ng\s*su[ấa]t/i.test(T)) { hit.kva++; o.kva = true; }
  if (/c[ấa]p\s*(c[áa]ch\s*đi[ệe]n|nhi[ệe]t)?[^\n]{0,20}\bH\b|class\s*H\b|c[ấa]p\s*H\b/i.test(T)) { hit.insH++; o.ins = "H"; }
  else if (/c[ấa]p\s*(c[áa]ch\s*đi[ệe]n|nhi[ệe]t)?[^\n]{0,20}\bF\b|class\s*F\b|c[ấa]p\s*F\b/i.test(T)) { hit.insF++; o.ins = "F"; }
  const pmg = /\bPMG\b|nam\s*ch[âa]m\s*v[ĩi]nh\s*c[ửu]u|permanent\s*magnet/i.test(T), arep = /\bAREP\b/i.test(T);
  if (pmg) hit.pmg++; if (arep) hit.arep++; if (pmg || arep) { hit.pmgOrArep++; o.exc = [pmg && "PMG", arep && "AREP"].filter(Boolean).join("+"); }
  if (/t[ựu]\s*k[íi]ch|self[\s-]*excit/i.test(T)) { hit.selfExc++; o.self = true; }
  if (/ch[ổo]i\s*than|brushless/i.test(T)) hit.brushless++;
  if (/300\s*%|3\s*x?\s*I\s*n\b|ng[ắa]n\s*m[ạa]ch\s*duy\s*tr[ìi]|sustained\s*short/i.test(T)) { hit.sc300++; o.sc = true; }
  const vr = [...T.matchAll(/±\s*(\d+(?:[.,]\d+)?)\s*%/g)].map((m) => Number(m[1].replace(",", ".")));
  if (vr.length && codes.has("alt_vreg")) { const m = Math.min(...vr); hit.vreg.push(m); o.vreg = m; }
  const mk = [...T.matchAll(/\b(Stamford|Leroy[\s-]*Somer|Mecc[\s-]*Alte|Marathon|AvK|Siemens|WEG|Linz|Sincro|Engga|Faraday)\b/gi)].map((m) => m[1].replace(/\s+/g, " ").toLowerCase());
  if (mk.length) { hit.makeNamed++; if (/t[ưư][ơo]ng\s*đ[ưư][ơo]ng|equivalent/i.test(T)) hit.makeNamedEq++; for (const x of new Set(mk)) hit.makes[x] = (hit.makes[x] || 0) + 1; o.makes = [...new Set(mk)]; }
  if (/\b(SX460|AS440|MX341|MX321|DM110|D350|D550|R250|R450|R438|DSR|DER1)\b/i.test(T)) { hit.avrModel++; }
  // Xuất xứ đầu phát theo chữ HSMT (partOriginOfHsmt)
  const f = path.join(specsDir, key, "text.txt");
  if (fs.existsSync(f)) {
    try { const po = CB.partOriginOfHsmt(fs.readFileSync(f, "utf8")); if (po?.alternator) o.altOrigin = po.alternator.basis; } catch {}
  }
  detail.push(o);
}
const altOrigin = detail.filter((d) => d.altOrigin).reduce((m, d) => ((m[d.altOrigin] = (m[d.altOrigin] || 0) + 1), m), {});
const codes = [...per.entries()].map(([c, s]) => [c, s.size]).sort((a, b) => b[1] - a[1]);
const vb = (lo, hi) => hit.vreg.filter((x) => x > lo && x <= hi).length;
const sum = { pkgs, withAlt, codes, hit: { ...hit, vreg: { n: hit.vreg.length, "≤0.25": vb(-1, 0.25), "≤0.5": vb(0.25, 0.5), "≤1": vb(0.5, 1), "≤1.5": vb(1, 1.5), ">1.5": vb(1.5, 99) } }, altOrigin };
fs.writeFileSync("hsmt.json", JSON.stringify({ ...sum, detail }, null, 1));
console.log(JSON.stringify(sum, null, 1));
