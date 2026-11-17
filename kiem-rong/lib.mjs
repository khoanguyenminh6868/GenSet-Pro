// Thư viện kiểm: nạp mã thật (checkout chính), bản chụp supplier, corpus HSMT. CHỈ ĐỌC; không mạng, không Supabase.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const W = "C:/Projects/GenSet Pro/genbid-work";
const SCR = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/kiem-rong/data"; // bản sao HSMT 12 gói (hsmt-*.json) + 241 gói nhiều cỡ (hc/*.json) lấy từ phiên mins-size (GET chỉ đọc)
export const HERE = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/kiem-rong";
const REAL = pathToFileURL("C:/Projects/GenSet Pro/GenSet-Pro/suppliers/config-bot.mjs").href;
export const B = await import(REAL); // mã thật
export const OLD = await import(pathToFileURL(HERE + "/old/config-bot-oldband.mjs").href); // chỉ khác dải 95–140%
export const INS = await import(pathToFileURL(HERE + "/old/config-bot-instr.mjs").href); // dải hiện tại + lộ giá trị thô của ngưỡng
export const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));

export const loadSuppliers = (f = W + "/doc-cache/supplier.json") => Object.values(J(f).docs).map((x) => x.d).filter((d) => d && d.status !== "incomplete");
export const analyses = () => { const d = J(W + "/doc-cache/analysis.json").docs; return Object.fromEntries(Object.entries(d).map(([k, v]) => [k, (v.d || v).result]).filter(([, r]) => r)); };
export const configmatch = () => Object.fromEntries(Object.entries(J(W + "/doc-cache/configmatch.json").docs).map(([k, v]) => [k, v.d.result]));

// Corpus: key -> { key, src, text, parts, analysis }
export function corpus() {
  const an = analyses(), out = new Map();
  const add = (key, src, text, parts) => { if (!out.has(key) && an[key] && text && text.trim()) out.set(key, { key, src, text, parts: parts || [text], analysis: an[key] }); };
  for (const f of fs.readdirSync(SCR).filter((f) => /^hsmt-IB\d+\.json$/.test(f))) { const h = J(SCR + "/" + f); add(f.slice(5, -5), "full12", h.text, h.parts); }
  for (const f of fs.readdirSync(SCR + "/hc")) { const h = J(SCR + "/hc/" + f); add(f.slice(0, -5), "hc243", h.text, [h.text]); }
  for (const k of fs.readdirSync(W + "/specs")) { const p = `${W}/specs/${k}/text.txt`; if (fs.existsSync(p)) add(k, "specs", fs.readFileSync(p, "utf8")); }
  return out;
}
export const noAnalysis = () => { const an = analyses(); return fs.readdirSync(W + "/specs").filter((k) => fs.existsSync(`${W}/specs/${k}/text.txt`) && !an[k]).length; };

// Các cỡ của gói đúng như run (runAll): sizesOf > 1 -> mỗi cỡ một lượt (tối đa MAX_SIZES); còn lại một lượt với capacity().
export function sizesOfEntry(e) {
  const a = e.analysis, name = a?.keyInfo?.bidName || "";
  const found = B.sizesOf([a?.keyInfo?.generatorCapacity, name], name);
  if (found.length > 1) return { found, runs: found.slice(0, B.MAX_SIZES).map((s, i) => ({ i, cap: s.cap, size: s })) };
  const cap = B.capacity([name, a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
  return { found, runs: [{ i: null, cap, size: null }] };
}

// Dựng catalog như prep (cache theo nhóm origin).
export class Env {
  constructor(sups) {
    this.sups = sups; this.full = CAT.build(sups); this.cn = B.cnSuppliers(sups); this.cache = new Map();
  }
  catFor(origin, sync, partsOnly, brand) {
    const k = [origin, !!sync, partsOnly, brand].join("|");
    if (!this.cache.has(k)) {
      const grp = B.groupSuppliers(this.sups, origin, !!sync, partsOnly, brand);
      const cat = { ...this.full, engines: B.byOrigin(this.full.engines, origin, this.cn, grp) };
      const facts = grp ? B.modelFacts({ ...this.full, engines: B.byOrigin(this.full.engines, origin, this.cn) }, this.sups) : B.modelFacts(cat, this.sups);
      this.cache.set(k, { cat, facts, grp });
    }
    return this.cache.get(k);
  }
  // Mọi thứ prep làm trước candidates(): hints, origin, sync, catalog, rồi candidates của mã thật.
  prep(e, cap, { keep = null, mod = B, hintsFn = B.hintsOf, extra = {} } = {}) {
    const hints0 = hintsFn(e.text, ""), pj = e.parts.join("");
    const auto = B.originOfHsmt(pj), origin = auto?.origin || "all", sync = BP.brandSyncOf(e.text);
    const partsOnly = B.partsOnlyOf(origin, pj), brand = auto?.basis === "brand" && !partsOnly;
    const { cat, facts } = this.catFor(origin, sync, partsOnly, brand);
    const opts = { suppliers: this.sups, origin, cn: this.cn, sync, keep, ...(facts ? { facts } : {}), ...extra };
    const r = mod.candidates(cat, cap, hints0, opts);
    return { hints0, hints: B.plausible(hints0, cap), origin, sync, auto, partsOnly, brand, cat, opts, ...r };
  }
}
export const inNew = (p, cap) => p != null && p >= cap.value * B.NEAR_LOW && p <= cap.value * B.NEAR_HIGH + 1e-9;
export const choiceKey = (r) => `${r.u.supplierId}\n${r.e.key}\n${r.a?.key || (String(r.u.other || "").toLowerCase().replace(/[^a-z0-9]/g, ""))}`;
export const ratioOf = (u, cap) => Object.values(u.power || {}).map((p) => p[cap.unit]).filter((x) => x != null).map((x) => x / cap.value);
// Các dòng qua bộ lọc đầu của candidates() (có line, đúng tần số, đúng nhóm CN) KHÔNG xét dải: để tìm dòng gần nhất ngoài dải.
export function preRows(cat, cap, hints, origin, cn) {
  const out = [];
  for (const e of cat.engines || []) {
    const viaCn = origin === "cn" && CAT.originOf(e) === "other";
    for (const u of e.uses) {
      if ((!u.line && !u.lines) || (hints.freq && u.freq && u.freq !== hints.freq) || (viaCn && !cn.has(u.supplierId))) continue;
      out.push({ e, u });
    }
  }
  return out;
}
export const J2 = J;
export const RAW = { W, SCR };

// ---- Bằng chứng cho một dòng bị loại (mục 5) ----
const litres = (v) => { const n = (String(v ?? "").replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/g) || []).map(Number)[0]; return n == null ? null : n > 100 ? n / 1000 : n; };
const PRIME_RE = /prime|\bprp\b|continuous|\bcop\b|liên tục|常用|主用/i, STANDBY_RE = /standby|stand[\s-]by|\besp\b|\bltp\b|backup|dự phòng|备用/i;
export function evidence(d, hints, facts, cap) {
  const { e, u, ruled } = d, ef = facts.get(`engine:${e.key}`) || [], given = [...ef, ...(u.specs || [])];
  const pick = (key) => given.filter((f) => f.key === key).slice(0, 4).map((f) => ({ v: String(f.value).slice(0, 60), label: f.label, litres: key === "disp" ? litres(f.value) : undefined, sid: f.supplierId, n: f.n, line: String(f.line || "").slice(0, 200), own: u.specs?.includes(f) || undefined }));
  const hdr = (u.header || []).join(" / "), title = u.title || "";
  const bs = given.find((f) => f.key === "bore"), z = given.find((f) => f.key === "cyl");
  const rawLine = u.line || (u.lines?.rows || []).join(" ; ");
  const pw = u.power || {}, kinds = Object.keys(pw);
  const labelled = PRIME_RE.test(hdr) || PRIME_RE.test(rawLine);
  return { sup: u.supplierId, n: u.n, table: u.table, row: u.row, engine: e.model, ek: e.key, make: e.make || null, ruled, min: { disp: hints.minDisp, maxDisp: hints.maxDisp, cyl: hints.minCyl, prime: hints.minPrime },
    line: rawLine.slice(0, 260), header: hdr.slice(0, 260), title: title.slice(0, 100), power: pw, powerKinds: kinds.join("+"), primeLabelled: labelled, standbyLabelled: STANDBY_RE.test(hdr) || STANDBY_RE.test(rawLine),
    disp: pick("disp"), cyl: pick("cyl"), bore: bs ? { v: bs.value, line: String(bs.line || "").slice(0, 120) } : null, calc: !given.some((f) => f.key === "disp") && bs && z, fromSpecs: (u.specs || []).filter((f) => ["disp", "cyl"].includes(f.key)).length };
}
