// "Gợi ý" in the Cấu hình gợi ý tab, run on the Windows PC next to the GenBid bot:
//   node suppliers/config-bot.mjs run            answer every pending configreq/<TBMT> (one Claude agent per request)
//                                                and findreq/<TBMT> (Tìm NCC: Claude, find-prompt.md;
//                                                the suppliers it adds go into configmatch/<TBMT> in code, no agent)
//                                                and bidpricereq/<TBMT> (Gợi ý giá đấu, bidprice-bot.mjs)
//   node suppliers/config-bot.mjs merge-find --key <TBMT>          do that again from the stored findmatch
//   node suppliers/config-bot.mjs find-check --dir <dir>          check newCatalog.json of a Tìm NCC folder in code
//   node suppliers/config-bot.mjs prep --key <TBMT> --out <dir>
//   node suppliers/config-bot.mjs save --dir <dir> --url <url>     (used by the agent for internet sources)
//   node suppliers/config-bot.mjs check --dir <dir>                verify result.json in code (prints what failed)
//   node suppliers/config-bot.mjs post --dir <dir> --key <TBMT> --requested-at <iso>
// Data is read from and written to the web (Vercel API) with the ingest token, which is never printed.
// The agent (claude -p, Opus, with WebSearch) follows config-prompt.md. check marks every quote or number the code
// cannot find word for word in the HSMT text, the catalog row or a saved web page as unverified, and turns such a
// "met" into "unclear" (Khoa, 2026-10-28: the answer must be exactly right). A value may be converted (kW ↔ kVA,
// L/h ↔ g/kWh...) only with a formula of web/conversions.js, which check recomputes; each configuration also names
// the suppliers in the system that sell it, each checked against that supplier's own table row (Khoa, 2026-10-29).
// "Xuất xứ" (configreq origin: cn, default / g7 / g20 / other / all) limits the engines to Chinese makes (or any make a
// supplier based in China offers, Khoa 2026-11-02), to makes of a G7 / G20
// country (catalog.js ENGINE_COUNTRY, Khoa 2026-11-02) or to foreign ones
// (web/catalog.js originOf); check drops a configuration whose engine is of the other origin (Khoa, 2026-10-29).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { norm } from "./verify.mjs";
import { htmlToText } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = fileURLToPath(import.meta.url);
const WEB = process.env.GENBID_WEB || "https://genset-pro-web.vercel.app";
const TOKEN_FILE = process.env.GENBID_INGEST_TOKEN_FILE || "C:/Projects/GenSet Pro/.genbid-ingest-token";
const CLAUDE = process.env.GENBID_CLAUDE || "claude";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const arg = (k, d = "") => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const token = () => fs.readFileSync(TOKEN_FILE, "utf8").trim();
const numbersIn = (s) => (norm(s).replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);
// Also reads "0,8" as 0.8 (Vietnamese decimal comma).
const numbersLoose = (s) => [...numbersIn(s), ...numbersIn(String(s ?? "").replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2"))];
await import(pathToFileURL(path.join(ROOT, "..", "web", "conversions.js")).href);
const CONV = globalThis.GenbidConversions;
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const CAT = globalThis.GenbidCatalog;
export const ORIGIN = { cn: "Trung Quốc", g7: "G7 (Mỹ, Anh, Đức, Pháp, Ý, Nhật, Canada)", g20: "G20 (các nước thành viên trừ Trung Quốc)", other: "Khác (không phải Trung Quốc)", all: "Tất cả" };
const GROUP_ORIGIN = new Set(["g7", "g20"]);
const PARTS = ["engine", "alternator", "genset", "controller"];
const originOfReq = (o) => (ORIGIN[o] ? o : "cn");
const extraOf = (req) => String(req?.extra || "").trim().slice(0, 2000);
// The requirements read last time are used again only when the HSMT, Yêu cầu khác and the way they are read are the
// same: REQ_VERSION goes up when config-prompt.md changes how requirements are written (e.g. the grouped controller
// functions of 2026-11-03), so older lists are read again once.
export const REQ_VERSION = 2;
export const reqHashOf = (text, extra) => createHash("sha1").update(`${text}\n--extra--\n${extra || ""}${REQ_VERSION > 1 ? `\n--v${REQ_VERSION}--` : ""}`).digest("hex").slice(0, 16);

export async function api(q) {
  const r = await fetch(`${WEB}/api/requests?${q}`, { headers: { Authorization: `Bearer ${token()}` } });
  if (!r.ok) throw new Error(`${q}: HTTP ${r.status}`);
  return r.json();
}
export const doc = async (coll, id) => (await api(`kind=docs&coll=${coll}&id=${encodeURIComponent(id)}`))[0]?.data;
// A network error (fetch failed) is retried: one lost post used to throw away a whole agent run (2026-10-29).
export async function post(rows) {
  let r;
  for (let i = 0; ; i++) {
    try { r = await fetch(`${WEB}/api/ingest`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ rows }) }); break; }
    catch (e) { if (i >= 3) throw e; await new Promise((ok) => setTimeout(ok, 2000 * 2 ** i)); }
  }
  const body = await r.text();
  if (!r.ok) throw new Error(`ingest HTTP ${r.status}: ${body.slice(0, 200)}`);
  return body;
}
// Engines of the origin asked for: "cn" keeps engines a source shows to be of a Chinese make (one whose make no
// source gives is left out, Khoa 2026-10-29) and, since 2026-11-02 (Khoa), an engine of a foreign make that a supplier
// based in China offers in its own table (cnSupplier: id → true for a supplier whose country is CN);
// "other" only engines a source or the model code shows to be foreign.
export const cnSuppliers = (suppliers) => new Set(suppliers.filter((s) => s?.country === "CN").map((s) => s.id));
export function byOrigin(engines, origin, cn = new Set()) {
  if (origin === "cn") return engines.filter((e) => CAT.originOf(e) === "cn" || (CAT.originOf(e) === "other" && (e.uses || []).some((u) => cn.has(u.supplierId))));
  if (origin === "other") return engines.filter((e) => CAT.originOf(e) === "other");
  // G7 / G20 (Khoa, 2026-11-02): engines whose make is from a country of the group (web/catalog.js ENGINE_COUNTRY).
  if (GROUP_ORIGIN.has(origin)) return engines.filter((e) => CAT.groupOf(e, origin));
  return engines;
}

// ---------- prep ----------
const CAP = /(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(kva|kw|mva|mw)\b/i;
function capacity(texts) {
  for (const t of texts) {
    const m = String(t || "").match(CAP);
    if (!m) continue;
    let v = m[1]; v = /^\d{1,3}([.,]\d{3})+$/.test(v) ? v.replace(/[.,]/g, "") : v.replace(",", ".");
    const u = m[2].toLowerCase();
    return { value: Number(v) * (u.startsWith("m") ? 1000 : 1), unit: u.endsWith("va") ? "kVA" : "kW" };
  }
  return null;
}
// The technical part of the HSMT: chapter V (Yêu cầu kỹ thuật) when it can be found, else the whole text.
export function technicalPart(text) {
  const start = text.search(/ch(ươ|uo)ng\s+V\b[^I\n]{0,80}(y[êe]u c[ầa]u|ph[ạa]m vi)/i);
  if (start < 0) return text.slice(0, 250000);
  const rest = text.slice(start + 10), end = rest.search(/\n\s*ch(ươ|uo)ng\s+(VI|VII)\b/i);
  return text.slice(start, end > 0 ? start + 10 + end : start + 250000).slice(0, 250000);
}
// ---------- Thông số theo model (Khoa, 2026-11-02) ----------
// An engine's own figures (cylinders, displacement, bore, governor, emission...) and an alternator's (insulation, IP,
// AVR...) are the same in every genset built with that model, so a figure any supplier's row or datasheet gives for
// the model may be quoted for it (a check's factSrc). Genset figures (fuel, size, tank, noise) stay with their own row.
// From a row table each fact is the row (with its header and title); from a label table (one model per page, a
// datasheet) the line that gives it, only when that table names a single model of that part.
// A China emission level written three ways ("国二", "国Ⅱ", "China II") is one word list.
const ROMAN = { 一: "i", 二: "ii", 三: "iii", 四: "iv", 五: "v", Ⅰ: "i", Ⅱ: "ii", Ⅲ: "iii", Ⅳ: "iv", Ⅴ: "v" };
const levelOf = (v) => String(v ?? "").replace(/国\s*([一二三四五ⅠⅡⅢⅣⅤ])/g, (_, d) => ` china ${ROMAN[d]} `).replace(/[ⅠⅡⅢⅣⅤ]/g, (d) => ` ${ROMAN[d]} `).replace(/国\s*(?=(i{1,3}|iv|v)\b)/gi, " china ");
// Words every level shares ("China II" / "China III", "Stage IIIA" / "Stage V") say nothing about which one it is.
const GENERIC = new Set(["china", "stage", "tier", "euro", "epa", "emission", "standard", "level", "class"]);
const sigOf = (v) => { const n = numbersIn(v); return n.length ? { nums: n } : { words: norm(levelOf(v)).split(/[^a-z0-9一-鿿]+/).filter((w) => (w.length > 1 || w === "v" || w === "i") && !GENERIC.has(w)).map((w) => w.slice(0, 6)) }; };
// Two values of one figure disagree when they share no number (or, for words, no word): "6" / "6L" / "In-line 6" agree,
// "14" / "10.8" do not.
// Two numbers within 3% are one figure rounded two ways (37.8 / 38 L, 135 / 136 L of oil), not a disagreement.
const near = (v, w) => Math.abs(v - w) <= Math.max(Math.abs(v), Math.abs(w)) * 0.03;
const disagree = (a, b) => { const x = sigOf(a), y = sigOf(b); if (x.nums && y.nums) return !x.nums.some((v) => y.nums.some((w) => near(v, w))); if (x.words && y.words) return !x.words.some((w) => y.words.includes(w)); return false; };
// Engine figures that depend on the genset they are in, so they stay with their own row: the output (prime / standby,
// 50 / 60 Hz), the speed (1500 / 1800 rpm) and the coolant volume (the radiator is the genset's).
const ROW_ONLY = new Set(["engPower", "speed", "coolant"]);
// A maker's datasheet that names its model only in the title (maker-datasheets.mjs: "Datasheet: UCI274F - Winding
// 311") gives that model's figures too, when the title names exactly one model of the catalog of the maker's part.
const MAKER_PART = { engine_maker: "engine", alternator_maker: "alternator" };
// A controller's datasheet (role controller_maker, maker-datasheets.mjs) is a list of functions and specifications,
// often of two models at once (Deep Sea: "DSE7310 MKII Auto Start & DSE7320 MKII"). Each line is a fact (key "ctl")
// of the models of its section (Khoa, 2026-11-02): a line that begins with some of the sheet's models ("DSE7320 MKII
// Automatic Mains (Utility) Failure (AMF) Controller Key Features") opens a section of those models; one naming all of
// them, "Common ..." or "Specifications" goes back to all; a line naming some models inside it ("| Number | DSE7310
// MKII: 1", "DSE7320 MKII: 2") is of those models only, without opening a section.
// SmartGen lists a series as "HGM6110N/6120N/6110NC": each code after a slash is a model of its own.
const ctlNames = (line) => {
  const out = CAT.controllersIn(line).filter((c) => c.model).map((c) => ({ key: CAT.keyOf(c.model), model: c.model }));
  for (const m of String(line).matchAll(/\bHGM\s?(\d{4}[A-Z]{0,4})((?:\s?\/\s?\d{4}[A-Z]{0,4})+)/gi)) for (const c of [m[1], ...m[2].split("/")].map((x) => x.trim()).filter(Boolean)) out.push({ key: CAT.keyOf(`HGM${c}`), model: `HGM${c.toUpperCase()}` });
  // Deep Sea writes two models of one sheet as "DSE6010/20 MKII" (DSE6010 MKII and DSE6020 MKII).
  for (const m of String(line).matchAll(/\bDSE\s?(\d{2})(\d{2})((?:\s?\/\s?\d{2}(?!\d))+)(\s*MK\s?I{2,3})?/gi)) {
    const gen = m[4] ? ` ${m[4].trim().replace(/\s+/g, "").toUpperCase()}` : "";
    for (const c of [m[2], ...m[3].split("/").map((x) => x.trim()).filter(Boolean)]) out.push({ key: CAT.keyOf(`DSE${m[1]}${c}${gen}`), model: `DSE${m[1]}${c}${gen}` });
  }
  return out;
};
const ctlKeys = (line) => [...new Set(ctlNames(line).map((x) => x.key))];
// "HGM6100N SERIES" names the series of a SmartGen manual, i.e. every model of the sheet, not a model of its own.
const isSeries = (k) => /^HGM\d{2}00/.test(k);
export function controllerSheetFacts(s, t) {
  const all = new Set([t.title, ...t.rows].flatMap(ctlKeys)), out = [], nameOf = new Map();
  for (const x of [t.title, ...t.rows].flatMap(ctlNames)) if (!nameOf.has(x.key)) nameOf.set(x.key, x.model);
  // A code cut from its generation by a line break ("& | DSE7320" then "| MKII | Auto") is that generation's model.
  const gen = (k) => { const g = [...all].filter((x) => x !== k && new RegExp(`^${k}MK(II|III)$`).test(x)); return g.length === 1 ? g[0] : k; };
  // The sheet's own models are those of its title: a line of another model's datasheet that only mentions a controller
  // ("compatible with DSE7320") does not give that controller's facts.
  const sheet = new Set(ctlKeys(t.title).map(gen).filter((k) => !isSeries(k)));
  const keysOf = (line) => [...new Set(ctlKeys(line).map(gen).flatMap((k) => (isSeries(k) ? [...sheet] : [k])))].filter((k) => sheet.has(k));
  if (!sheet.size) return out;
  let scope = [...sheet], prev = scope, last = "";
  for (const line of t.rows) {
    const bare = line.replace(/^[|\s]+/, "");
    let names = keysOf(line);
    // "HGM6120N/6120NC/6120CAN: Based on HGM6110N/..., it adds ..." and "DSE7320 MKII: 2" are of the models before the colon.
    const head = bare.match(/^([^:]{2,60}):/);
    if (head && keysOf(head[1]).length) names = keysOf(head[1]);
    if (names.length === sheet.size || /^(common\b|specifications$)/i.test(bare)) scope = [...sheet];
    else {
      // A heading begins with the model ("DSE7320 MKII Automatic ... Key Features"), not with a value ("DSE7320 MKII: 2").
      const first = CAT.controllersIn(bare)[0];
      if (names.length && !head && first && bare.indexOf(first.text) === 0 && bare.length <= 120) { scope = prev = names; continue; }
    }
    // A line that goes on with the sentence before it (it begins in lower case, or is a short piece after a line that
    // did not end the sentence: "... it | adds mains", "AC", "| monitoring ...") is of the same models as that line.
    const goesOn = /^[a-z]/.test(bare) || (bare.length <= 15 && !/[.;:!?]$/.test(last));
    const own = names.length ? names : goesOn ? prev : scope;
    for (const k of own) out.push({ model: k, f: { key: "ctl", label: "", value: line, supplierId: s.id, n: t.n, line, text: line, sheetModel: nameOf.get(k) || k } });
    prev = own; last = bare;
  }
  return out;
}
// A model of a frame: TAL-A46 + "C", LSA 44.3 + "S2" … "VL14" (the frame and its size and winding).
const FRAME_SUFFIX = /^([A-Z]{1,2}|[A-Z]{0,2}\d{1,2})$/;
export function modelFacts(cat, suppliers = []) {
  const facts = new Map(), single = new Map();
  const add = (k, f) => { const out = facts.get(k) || []; if (!out.some((g) => g.key === f.key && g.supplierId === f.supplierId && g.line === f.line)) out.push(f); facts.set(k, out); };
  for (const s of suppliers) {
    if (s?.role === "controller_maker") {
      for (const t of s.specTables || []) for (const { model, f } of controllerSheetFacts(s, t)) add(`controller:${model}`, f);
      continue;
    }
    const own = MAKER_PART[s?.role];
    for (const t of s.specTables || []) {
      if (t.header?.length) continue;
      // Every model code of the title, known or not: a title naming two models gives neither.
      const models = [...new Set(String(t.title || "").split(/[\s:–—|,/()]+/).filter((w) => CAT.isCode(w)).map((w) => CAT.keyOf(w)))];
      if (models.length !== 1) continue;
      // A genset maker's own datasheet of a part it makes (Wintpower "WT544C - Technical Data Sheet", Khoa 2026-11-03),
      // saved by maker-datasheets.mjs ("Datasheet: …"), gives the figures of that model when the catalog knows it.
      const isPart = (k) => (cat[k === "engine" ? "engines" : "alternators"] || []).some((e) => e.key === models[0]);
      const kind = own || (/^Datasheet: /.test(t.title || "") ? ["alternator", "engine"].find(isPart) : null);
      if (!kind) continue;
      const known = new Set((kind === "engine" ? cat.engines : cat.alternators || []).map((e) => e.key));
      // A frame's datasheet (Leroy-Somer "TAL-A46", Khoa 2026-11-02) gives its figures to the models of that frame
      // its own lines name ("TAL-A46-C ... TAL-A46-H" in its ratings table), each a model of the catalog.
      const covered = known.has(models[0]) ? [models[0]]
        : [...new Set(t.rows.flatMap((l) => CAT.cellsOf(l)).filter((c) => CAT.isCode(c)).map((c) => CAT.keyOf(c)))].filter((k) => k !== models[0] && k.startsWith(models[0]) && FRAME_SUFFIX.test(k.slice(models[0].length)) && known.has(k));
      for (const line of t.rows) {
        const c = CAT.cellsOf(line), key = c.length >= 2 ? CAT.specKey(c[0]) : null;
        if (!key || CAT.SPEC[key]?.scope !== kind || ROW_ONLY.has(key)) continue;
        const value = c.slice(1).find((v) => CAT.SPEC[key].ok.test(v));
        if (value) for (const m of covered) add(`${kind}:${m}`, { key, label: c[0], value, supplierId: s.id, n: t.n, line, text: line });
      }
    }
  }
  const parts = [["engine", cat.engines || []], ["alternator", cat.alternators || []]];
  for (const [kind, list] of parts) for (const e of list) for (const u of e.uses) if (u.lines) {
    const k = `${kind}|${u.supplierId}|${u.table}`; single.set(k, (single.get(k) || new Set()).add(e.key));
  }
  for (const [kind, list] of parts) for (const e of list) {
    const out = facts.get(`${kind}:${e.key}`) || [];
    for (const u of e.uses) for (const s of u.specs || []) {
      if (CAT.SPEC[s.key]?.scope !== kind || ROW_ONLY.has(s.key)) continue;
      let line, text;
      if (u.line) { line = u.line; text = [...(u.header || []), u.line, u.title || ""].join(" \n "); }
      else {
        if (single.get(`${kind}|${u.supplierId}|${u.table}`)?.size !== 1) continue;
        line = [...(u.lines?.header || []), ...(u.lines?.rows || [])].find((l) => norm(l).includes(norm(s.label)) && norm(l).includes(norm(s.value)));
        if (!line) continue;
        text = line;
      }
      if (!out.some((f) => f.key === s.key && f.supplierId === u.supplierId && f.line === line)) out.push({ key: s.key, label: s.label, value: s.value, supplierId: u.supplierId, n: u.n, line, text });
    }
    if (out.length) facts.set(`${kind}:${e.key}`, out);
  }
  return facts;
}
// The facts of a model. A controller written without its generation ("DSE7320", as most genset tables write it) also
// takes the facts of the datasheets of its generations ("DSE7320 MKII"), each marked with `version`, and its check
// then says the generation is to be confirmed. A controller written with one ("DSE7320 MKII") takes only its own.
// The same rule for ComAp (Khoa, 2026-11-02): "AMF25" or "InteliLite AMF25" written without its generation takes the
// datasheet of "InteliLite 4 AMF25" (or "InteliLite NT AMF25"), to be confirmed.
const comapCore = (k) => k.match(/^(?:INTELILITE)?((?:AMF|MRS)\d+)$/)?.[1];
const GENERATION = [
  (key, k) => !/MK(II|III|2|3)$/.test(key) && new RegExp(`^${key}MK(II|III)$`).test(k),
  (key, k) => !!comapCore(key) && k.match(/^INTELILITE(?:4|NT)((?:AMF|MRS)\d+)$/)?.[1] === comapCore(key),
  // SmartGen "HGM6110" written without its letter (2026-11-03: 13 suppliers write it so): the current "HGM6110N".
  (key, k) => /^HGM\d{4}$/.test(key) && k === `${key}N`,
  // "InteliGen" written alone: every InteliGen generation with a datasheet (NT, NTC, 500, 1000...), to be confirmed.
  (key, k) => key === "INTELIGEN" && /^INTELIGEN(NTC?|\d{1,4})$/.test(k),
];
export function factsFor(facts, part, model) {
  const key = CAT.keyOf(model), own = facts.get(`${part}:${key}`) || [];
  if (part !== "controller") return own;
  const gens = [...facts.keys()].filter((k) => k.startsWith("controller:") && k !== `controller:${key}` && GENERATION.some((g) => g(key, k.slice(11))));
  return [...own, ...gens.flatMap((k) => facts.get(k).map((f) => ({ ...f, version: f.sheetModel || k.slice(11) })))];
}
// The figures of one model whose sources disagree: key → the values given. Values of one page (a datasheet giving the
// voltage regulation of two AVRs, the efficiency at each voltage) are conditions, not a disagreement.
export function factConflicts(list) {
  const out = new Map(), src = (f) => `${f.supplierId}#${f.n}`;
  for (const f of list || []) {
    if (!CAT.SPEC[f.key]) continue;
    const same = list.filter((g) => g.key === f.key);
    if (same.some((g) => src(g) !== src(f) && disagree(f.value, g.value))) out.set(f.key, [...new Set(same.map((g) => g.value))]);
  }
  return out;
}

// ---------- Ứng viên: code xếp sẵn các dòng tổ máy (Khoa, 2026-11-02) ----------
// The agent used to read every engine and alternator near the power (catalog.md ~380 KB, 5–11 minutes a run). Now the
// code ranks the genset rows first and the agent reads the best ones with every figure gathered. Engine and controller
// weigh more than the alternator (Khoa, 2026-11-02).
const squashOf = (s) => norm(s).replace(/[^a-z0-9]/g, "");
export function hintsOf(text, extra = "") {
  const t = `${technicalPart(text)}\n${extra}`;
  const names = (list) => list.filter(([re]) => re.test(t)).map(([, n]) => n);
  const ctrl = CAT.CONTROLLERS.filter((c) => c.word.test(t)).map((c) => c.brand);
  for (const c of CAT.controllersIn(t)) if (!ctrl.includes(c.brand)) ctrl.push(c.brand);
  const f50 = /\b50\s?hz\b/i.test(t), f60 = /\b60\s?hz\b/i.test(t);
  return { engineMakes: names(CAT.ENGINE_BRANDS), altMakes: names(CAT.ALT_BRANDS), ctrlMakes: ctrl, ctrlModels: CAT.controllersIn(t).filter((c) => c.model).map((c) => CAT.keyOf(c.model)),
    freq: f50 && !f60 ? 50 : f60 && !f50 ? 60 : null, text: squashOf(t), ...engineMins(t) };
}
// The engine minimums the HSMT states ("Dung tích xy lanh ≥ 11,05 L", "Tối thiểu 06 xi lanh"), one value each: a tender
// of several gensets that gives two values is left alone. candidates() ranks an engine a source shows below them lower
// (2026-11-03: the 11 best rows were 8.9-10.3 L engines for a tender asking 11.05 L).
const AT_LEAST = /≥|>=|tối thiểu|ít nhất|không (nhỏ|thấp|bé) hơn|trở lên/i;
export function engineMins(t) {
  const one = (list) => (new Set(list).size === 1 ? list[0] : null), disp = [], cyl = [];
  for (const line of String(t).split("\n")) {
    if (!AT_LEAST.test(line)) continue;
    const d = /dung t[íi]ch/i.test(line) && line.match(/(?<![\d.,])(\d{1,2}(?:[.,]\d{1,3})?)\s*(?:l[íi]t|L)\b(?![/a-z])/i);
    if (d) disp.push(Number(d[1].replace(",", ".")));
    const c = line.match(/(?:≥|>=|tối thiểu|ít nhất)\s*:?\s*0?(\d{1,2})\s*(?:xi|xy)\s?lanh/i);
    if (c) cyl.push(Number(c[1]));
  }
  return { minDisp: one(disp), minCyl: one(cyl), ...powerMins(t) };
}
// "Công suất liên tục (Prime) ≥ 400 kVA / 320 kW" and "Tiêu hao nhiên liệu ≤ 90 Lít/giờ": a table cell of the HSMT
// often puts the words on the lines around the figure, so each figure goes to the nearest word naming prime or standby
// (fuel). One value each, as engineMins.
const PRIME_W = /prime|li[êe]n t[ụu]c|continuous|c[ơo] b[ảa]n|th[ưư][ờo]ng xuy[êe]n/gi, STANDBY_W = /standby|d[ựu] ph[òo]ng|emergency|kh[ẩa]n c[ấa]p/gi;
const nearest = (t, i, re) => { let best = Infinity; for (const m of t.matchAll(re)) best = Math.min(best, Math.abs(m.index - i)); return best; };
export function powerMins(t) {
  const text = String(t), prime = [], fuel = [];
  for (const m of text.matchAll(/(?:≥|>=|tối thiểu|không (?:nhỏ|thấp) hơn)\s*:?\s*(\d{1,4}(?:[.,]\d+)?)\s*(kVA|kW)\b(?:\s*\/\s*(\d{1,4}(?:[.,]\d+)?)\s*(kVA|kW)\b)?/gi)) {
    const around = text.slice(Math.max(0, m.index - 160), m.index + 160), at = Math.min(m.index, 160);
    const p = nearest(around, at, PRIME_W), sb = nearest(around, at, STANDBY_W);
    if (!(p < sb && p <= 120)) continue;
    const v = { [m[2].toLowerCase() === "kva" ? "kVA" : "kW"]: Number(m[1].replace(",", ".")) };
    if (m[3] && m[4].toLowerCase() !== m[2].toLowerCase()) v[m[4].toLowerCase() === "kva" ? "kVA" : "kW"] = Number(m[3].replace(",", "."));
    prime.push(JSON.stringify(v));
  }
  const pair = (a, ua, b, ub) => { const v = { [ua.toLowerCase() === "kva" ? "kVA" : "kW"]: Number(a.replace(",", ".")) }; if (b && ub.toLowerCase() !== ua.toLowerCase()) v[ub.toLowerCase() === "kva" ? "kVA" : "kW"] = Number(b.replace(",", ".")); return v; };
  for (const line of text.split("\n")) {
    const m = line.match(/(?:c[ôo]ng su[ấa]t\s+(?:li[êe]n t[ụu]c|c[ơo] b[ảa]n)|prime(?:\s+power)?)[^\n\d≥≤]{0,60}?(\d{1,4}(?:[.,]\d+)?)\s*(kVA|kW)\b(?:\s*[\/(]\s*(\d{1,4}(?:[.,]\d+)?)\s*(kVA|kW)\b)?/i);
    if (m && !STANDBY_W.test(line.slice(0, m.index + 20))) prime.push(JSON.stringify(pair(m[1], m[2], m[3], m[4])));
    STANDBY_W.lastIndex = 0;
  }
  for (const m of text.matchAll(/(?:≤|<=|tối đa|không (?:lớn|vượt|quá)(?: hơn)?)\s*:?\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:l[íi]t\s*\/\s*gi[ờo]|l\/h|lph|l\/hr)/gi)) {
    const before = text.slice(Math.max(0, m.index - 200), m.index);
    if (!/ti[êe]u hao|nhi[êe]n li[ệe]u|fuel/i.test(before)) continue;
    const load = before.slice(-60).match(/(\d{2,3})\s*%(?![\s\S]*\d{2,3}\s*%)/);
    fuel.push({ v: Number(m[1].replace(",", ".")), load: load ? Number(load[1]) : /đầy tải|full load/i.test(before.slice(-60)) ? 100 : null });
  }
  const one = (list) => (new Set(list).size === 1 ? list[0] : null);
  const p = one(prime), full = fuel.filter((x) => x.load === 100), any = fuel.filter((x) => x.load == null);
  return { minPrime: p ? JSON.parse(p) : null, maxFuel: one((full.length ? full : fuel.length === any.length ? any : []).map((x) => x.v)) };
}
// The displacement (L) and the cylinders of an engine as its facts give them.
const litres = (v) => { const n = numbersIn(v)[0]; return n == null ? null : n > 100 ? n / 1000 : n; };
const named = (hints, model) => { const k = squashOf(model); return k.length >= 5 && hints.text.includes(k); };
const CONF = { high: 30, medium: 15 };
// A supplier offering one engine with one alternator is one choice, however many gensets, pages or tables name it.
const choiceKey = (r) => `${r.u.supplierId}\n${r.e.key}\n${r.a?.key || squashOf(r.u.other || "")}`;
// Rows per engine (more for the engine the HSMT names) and per supplier, so other engines and suppliers get a place too.
const PER_ENGINE = 3, PER_NAMED_ENGINE = 8, PER_SUPPLIER = 4;
export function candidates(cat, cap, hints, { suppliers = [], origin = "all", cn = new Set(), facts = modelFacts(cat, suppliers), focus = null, max = 30 } = {}) {
  const sup = new Map(suppliers.map((s) => [s.id, s])), alts = new Map((cat.alternators || []).map((a) => [a.key, a]));
  const near = (u) => !cap || Object.values(u.power || {}).some((p) => p[cap.unit] != null && p[cap.unit] >= cap.value * 0.95 && p[cap.unit] <= cap.value * 1.4);
  const rows = [];
  for (const e of cat.engines || []) {
    if (focus && !focus.has(e.key)) continue;
    const viaCn = origin === "cn" && CAT.originOf(e) === "other";
    const ef = facts.get(`engine:${e.key}`) || [], eKeys = new Set(ef.map((f) => f.key));
    for (const u of e.uses) {
      if ((!u.line && !u.lines) || !near(u) || (hints.freq && u.freq && u.freq !== hints.freq) || (viaCn && !cn.has(u.supplierId))) continue;
      const a = u.other ? alts.get(CAT.keyOf(u.other)) : null, af = a ? facts.get(`alternator:${a.key}`) || [] : [];
      const s = sup.get(u.supplierId), rowCtrl = CAT.controllersIn(u.line || (u.lines?.rows || []).join(" "));
      const offers = [...rowCtrl, ...(s?.controllers || [])];
      const ctrlNamed = offers.some((c) => hints.ctrlModels.includes(CAT.keyOf(c.model || "")) || hints.ctrlMakes.includes(c.brand));
      const why = [];
      let score = 0;
      const isNamed = named(hints, e.model);
      if (isNamed) { score += 1000; why.push("HSMT ghi model động cơ này"); }
      // Sources that name two makes ("Cummins / Doosan"): either one is the HSMT's.
      const makeNamed = (e.make || "").split(" / ").find((m) => hints.engineMakes.includes(m));
      if (makeNamed) { score += 300; why.push(`hãng động cơ ${makeNamed} HSMT nêu`); }
      if (ctrlNamed) { score += 200; why.push("có bộ điều khiển hãng HSMT nêu"); }
      if (e.make) score += 60;
      // Xuất xứ Trung Quốc (Khoa, 2026-11-03): an engine of a Chinese make before a foreign one a supplier in China
      // offers. Those had more datasheet figures and filled 20 of the 30 rows; the make the HSMT names (300) still wins.
      if (origin === "cn" && !viaCn) { score += 250; why.push("động cơ hãng Trung Quốc"); }
      if (offers.length) score += 50;
      // A controller with its maker's datasheet: its functions can be checked against the HSMT.
      if (offers.some((c) => c.model && factsFor(facts, "controller", c.model).length)) { score += 40; why.push("bộ điều khiển có datasheet hãng"); }
      score += 8 * Math.min(eKeys.size, 8);
      // Below a minimum of the HSMT by every source that gives the figure (an engine no source gives it for is not).
      const below = (key, min, read) => { const v = [...ef, ...(u.specs || [])].filter((f) => f.key === key).map((f) => read(f.value)).filter((x) => x != null); return min && v.length && v.every((x) => x < min) ? v[0] : null; };
      // No displacement given: bore × stroke × cylinders (web/conversions.js displacement), when the sources give them.
      const given = [...ef, ...(u.specs || [])], bs = given.find((f) => f.key === "bore"), z = given.find((f) => f.key === "cyl");
      const [b, st] = bs ? numbersIn(bs.value) : [], n = z ? numbersIn(z.value)[0] : null;
      const calcL = !given.some((f) => f.key === "disp") && b > 50 && st > 50 && n ? Math.round(Math.PI / 4 * b * b * st * n / 1e4) / 100 : null;
      const dl = below("disp", hints.minDisp, litres) ?? (hints.minDisp && calcL != null && calcL < hints.minDisp ? calcL : null), cl = below("cyl", hints.minCyl, (v) => numbersIn(v)[0] ?? null);
      if (dl != null) { score -= 600; why.push(`dung tích ${dl} L < ${hints.minDisp} L HSMT yêu cầu`); }
      if (cl != null) { score -= 600; why.push(`${cl} xi lanh < ${hints.minCyl} HSMT yêu cầu`); }
      // The row's prime output (catalog.js reads it from the column titles) below the prime the HSMT asks for.
      const pr = u.power?.prime, mp = hints.minPrime;
      const lowPrime = pr && mp && ((mp.kVA && pr.kVA != null && pr.kVA < mp.kVA * 0.995) || (!mp.kVA && mp.kW && pr.kW != null && pr.kW < mp.kW * 0.995));
      if (lowPrime) { score -= 600; why.push(`Prime ${pr.kVA ?? "?"} kVA / ${pr.kW ?? "?"} kW < ${mp.kVA ? `${mp.kVA} kVA` : `${mp.kW} kW`} HSMT yêu cầu`); }
      // Its own fuel consumption in L/h above the most the HSMT allows.
      const fl = hints.maxFuel && (u.specs || []).find((x) => x.key === "fuel" && /l\s*\/\s*h|l\/hr|lít|lph/i.test(`${x.label} ${x.value}`));
      const fv = fl ? numbersIn(fl.value)[0] : null;
      if (fv != null && fv > hints.maxFuel) { score -= 300; why.push(`tiêu hao ${fv} L/h > ${hints.maxFuel} L/h HSMT cho phép`); }
      if (a) { score += 40; if ((a.make || "").split(" / ").some((m) => hints.altMakes.includes(m)) || named(hints, a.model)) { score += 80; why.push("đầu phát HSMT nêu"); } score += 3 * Math.min(new Set(af.map((f) => f.key)).size, 6); }
      score += CONF[s?.confidence] || 0;
      if (cap) score -= Math.round(100 * Math.max(0, rowPower(u, cap) / cap.value - 1));
      rows.push({ e, u, a, score, why, offers, rowCtrl, named: isNamed });
    }
  }
  rows.sort((x, y) => y.score - x.score);
  const perEngine = new Map(), perSupplier = new Map(), seen = new Set(), out = [];
  const add = (m, k) => m.set(k, (m.get(k) || 0) + 1);
  for (const r of rows) {
    const k = choiceKey(r);
    if (seen.has(k) || (perEngine.get(r.e.key) || 0) >= (r.named ? PER_NAMED_ENGINE : PER_ENGINE) || (perSupplier.get(r.u.supplierId) || 0) >= PER_SUPPLIER) continue;
    seen.add(k); add(perEngine, r.e.key); add(perSupplier, r.u.supplierId); out.push(r);
    if (out.length >= max) break;
  }
  return { top: out, all: rows };
}
// At most 6 configurations (Khoa 2026-11-03: a run checked 49 requirements × 8 configurations in 11 minutes).
export const MAX_CONFIGS = 6;
// A configuration whose controller (engine, alternator) is that of an earlier one may leave out the checks of that
// part: the code copies them: a check read from the model's figures (factSrc), one whose quote is also in this
// configuration's own source of that part, and a controller function no source states. Each copy is then checked
// against this configuration's sources like any other check.
export function copyModelChecks(configs, textOf = () => "") {
  for (const [i, c] of configs.entries()) {
    for (const part of ["controller", "engine", "alternator"]) {
      const key = c[part]?.model && CAT.keyOf(c[part].model);
      const prev = key && configs.slice(0, i).find((p) => p[part]?.model && CAT.keyOf(p[part].model) === key);
      if (!prev) continue;
      const have = new Set((c.checks || []).map((x) => norm(x.item)));
      const own = textOf(c[part].src) || "";
      const fits = (x) => x.factSrc || (x.sourceQuote && own.includes(norm(x.sourceQuote))) || (part === "controller" && x.status === "unclear" && !x.parts);
      const copies = (prev.checks || []).filter((x) => x.part === part && !x.byCode && !have.has(norm(x.item)) && (x.parts ? x.parts.every(fits) : fits(x)));
      if (copies.length) c.checks = [...(c.checks || []), ...copies.map((x) => ({ ...JSON.parse(JSON.stringify(x)), copiedFrom: prev.rank }))];
    }
  }
}
const factLine = (f) => `${CAT.SPEC[f.key]?.vi || f.key}: ${f.value} — factSrc: { "supplierId": "${f.supplierId}", "n": ${f.n}, "line": ${JSON.stringify(f.line)} }`;
export function catalogMd(cat, cap, hints, opts = {}) {
  const facts = opts.facts || modelFacts(cat, opts.suppliers || []), { top, all } = candidates(cat, cap, hints, { ...opts, facts });
  const sup = new Map((opts.suppliers || []).map((s) => [s.id, s])), shown = new Set(), headers = new Map();
  const rowText = (u) => (u.line ? `  line: ${u.line}` : `  bảng một model: ${(u.lines?.rows || []).join(" ; ")}`);
  const out = [`# Danh mục trong hệ thống${cap ? ` (tổ máy ${cap.value} ${cap.unit}, từ 95% đến 140%)` : ""}${hints.freq ? `, ${hints.freq} Hz` : ""} — code đã xếp sẵn`, "",
    "Thứ tự ưu tiên khi xếp: model động cơ / hãng động cơ HSMT nêu, bộ điều khiển HSMT nêu, động cơ có nhiều thông số có nguồn, rồi mới tới đầu phát; công suất càng sát càng tốt.", "",
    `## Ứng viên (${top.length} dòng tổ máy, tốt nhất trước)`, ""];
  top.forEach((r, i) => {
    const { e, u, a } = r, s = sup.get(u.supplierId);
    shown.add(u.supplierId);
    if (u.header?.length) headers.set(`${u.supplierId} n ${u.n}`, u.header.join(" "));
    out.push(`### ${i + 1}. ${u.genset || "(không ghi model tổ máy)"} — động cơ ${e.model}${e.make ? ` (hãng ${e.make}, theo ${[...new Set(e.makes.map((m) => m.via))].join(", ")})` : " (nguồn không ghi hãng)"}, đầu phát ${a ? `${a.model}${a.make ? ` (${a.make})` : ""}` : u.other || "không ghi"}`,
      `- supplierId: ${u.supplierId}, n: ${u.n}${s ? `, quốc gia: ${s.country || "?"}, độ tin cậy: ${s.confidence}, vai trò: ${s.role}` : ""}`, rowText(u));
    if (u.specs?.length) out.push(`  thông số trong dòng: ${u.specs.map((x) => `${x.label} = ${x.value}`).join(" ; ")}`);
    if (r.rowCtrl.length) out.push(`  bộ điều khiển trong dòng: ${r.rowCtrl.map((c) => c.model || c.brand).join(", ")}`);
    const sc = [...new Set((s?.controllers || []).map((c) => c.model || `${c.brand} (không ghi model)`))];
    if (sc.length) out.push(`  bộ điều khiển nhà cung cấp chào (mục Bộ điều khiển): ${sc.join(", ")}`);
    if (r.why.length) out.push(`  lý do xếp: ${r.why.join("; ")}`);
    out.push("");
  });
  // Every figure of the models above, from any supplier's row or datasheet, with the factSrc to quote.
  out.push("## Thông số theo model (dùng cho mọi cấu hình có model đó; ghi factSrc như dưới)", "");
  const models = [];
  for (const r of top) {
    if (!models.some((m) => m.kind === "engine" && m.x.key === r.e.key)) models.push({ kind: "engine", x: r.e });
    if (r.a && !models.some((m) => m.kind === "alternator" && m.x.key === r.a.key)) models.push({ kind: "alternator", x: r.a });
  }
  for (const { kind, x } of models) {
    const list = facts.get(`${kind}:${x.key}`) || [], bad = factConflicts(list);
    out.push(`### ${kind === "engine" ? "Động cơ" : "Đầu phát"} ${x.model}${x.make ? ` — hãng: ${x.make}` : ""}`);
    if (!list.length) out.push("- (chưa có thông số nào có nguồn)");
    for (const key of [...new Set(list.map((f) => f.key))]) {
      if (bad.has(key)) out.push(`- ⚠ ${CAT.SPEC[key]?.vi || key}: các nguồn ghi khác nhau (${bad.get(key).join(" / ")}) — không dùng làm "met"`);
      // Two sources a figure, the shortest lines first (a datasheet line before a whole row); all of them when they disagree.
      const same = list.filter((g) => g.key === key).sort((a, b) => a.line.length - b.line.length);
      for (const f of bad.has(key) ? same.slice(0, 4) : same.slice(0, 2)) out.push(`- ${factLine(f)}`);
    }
    out.push("");
  }
  // The controllers of the rows above that have their maker's datasheet (the HSMT's make first, then the most offered),
  // each line word for word: what a controller check quotes, with factSrc { supplierId, n, line }.
  // A controller the HSMT names first, then one a candidate row itself names (that genset comes with it), then one its
  // supplier offers on another page.
  const ctlCount = new Map(), bump = (m, v) => ctlCount.set(m, (ctlCount.get(m) || 0) + v);
  for (const r of top) {
    const make = (c) => (hints.ctrlMakes.includes(c.brand) ? 5 : 0);
    for (const c of r.rowCtrl) if (c.model) bump(c.model, 20 + make(c));
    for (const c of r.offers) if (c.model) bump(c.model, 1 + make(c));
  }
  for (const [m] of ctlCount) if (hints.ctrlModels.includes(CAT.keyOf(m))) bump(m, 1000);
  const hasSheet = (m) => factsFor(facts, "controller", m).length > 0, ctls = [];
  // Each of the 8 best rows brings every controller with a datasheet that it names or its supplier offers, so the
  // controllers of the configurations the agent is likely to pick are all there; the most named fill the rest.
  // The limit counts datasheets, not models: the models of one sheet (HGM6110N, HGM6120N, HGM6120CAN...) or one model
  // written with and without its generation (DSE8610, DSE8610 MKII) take one place, so they do not push others out.
  const MAX_CTL = 12, sheets = new Set(), sheetsOf = (m) => factsFor(facts, "controller", m).map((f) => `${f.supplierId}#${f.n}`);
  const take = (m) => {
    if (!m || ctls.includes(m) || !hasSheet(m)) return;
    const mine = sheetsOf(m);
    if (sheets.size >= MAX_CTL && !mine.every((k) => sheets.has(k))) return;
    ctls.push(m); mine.forEach((k) => sheets.add(k));
  };
  for (const r of top.slice(0, 8)) for (const c of [...r.rowCtrl, ...r.offers].sort((a, b) => ctlCount.get(b.model) - ctlCount.get(a.model))) take(c.model);
  for (const [m] of [...ctlCount].sort((a, b) => b[1] - a[1])) take(m);
  // Every line goes to controllers.md (a datasheet runs to 250 lines, a SmartGen manual to 700): the agent searches it
  // with grep; catalog.md shows the first 15 lines of each.
  const ctlOut = [], printed = new Map(), head = "Thông số bộ điều khiển (datasheet của hãng; ghi factSrc với supplierId, n và line là dòng nguyên văn)";
  // A controller's datasheet: the first 15 lines to catalog.md (`out`, when given), every line to controllers.md.
  const sheetMd = (m, out) => {
    if (!ctlOut.length) ctlOut.push(`# ${head}`, "");
    {
      const list = factsFor(facts, "controller", m), by = new Map();
      for (const f of list) by.set(`${f.supplierId}#${f.n}`, [...(by.get(`${f.supplierId}#${f.n}`) || []), f]);
      for (const [k, fs] of by) {
        const ver = fs[0].version ? ` — datasheet của ${fs[0].version} (nhà cung cấp ghi ${m}: cần xác nhận đời)` : "";
        const title = `### ${m}${ver} — supplierId: ${fs[0].supplierId}, n: ${fs[0].n}`;
        // One model's lines are written once, even when two controllers above use them (DSE7320 and DSE7320 MKII);
        // two models of one datasheet (DSE7310 MKII, DSE7320 MKII) have lines of their own.
        const same = `${k}|${CAT.keyOf(fs[0].version || m)}`;
        if (printed.has(same)) { for (const o of [out, ctlOut].filter(Boolean)) o.push(`${title}: các dòng như ở mục ${printed.get(same)}`, ""); continue; }
        printed.set(same, m);
        out?.push(title, ...fs.slice(0, 15).map((f) => `- ${f.line}`), fs.length > 15 ? `- … (${fs.length - 15} dòng nữa trong controllers.md)` : "", "");
        ctlOut.push(title, ...fs.map((f) => `- ${f.line}`), "");
      }
    }
  };
  if (ctls.length) {
    out.push(`## ${head} — đầu mỗi datasheet; TOÀN BỘ dòng ở controllers.md, tìm chức năng bằng grep trong đó`, "");
    for (const m of ctls) sheetMd(m, out);
  }
  // Other suppliers whose rows name the same engine: what a configuration's `suppliers` are picked from.
  out.push("## Nhà cung cấp khác có dòng ghi cùng động cơ (để chọn suppliers)", "");
  for (const { kind, x } of models) {
    if (kind !== "engine") continue;
    // One row per supplier not yet listed with this engine; every supplier of the engine the HSMT names.
    const listed = new Set(top.filter((r) => r.e.key === x.key).map((r) => r.u.supplierId)), more = [];
    const most = all.some((r) => r.e.key === x.key && r.named) ? 40 : 4;
    for (const r of all) if (r.e.key === x.key && !listed.has(r.u.supplierId) && more.length < most) { listed.add(r.u.supplierId); more.push(r); }
    if (!more.length) continue;
    out.push(`### ${x.model}`);
    for (const r of more) {
      shown.add(r.u.supplierId);
      if (r.u.header?.length) headers.set(`${r.u.supplierId} n ${r.u.n}`, r.u.header.join(" "));
      out.push(`- supplierId: ${r.u.supplierId}, n: ${r.u.n}${r.u.genset ? `, tổ máy: ${r.u.genset}` : ""}${r.u.other ? `, đi kèm: ${r.u.other}` : ""}`, rowText(r.u));
    }
    out.push("");
  }
  // The engines near the power left out of the list above, so the agent knows they exist.
  const rest = [...new Map(all.filter((r) => !models.some((m) => m.kind === "engine" && m.x.key === r.e.key)).map((r) => [r.e.key, r])).values()].slice(0, 40);
  if (rest.length) {
    out.push(`## Động cơ khác trong khoảng công suất (${rest.length}, điểm thấp hơn; mỗi động cơ một dòng)`, "");
    for (const r of rest) {
      shown.add(r.u.supplierId);
      if (r.u.header?.length) headers.set(`${r.u.supplierId} n ${r.u.n}`, r.u.header.join(" "));
      out.push(`- ${r.e.model}${r.e.make ? ` (${r.e.make})` : ""} — supplierId: ${r.u.supplierId}, n: ${r.u.n}`, rowText(r.u));
    }
    out.push("");
  }
  // A table's header is written once (it was repeated on every row); a header that took in the table's rows is cut.
  out.push("## Tiêu đề bảng (header của mỗi bảng supplierId n, dùng được cho sourceQuote)", "");
  for (const [k, h] of headers) out.push(`- ${k}: ${h.length > 600 ? h.slice(0, 600) + " …" : h}`);
  // Every controller of the "Bộ điều khiển" list that has its maker's datasheet gets all its lines in controllers.md too
  // (an agent picking one past the 12 above used to find no datasheet and write `unclear`, e.g. DSE7410).
  const withSheet = new Set(ctls);
  for (const e of (cat.controllers || []).filter((e) => e.uses.some((u) => shown.has(u.supplierId)))) {
    if (e.model && !withSheet.has(e.model) && hasSheet(e.model)) { sheetMd(e.model); withSheet.add(e.model); }
  }
  out.push("", controllersMd(cat.controllers || [], shown, withSheet));
  return { md: out.join("\n"), ctlMd: ctlOut.join("\n"), shown, top };
}
// Bộ điều khiển (Khoa, 2026-11-01): the controllers each supplier offers, with the line of its page or genset row that
// names it; a configuration's controller and its "Bộ điều khiển" check quote one of these lines.
// Only the suppliers whose rows catalog.md shows, so the file stays small.
function controllersMd(all, ids, withSheet = new Set()) {
  const list = all.filter((e) => e.uses.some((u) => ids.has(u.supplierId)));
  const out = [`## Bộ điều khiển (${list.length}) — của các nhà cung cấp có dòng ở trên, dòng nguyên văn trên trang của họ`, ""];
  for (const e of list) {
    out.push(`### ${e.model}${e.make ? ` — hãng: ${e.make}` : ""}${withSheet.has(e.model) ? " — có datasheet hãng: mọi dòng ở controllers.md (grep theo tên model)" : ""}`);
    const seen = new Set();
    for (const u of e.uses) {
      if (!ids.has(u.supplierId) || seen.has(u.supplierId) || seen.size >= 8) continue;
      seen.add(u.supplierId);
      out.push(`- supplierId: ${u.supplierId}, n: ${u.n}${u.genset ? `, tổ máy: ${u.genset}` : ""}${u.other ? `, động cơ trong dòng: ${u.other}` : ""}`, `  line: ${u.line}`);
    }
    out.push("");
  }
  return out.join("\n");
}
// The suppliers behind the catalog rows, as recorded in the supplier DB (every fact there has a source).
function suppliersMd(suppliers) {
  const out = ["# Nhà cung cấp trong hệ thống (CSDL supplier/<id>)", ""];
  for (const s of suppliers) {
    if (!s.specTables?.length) continue;
    const vn = (s.vietnam?.distributors || []).map((d) => d.name).join("; "), hq = [s.hq?.city, s.hq?.province].filter(Boolean).join(", ");
    out.push(`- ${s.id}: ${s.names?.en || s.names?.zh || s.id} — vai trò: ${s.role}, trạng thái: ${s.status}, độ tin cậy: ${s.confidence}`
      + `${s.country ? `, quốc gia: ${s.country}` : ""}${s.website ? `, website: ${s.website}` : ""}${hq ? `, trụ sở: ${hq}` : ""}${s.founded ? `, thành lập: ${s.founded}` : ""}`
      + `${vn ? `, đại lý tại Việt Nam: ${vn}` : ""}${s.certifications?.length ? `, chứng nhận: ${s.certifications.map((c) => c.name).join("; ")}` : ""}`
      + `${s.controllers?.length ? `, bộ điều khiển: ${s.controllers.map((c) => c.model || `${c.brand} (không ghi model)`).join("; ")}` : ""}`);
  }
  return out.join("\n");
}
const rowPower = (u, cap) => Math.min(...Object.values(u.power || {}).map((p) => p[cap.unit] ?? 1e9), 1e9);

// The HSMT text of a tender (its files, then the notice); `parts` alone is what the requirements are read from.
export async function hsmtTextOf(key) {
  const [hsmt, notice] = await Promise.all([doc("hsmt", key), doc("notice", key)]);
  const parts = [];
  for (let i = 0; i < (hsmt?.textChunks || 0); i++) parts.push((await doc("hsmttext", `${key}_${i}`))?.text || "");
  const noticeText = notice ? JSON.stringify(notice) : "";
  const text = parts.join("") + (noticeText ? "\n\n--- Thông báo mời thầu ---\n" + noticeText : "");
  if (!text.trim()) throw new Error("Gói này chưa có văn bản HSMT để đọc yêu cầu kỹ thuật. Cần tải hồ sơ (Lấy lại tệp) trước.");
  return { hsmt, parts, text };
}
// The allowed formulas, written from web/conversions.js so the prompt and the check use the same list.
const formulasMd = () => "\n## Công thức được phép\n"
  + Object.entries(CONV.FORMULAS).map(([id, f]) => `- \`${id}\`: ${f.label} — đầu vào ${f.inputs.map((n) => `\`${n}\``).join(", ")}; cơ sở: ${f.basis}${f.standard ? `; giá trị chuẩn: ${Object.entries(f.standard).map(([n, st]) => `\`${n}\` = ${st.min}–${st.max} ${st.unit} (${st.basis})`).join("; ")}` : ""}`).join("\n") + "\n";

// `given`: the supplier DB the run already read (run reads it once; check() then uses the same records the agent saw).
async function prep(key, dir, reqData = {}, given = null) {
  fs.mkdirSync(path.join(dir, "web"), { recursive: true });
  // GENBID_LOCAL_SUPPLIERS=1: the supplier DB of this checkout (cn/*.json) instead of the web's, to try records not yet published.
  const localSuppliers = () => fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).map((f) => ({ data: JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8")) })).filter((d) => d.data.status !== "incomplete");
  const [analysis, { hsmt, parts, text }, suppliers] = await Promise.all([doc("analysis", key), hsmtTextOf(key), process.env.GENBID_LOCAL_SUPPLIERS ? localSuppliers() : given ? given.map((data) => ({ data })) : api("kind=docs&coll=supplier")]);
  fs.writeFileSync(path.join(dir, "hsmt.txt"), text, "utf8");
  const a = analysis?.result;
  const cap = capacity([reqData.bidName, a?.keyInfo?.generatorCapacity, hsmt?.capacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
  const all = suppliers.map((d) => d.data), hints = hintsOf(text, extraOf(reqData));
  const origin = originOfReq(reqData.origin), full = CAT.build(all), cn = cnSuppliers(all);
  const cat = { ...full, engines: byOrigin(full.engines, origin, cn) };
  const { md, ctlMd, shown, top } = catalogMd(cat, cap, hints, { suppliers: all, origin, cn, focus: reqData.focus || null });
  fs.writeFileSync(path.join(dir, "catalog.md"), md + "\n\n" + suppliersMd(all.filter((s) => shown.has(s.id))), "utf8");
  if (ctlMd) fs.writeFileSync(path.join(dir, "controllers.md"), ctlMd, "utf8");
  // Lets the agent run `check --dir .` itself, offline, instead of reading this script to check by hand.
  fs.writeFileSync(path.join(dir, "suppliers.json"), JSON.stringify(all), "utf8");
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ origin }), "utf8");
  // The requirements read last time, when the HSMT and Yêu cầu khác are the same (Khoa, 2026-11-02): Gợi ý lại only
  // matches the configurations again. Each quote is checked again by check.
  // Only the HSMT files count: the notice is fetched again each time and its status changes.
  const reqHash = reqHashOf(parts.join(""), extraOf(reqData)), prevReq = reqData.prevResult;
  const reuse = prevReq?.reqHash === reqHash && prevReq.requirements?.length && prevReq.requirements.every((r) => r.level && r.part && !r.unverified);
  if (reuse) fs.writeFileSync(path.join(dir, "requirements.json"), JSON.stringify(prevReq.requirements.map(({ item, requirement, quote, from, part, level }) => ({ item, requirement, quote, ...(from ? { from } : {}), part, level })), null, 1), "utf8");
  fs.writeFileSync(path.join(dir, "input.md"), [
    `# Gói thầu ${key}`, reqData.bidName ? `Tên gói: ${reqData.bidName}` : "", cap ? `Công suất đọc được: ${cap.value} ${cap.unit} (chỉ để lọc danh mục; yêu cầu thật lấy từ HSMT)` : "Chưa đọc được công suất từ tên gói / phân tích.",
    `Lệnh lưu trang web: node "${SCRIPT}" save --dir . --url "<url>"`,
    `Lệnh kiểm tra result.json: node "${SCRIPT}" check --dir .`, "",
    reuse ? "## Yêu cầu đã đọc lần trước: requirements.json (HSMT và Yêu cầu khác không đổi) — dùng nguyên danh sách đó, bỏ qua bước 1." : "", "",
    `## Xuất xứ động cơ: ${ORIGIN[origin]}`,
    origin === "cn" ? `Gợi ý động cơ mà nguồn ghi rõ là hãng Trung Quốc (Weichai, Yuchai, SDEC...), ghi "make" của động cơ; động cơ nguồn không ghi hãng thì không gợi ý. Cấu hình động cơ hãng Trung Quốc đứng trước cấu hình động cơ hãng nước khác (Khoa, 2026-11-03). Động cơ hãng nước khác (${[...CAT.FOREIGN_ENGINE].join(", ")}, kể cả loại sản xuất theo giấy phép như Dongfeng Cummins, Chongqing Cummins) chỉ được gợi ý khi có nhà cung cấp đặt tại Trung Quốc (quốc gia CN trong catalog.md) chào động cơ đó trong bảng của mình; khi đó "suppliers" chỉ ghi các nhà cung cấp ở Trung Quốc đó. Khi tìm trên internet cũng vậy: hãng nước ngoài chỉ được tính khi trang của một nhà cung cấp ở Trung Quốc chào nó.`
    : GROUP_ORIGIN.has(origin) ? `Chỉ gợi ý động cơ của hãng thuộc một nước ${origin.toUpperCase()} (${CAT.COUNTRY_GROUP[origin].join(", ")}; hãng nước ngoài: ${Object.entries(CAT.ENGINE_COUNTRY).filter(([, c]) => CAT.COUNTRY_GROUP[origin].includes(c)).map(([n, c]) => `${n} ${c}`).join(", ")}), kể cả khi tìm trên internet; ghi "make" của động cơ. Không gợi ý động cơ của hãng Trung Quốc (Weichai, Yuchai, SDEC...), kể cả loại sản xuất theo giấy phép. Động cơ nguồn không ghi hãng thì không gợi ý.`
    : origin === "other" ? `Chỉ gợi ý động cơ của hãng ngoài Trung Quốc (${[...CAT.FOREIGN_ENGINE].join(", ")}), kể cả khi tìm trên internet; ghi "make" của động cơ. Không gợi ý động cơ của hãng Trung Quốc (Weichai, Yuchai, SDEC...).`
    : "Không giới hạn xuất xứ động cơ.", "",
    // Yêu cầu khác (Khoa, 2026-11-01): typed on the web next to Gợi ý / Tìm NCC, checked like the HSMT's requirements.
    ...(extraOf(reqData) ? ["## Yêu cầu khác (người dùng nhập trên web, bắt buộc kiểm tra như yêu cầu của HSMT)", extraOf(reqData), ""] : []),
    "## Thông số kỹ thuật theo phân tích (chỉ để định hướng, trích dẫn phải lấy từ hsmt.txt)",
    ...(a?.technicalSpecs || []).map((s) => `- ${s.item}: ${s.requirement}${s.reference ? ` (${s.reference})` : ""}`), "",
    "## Phần kỹ thuật của HSMT", technicalPart(text),
  ].filter((l) => l !== null).join("\n"), "utf8");
  fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(path.join(ROOT, "config-prompt.md"), "utf8") + formulasMd(), "utf8");
  return { cap, origin, reqHash, reused: !!reuse, candidates: top.length, engines: cat.engines.length, alternators: cat.alternators.length };
}

// ---------- save (agent: internet sources) ----------
async function save(dir, url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en,zh-CN;q=0.8,vi;q=0.7" }, redirect: "follow", signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer()), type = r.headers.get("content-type") || "";
  const webDir = path.join(dir, "web"); fs.mkdirSync(webDir, { recursive: true });
  const n = fs.readdirSync(webDir).filter((f) => /^\d+\.txt$/.test(f)).length + 1;
  let text;
  if (type.includes("pdf") || /\.pdf($|\?)/i.test(url)) {
    const tmp = path.join(webDir, `${n}.pdf`); fs.writeFileSync(tmp, buf);
    text = execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", tmp, "-"], { maxBuffer: 64 << 20 }).toString("utf8"); fs.unlinkSync(tmp);
  } else {
    const head = buf.subarray(0, 4000).toString("latin1");
    const cs = (type.match(/charset=([\w-]+)/i) || head.match(/charset=["']?([\w-]+)/i) || [, "utf-8"])[1].toLowerCase();
    let html; try { html = new TextDecoder(cs === "gb2312" || cs === "gbk" ? "gb18030" : cs).decode(buf); } catch { html = buf.toString("utf8"); }
    text = htmlToText(html);
  }
  const file = path.join(webDir, `${n}.txt`);
  fs.writeFileSync(file, `URL: ${r.url || url}\nAccessed: ${new Date().toISOString().slice(0, 10)}\n\n${text}\n`, "utf8");
  return `web/${n}.txt`;
}

// What an "unclear" check is about, to find the line of its sources that may answer it (check's hints): the figure
// keys of web/catalog.js SPEC an engine / alternator / genset requirement points at, and the English words of a
// controller datasheet for a function the HSMT names in Vietnamese.
const ITEM_KEYS = [
  [/điều tốc|governor/i, ["gov"]], [/cách điện|insulation/i, ["insul"]], [/\bIP\s?\d|cấp bảo vệ|protection class/i, ["ip"]],
  [/t[ỉỷ] số nén|compression/i, ["compr"]], [/khởi động|starting/i, ["start"]], [/kiểu động cơ|tăng áp|nạp khí|turbo|aspirat/i, ["asp", "engType"]],
  [/dung tích|displacement/i, ["disp", "bore"]], [/xi ?lanh|cylinder/i, ["cyl"]], [/(tiêu chuẩn|mức|cấp) khí thải|emission|\b(euro|tier|stage)\b/i, ["emission"]],
  [/làm mát|cooling/i, ["cooling"]], [/dầu bôi trơn|nhớt|lubricat/i, ["oil"]], [/sóng hài|THD|harmonic/i, ["thd"]],
  [/(ổn định|biến thiên|điều chỉnh|dao động) điện áp|voltage regulation/i, ["vreg"]], [/AVR|kích từ|excit/i, ["excit", "vreg"]],
  [/hiệu suất|efficiency/i, ["eff"]], [/tiêu hao nhiên liệu|fuel consumption/i, ["fuel"]], [/độ ồn|noise/i, ["noise"]],
  [/kích thước|dimension/i, ["dims"]], [/khối lượng|trọng lượng|weight/i, ["weight"]], [/bồn dầu|bình (nhiên liệu|dầu)|fuel tank/i, ["tank"]],
  [/(ổn định|biến thiên|dao động) tần số|frequency regulation/i, ["freg"]], [/hệ số công suất|cos\s?[φϕø]/i, ["pf"]],
  [/tốc độ|vòng quay|rpm/i, ["speed"]], [/dòng điện/i, ["current"]],
];
const CTL_WORDS = [
  [/quá áp|điện áp cao/i, /over\s?-?voltage|high voltage/i], [/thấp áp|điện áp thấp|sụt áp/i, /under\s?-?voltage|low voltage/i],
  [/tần số (cao|thấp)|quá tần|thấp tần/i, /(over|under)\s?-?frequency|(high|low) frequency/i], [/quá tải|quá dòng/i, /overload|over\s?-?current|over\s?-?power/i],
  [/ngắn mạch/i, /short\s?-?circuit/i], [/áp (suất|lực) (dầu|nhớt)/i, /oil pressure/i], [/nhiệt độ (nước|làm mát|động cơ)/i, /coolant temp|engine temp|high temp/i],
  [/quá tốc|vượt tốc/i, /over\s?-?speed/i], [/thấp tốc|dưới tốc/i, /under\s?-?speed/i], [/khởi động (không|thất bại)|lỗi khởi động/i, /fail(ed|ure)? to start|start fail/i],
  [/dừng khẩn/i, /emergency stop/i], [/ắc ?quy|accu|bình điện/i, /battery (voltage|under|over|low|high)|plant supply|(low|high) battery/i], [/sạc/i, /charge/i],
  [/nhật ký|lịch sử|event log|sự kiện/i, /event log|events/i], [/giờ (chạy|máy|vận hành)|đếm giờ/i, /engine hours|hours run|running hours|run time|hour meter/i],
  [/hệ số công suất|\bPF\b|cos/i, /power factor|\bpf\b/i], [/công suất|\bkW\b|\bkVA\b/i, /\bkW\b|\bkVA\b|\bkvar\b/i],
  [/điện áp/i, /voltage (measurement|range|sensing)|(generator|mains|bus|phase).{0,20}voltage|Vs?(L-?L|L-?N|ph-?ph|ph-?n)/i], [/dòng điện/i, /current (measurement|sensing|range)|CT|(generator|phase|load).{0,15}current/i], [/tần số|\bHz\b/i, /frequency/i],
  [/RS-?485/i, /RS-?485/i], [/RS-?232/i, /RS-?232/i], [/modbus/i, /modbus/i], [/USB/i, /USB/i], [/ethernet|TCP|mạng LAN/i, /ethernet|TCP/i],
  [/CAN|J1939|ECU/i, /J1939|CAN/i], [/GSM|SMS|GPRS/i, /GSM|SMS|GPRS/i], [/SNMP/i, /SNMP/i],
  [/AMF|mất (điện )?lưới|ATS/i, /AMF|mains (\(utility\) )?fail|automatic mains/i], [/tự (động )?khởi động|auto start|từ xa/i, /auto start|remote start/i],
  [/mật khẩu|password|PIN/i, /password|PIN\b|security/i], [/LCD|màn hình/i, /LCD|graphic display|display (size|type|resolution)/i], [/hòa đồng bộ|song song|paralle|đồng bộ/i, /synchron|load ?shar|parallel/i],
  [/(mức|thấp) nhiên liệu|nhiên liệu (thấp|mức)/i, /fuel level|low fuel/i], [/chế độ|auto\/manual|start\/stop/i, /\bmanual\b|\bauto\b mode|stop\/reset/i],
];
// The measured quantities (a controller measures them; a protection or another function that names one is about more).
const CTL_MEASURE = new Set(CTL_WORDS.filter(([re]) => ["điện áp", "dòng điện", "tần số", "công suất", "hệ số công suất"].some((w) => re.test(w))));

// ---------- check ----------
// Returns { result, problems } with result fixed in place: unverified marks, "met" without proof → "unclear".
export function check(result, { hsmtText, suppliers, readWeb, origin }) {
  const problems = [], H = norm(hsmtText);
  const sup = new Map(suppliers.map((s) => [s.id, s]));
  const inHsmt = (q) => !!q && H.includes(norm(q));
  // Figures of a model from any supplier's row or datasheet (modelFacts); a check may quote one with factSrc.
  const built = CAT.build(suppliers), facts = modelFacts(built, suppliers);
  // A genset row as web/catalog.js reads it (its power per rating), by the src that names it.
  const rows = new Map();
  for (const e of built.engines || []) for (const u of e.uses) if (u.line) rows.set(`${u.supplierId}|${u.n}|${CAT.keyOf(u.line)}`, u);
  const rowOf = (src) => (src?.kind === "catalog" ? rows.get(`${src.supplierId}|${Number(src.n)}|${CAT.keyOf(src.line || "")}`) : null);
  const hints = [];
  // The line of a configuration's sources that may answer an "unclear" check: a figure of its engine / alternator
  // model (the keys its name points at), a figure of its own genset row, or a line of its controller's datasheet
  // with a word of the function. The first of them, with what to quote it by.
  const hintFor = (c, x) => {
    const what = `${x.name || x.item} ${x.requirement || ""}`;
    if (x.part === "controller") {
      // The function's own words first ("Điện áp ắc quy thấp": the battery, not any voltage; "Quá tải dòng điện": the
      // overload, not the current measurement): a measured quantity only when nothing more particular is named.
      const all = CTL_WORDS.filter(([re]) => re.test(what)), named = all.filter((w) => !CTL_MEASURE.has(w));
      const words = (named.length ? named : all).map(([, en]) => en);
      // Not the module's own specification (its supply voltage, current, test standards, clock battery).
      const own = /BS EN|IEC 600|Operating Current|Continuous Voltage|Cranking|Standby Current|Humidity|Vibration|Shock|RTC|Temperature Range|Cut[- ]?out|Dimensions/i;
      const lines = factsOf(c, "controller").filter((f) => f.line.length <= 240 && !own.test(f.line));
      const f = words.map((en) => lines.find((f) => en.test(f.line))).find(Boolean);
      return f ? { where: `datasheet ${f.sheetModel || c.controller.model}`, line: f.line, factSrc: { supplierId: f.supplierId, n: f.n, line: f.line } } : null;
    }
    const keys = ITEM_KEYS.filter(([re]) => re.test(what)).flatMap(([, k]) => k);
    if (!keys.length) return null;
    const row = rowOf(c.genset?.src || c.engine?.src);
    // The keys in the order the name gives them ("Dung tích xi lanh": the displacement before the cylinders).
    const first = (list) => keys.map((k) => list.find((v) => v.key === k)).find(Boolean);
    const s = first((row?.specs || []).filter((s) => x.part === "genset" || CAT.SPEC[s.key]?.scope === x.part));
    if (s) return { where: `dòng bảng của cấu hình (${s.label} = ${s.value})`, line: row.line };
    if (x.part !== "engine" && x.part !== "alternator") return null;
    const f = first(factsOf(c, x.part));
    return f ? { where: `thông số theo model ${c[x.part].model} (${f.label} = ${f.value})`, line: f.line, factSrc: { supplierId: f.supplierId, n: f.n, line: f.line } } : null;
  };
  // The rating a power check is about: its name says power and one of prime / standby (not "quá tải ... liên tục").
  const ratingOf = (x) => {
    if (!/c[ôo]ng su[ấa]t|power/i.test(x.item) || /qu[áa] t[ảa]i|overload|h[ệe] s[ốo]/i.test(x.item)) return null;
    const t = `${x.item} ${x.requirement || ""}`, sb = /standby|d[ựu] ph[òo]ng/i.test(t), pr = /prime|li[êe]n t[ụu]c|continuous/i.test(t);
    return sb === pr ? null : sb ? "standby" : "prime";
  };
  // The make of an engine or alternator model as catalog.md shows it: given by a source that names the model (a row,
  // a column title, a page title), not always the row the configuration takes (a run spent a round fixing "Weichai").
  const sourcedMake = (part, p) => {
    const e = (part === "engine" ? built.engines : part === "alternator" ? built.alternators : [])?.find((x) => x.key === CAT.keyOf(p.model || ""));
    return !!e?.make && e.make.split(" / ").some((m) => norm(m) === norm(p.make));
  };
  const factsOf = (c, part) => (["engine", "alternator", "controller"].includes(part) && c[part]?.model ? factsFor(facts, part, c[part].model) : []);
  // A requirement's part and level (core: decides the model; option: chosen when ordering), copied to its checks.
  const reqs = new Map((result.requirements || []).map((r) => [norm(r.item), r]));
  for (const r of result.requirements || []) { r.level = r.level === "option" ? "option" : "core"; if (!PARTS.includes(r.part)) r.part = "genset"; }
  for (const r of result.requirements || []) if (r.quote && !inHsmt(r.quote)) { r.unverified = true; problems.push(`Câu trích yêu cầu không có trong HSMT: "${r.quote.slice(0, 80)}"`); }
  // The text a part's facts must come from: its catalog row (and table header), or its saved web page.
  const sourceText = (src) => {
    if (!src) return null;
    if (src.kind === "catalog") {
      const s = sup.get(src.supplierId);
      const tables = (s?.specTables || []).filter((t) => t.n === Number(src.n));
      const t = tables.find((x) => [...(x.header || []), ...x.rows].some((l) => norm(l) === norm(src.line)));
      return t ? norm([...(t.header || []), src.line, t.title].join(" \n ")) : null;
    }
    // A controller (Khoa, 2026-11-01): one of the lines the supplier's `controllers` were read from (controllers.mjs).
    if (src.kind === "controller") {
      const c = (sup.get(src.supplierId)?.controllers || []).find((x) => norm(x.line) === norm(src.line) && (src.n == null || (x.src || []).includes(Number(src.n))));
      return c ? norm(c.line) : null;
    }
    if (src.kind === "internet") {
      const txt = src.file ? readWeb(src.file) : null;
      if (!txt) return null;
      const url = (txt.split("\n", 1)[0] || "").replace(/^URL:\s*/, "").trim().replace(/\/$/, "");
      if (src.url && url !== String(src.url).trim().replace(/\/$/, "")) problems.push(`Trang ${src.file} được lưu từ ${url}, khác link ghi trong kết quả ${src.url}`);
      return norm(txt);
    }
    return null;
  };
  // An engine of the other origin is not a suggestion, nor, under "cn", one whose make the source does not give
  // (Khoa, 2026-10-29). Under "cn" a foreign engine stays when a supplier based in China offers it in a row of its own
  // table that names the engine; that configuration then lists only such suppliers (Khoa, 2026-11-02). The make counts only as the source states it: the catalog row (header, title), or for an
  // internet source the quote, plus the make the agent wrote when the saved page has it.
  if (origin === "cn" || origin === "other" || GROUP_ORIGIN.has(origin)) {
    result.configs = (result.configs || []).filter((c) => {
      const e = c.engine;
      if (!e) return true;
      const page = e.src?.kind === "internet" && e.src.file ? norm(readWeb(e.src.file) || "") : "";
      const own = e.src?.kind === "catalog" ? sourceText(e.src) : `${e.src?.quote || ""} ${e.make && page.includes(norm(e.make)) ? e.make : ""}`;
      const o = CAT.originIn(`${e.model || ""} ${own || ""}`, e.model);
      const cnRow = (x) => sup.get(x.supplierId)?.country === "CN" && (sup.get(x.supplierId).specTables || []).some((t) => t.n === Number(x.n) && t.rows.some((l) => norm(l) === norm(x.line))
        && [...(t.header || []), x.line, t.title].join(" ").replace(/s/g, "").toLowerCase().includes(String(e.model || "").replace(/s/g, "").toLowerCase()));
      // Or the saved page of a supplier based in China (in the supplier DB or added by this run) names the engine.
      const cnWeb = (x) => !!page && sup.get(x.supplierId)?.country === "CN" && page.replace(/\s/g, "").includes(norm(e.model || "").replace(/\s/g, ""));
      const cnOffer = (x) => cnRow(x) || cnWeb(x);
      const viaCn = origin === "cn" && o === "other" && !!e.model && (c.suppliers || []).some(cnOffer);
      if (viaCn) c.suppliers = c.suppliers.filter(cnOffer);
      const drop = GROUP_ORIGIN.has(origin) ? !CAT.groupIn(`${e.model || ""} ${own || ""}`, e.model, origin) : origin === "cn" ? o !== "cn" && !viaCn : o !== "other";
      if (drop) problems.push(`#${c.rank}: động cơ ${e.model}${e.make ? ` (${e.make})` : ""} ${GROUP_ORIGIN.has(origin) ? `nguồn không cho thấy là hãng của nước ${origin.toUpperCase()}` : origin === "cn" ? (o === "other" ? "không phải hãng Trung Quốc và không có nhà cung cấp ở Trung Quốc chào" : "nguồn không ghi hãng") : "không rõ là hãng ngoài Trung Quốc"}, đã bỏ`);
      return !drop;
    });
    result.origin = origin;
  }
  result.configs = (result.configs || []).slice(0, MAX_CONFIGS);
  copyModelChecks(result.configs, sourceText);
  for (const c of result.configs) {
    const texts = {};
    for (const part of ["engine", "alternator", "genset", "controller"]) {
      const p = c[part];
      if (!p) continue;
      texts[part] = sourceText(p.src);
      if (!texts[part]) { p.unverified = true; problems.push(`#${c.rank} ${part} ${p.model}: không tìm thấy nguồn (${p.src?.kind || "?"})`); continue; }
      if (!texts[part].includes(norm(p.model).replace(/\s+/g, " ")) && !texts[part].replace(/\s/g, "").includes(norm(p.model).replace(/\s/g, ""))) { p.unverified = true; problems.push(`#${c.rank} ${part}: model ${p.model} không có trong nguồn`); }
      if (p.src?.kind === "internet" && p.src.quote && !texts[part].includes(norm(p.src.quote))) { p.unverified = true; problems.push(`#${c.rank} ${part}: câu trích web không có trong trang đã lưu`); }
      // A controller's make may come from its model code (DSE… is Deep Sea, HGM… SmartGen), as web/catalog.js reads it.
      const makeOfCode = part === "controller" && CAT.controllersIn(p.model).some((x) => x.model && x.brand === p.make);
      if (p.make && !makeOfCode && !sourcedMake(part, p) && !texts[part].includes(norm(p.make).split(/[\s-]/)[0])) { problems.push(`#${c.rank} ${part}: hãng ${p.make} không ghi trong nguồn`); p.makeUnverified = true; }
    }
    // A grouped requirement (the controller's protections, measurements...: Khoa 2026-11-03) has one part per function;
    // each part is checked here like a check of its own, then the group is put back together.
    const groups = new Set();
    c.checks = (c.checks || []).flatMap((x) => {
      // Every function the requirement lists is a part of its check: one the agent left out is "unclear", so a group
      // checked on 7 of its 10 functions is not "met".
      const want = (reqs.get(norm(x.item))?.parts || []).filter((p) => p?.item);
      if (want.length && x.status !== "not_met") {
        const have = new Set((x.parts || []).map((p) => norm(p.item)));
        const miss = want.filter((p) => !have.has(norm(p.item)));
        if (miss.length) x.parts = [...(x.parts || []), ...miss.map((p) => ({ item: p.item, status: "unclear", offered: "", note: "Chưa kiểm chức năng này." }))];
      }
      if (!Array.isArray(x.parts) || !x.parts.length) return [x];
      groups.add(x);
      return x.parts.map((p) => ({ ...p, item: `${x.item}: ${p.item}`, part: x.part, level: x.level, hsmtQuote: "", group: x, name: p.item }));
    });
    for (const x of c.checks) {
      const reasons = [], rq = reqs.get(norm(x.group ? x.group.item : x.item));
      x.level = (rq?.level || x.level) === "option" ? "option" : "core";
      if (!PARTS.includes(x.part)) x.part = rq?.part || "genset";
      if (x.hsmtQuote && !inHsmt(x.hsmtQuote)) reasons.push("câu trích HSMT");
      // factSrc: a figure of this configuration's engine or alternator read from another row or datasheet that names
      // the same model. Only those figures (not the genset ones of that row) may be quoted from it.
      let fact = null;
      if (x.factSrc) {
        const mine = factsOf(c, x.part).filter((f) => f.supplierId === x.factSrc.supplierId && Number(f.n) === Number(x.factSrc.n) && norm(f.line) === norm(x.factSrc.line));
        if (!mine.length) reasons.push("factSrc không phải dòng ghi thông số của model này");
        else fact = { text: norm(mine[0].text), nums: mine.flatMap((f) => numbersLoose(f.value)) };
        // A controller written without its generation ("DSE7320") read from the datasheet of the current one ("DSE7320 MKII").
        if (mine[0]?.version) {
          x.version = mine[0].version;
          x.note = [x.note, `Nguồn là datasheet ${mine[0].version}; nhà cung cấp ghi ${c[x.part].model}, cần xác nhận đời (MK) của bộ điều khiển.`].filter(Boolean).join(" ");
          const gap = `Xác nhận đời bộ điều khiển: ${c[x.part].model} hay ${mine[0].version}.`;
          if (!(c.gaps || []).includes(gap)) c.gaps = [...(c.gaps || []), gap];
        }
      }
      const src = texts[x.part] || texts.genset || texts.engine || texts.alternator;
      // Conversions: recomputed here from web/conversions.js; each input must be in the source / HSMT quote, a standard
      // constant of that formula, or the result of an earlier conversion of this check.
      const calc = [], used = [];
      for (const cv of x.conversions || []) {
        const r = CONV.compute(cv);
        if (r.error) { reasons.push(`quy đổi: ${r.error}`); cv.invalid = true; continue; }
        const f = CONV.FORMULAS[cv.formula];
        // The formula's own constants (1000, 120, √3 written as 1,732...) may appear in the offered text.
        used.push(...numbersIn(f.label.replace(/(\d),(\d+)/g, "$1.$2")), ...(f.label.includes("√3") ? [3, 1.73, 1.732] : []));
        for (const i of cv.inputs || []) {
          const v = Number(i.value);
          if (i.from === "source" && !numbersLoose(x.sourceQuote).includes(v)) reasons.push(`đầu vào ${i.name} = ${i.value} không có trong câu trích nguồn`);
          else if (i.from === "hsmt" && !numbersLoose(x.hsmtQuote).includes(v)) reasons.push(`đầu vào ${i.name} = ${i.value} không có trong câu trích HSMT`);
          else if (i.from === "calc" && !calc.some((c) => CONV.matches(v, c))) reasons.push(`đầu vào ${i.name} = ${i.value} không phải kết quả quy đổi trước`);
          else if (!["source", "hsmt", "calc", "standard"].includes(i.from)) reasons.push(`đầu vào ${i.name} không ghi lấy từ đâu`);
          const st = f.standard?.[i.name];
          used.push(...(i.from === "standard" && st ? [st.min, st.max] : [v]));
        }
        const stated = Array.isArray(cv.value) ? cv.value : cv.value != null ? [Number(cv.value)] : [];
        if (stated.some((v) => !CONV.matches(v, r.value))) reasons.push(`kết quả quy đổi ${cv.formula} ghi sai`);
        Object.assign(cv, { value: r.value, unit: f.unit, label: f.label, basis: f.basis });
        calc.push(r.value);
      }
      if (x.status === "met" || x.status === "not_met") {
        if (!x.sourceQuote) reasons.push("thiếu câu trích nguồn");
        else if (x.factSrc && !fact) { /* already a reason */ }
        else {
          const all = fact ? [fact.text] : Object.values(texts).filter(Boolean);
          if (!all.some((t) => t.includes(norm(x.sourceQuote)))) reasons.push("câu trích nguồn");
          else {
            // Every number offered is in the source quote (from a factSrc: in the model's own figures on that line), is
            // an input of a conversion, or is a recomputed result.
            const nums = fact ? fact.nums.filter((v) => numbersLoose(x.sourceQuote).includes(v)) : numbersLoose(x.sourceQuote);
            const ok = (v) => nums.includes(v) || used.includes(v) || calc.some((c) => CONV.matches(v, c));
            for (const v of numbersIn(String(x.offered ?? "").replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2"))) if (!ok(v)) { reasons.push(`số ${v}`); break; }
          }
        }
        // The power of a rating is that rating's column of the row (web/catalog.js reads it from the header): a "Prime"
        // check offering only the row's standby figures quotes numbers that are in the row, so the test above passes it.
        const rating = x.status === "met" && x.part === "genset" && ratingOf(x), row = rating && rowOf(c.genset?.src || c.engine?.src);
        const want = row?.power?.[rating];
        if (want) {
          const off = numbersLoose(x.offered), others = Object.entries(row.power).filter(([k]) => k !== rating).flatMap(([, p]) => [p.kVA, p.kW]).filter((v) => v != null && v !== want.kVA && v !== want.kW);
          if (!off.includes(want.kVA) && !off.includes(want.kW) && off.some((v) => others.includes(v))) reasons.push(`số công suất không phải cột ${rating} của dòng bảng (${[want.kVA && `${want.kVA} kVA`, want.kW && `${want.kW} kW`].filter(Boolean).join(" / ")})`);
        }
        // A figure the sources of this model give differently is not "met" (e.g. 14 L on one page, 10.8 on another).
        const list = factsOf(c, x.part), line = norm(x.factSrc?.line || c[x.part]?.src?.line || "");
        // Only the figures the check offers: quoted in sourceQuote and stated in `offered` (a number of it, or its words).
        const bad = factConflicts(list), q = norm(x.sourceQuote), off = norm(x.offered), offNums = numbersLoose(x.offered);
        const offers = (f) => { const n = numbersLoose(f.value); return n.length ? n.some((v) => offNums.includes(v)) : off.includes(norm(f.value)); };
        const hit = line ? [...new Set(list.filter((f) => norm(f.line) === line && q.includes(norm(f.value)) && offers(f) && bad.has(f.key)).map((f) => f.key))] : [];
        if (hit.length && x.status === "met") {
          x.status = "unclear"; x.conflict = true;
          x.note = [x.note, `Các nguồn ghi khác nhau: ${hit.map((k) => `${CAT.SPEC[k]?.vi || k} ${bad.get(k).join(" / ")}`).join("; ")}. Cần nhà cung cấp xác nhận.`].filter(Boolean).join(" ");
        }
      }
      if (!src && x.status !== "unclear") reasons.push("nguồn");
      if (reasons.length) {
        x.unverified = true;
        if (x.status === "met") { x.status = "unclear"; x.note = [x.note, `Code chưa tìm thấy nguyên văn (${reasons.join(", ")}) nên chưa tính là đạt.`].filter(Boolean).join(" "); }
        problems.push(`#${c.rank} ${x.item}: ${reasons.join(", ")}`);
      }
      // An "unclear" whose source has a line about it: the agent wrote "Nguồn không ghi" for the event log of a DSE8610
      // whose datasheet says "The event log records 250 events" (2026-11-03). The code does not judge the line; it
      // names it, the agent reads it (check prints it) and the web shows it.
      const h = x.status === "unclear" && !x.byCode && hintFor(c, x);
      if (h) { x.hint = h; hints.push(`#${c.rank} ${x.item}: ${h.where} có dòng: ${JSON.stringify(h.line)}${h.factSrc ? ` — factSrc ${JSON.stringify(h.factSrc)}` : ""}`); }
    }
    if (groups.size) c.checks = c.checks.flatMap((x) => {
      if (!x.group) return [x];
      const g = x.group, parts = c.checks.filter((y) => y.group === g);
      if (parts[0] !== x) return [];
      g.parts = parts.map(({ group, name, item, part, level, ...p }) => ({ ...p, item: name }));
      Object.assign(g, { part: x.part, level: x.level });
      // Met only when every function is met; one not met makes the group not met.
      const st = (s) => g.parts.filter((p) => p.status === s).map((p) => p.item);
      g.status = st("not_met").length ? "not_met" : st("met").length === g.parts.length ? "met" : "unclear";
      g.offered = `Đạt ${st("met").length}/${g.parts.length}`;
      g.note = [st("not_met").length && `Không đạt: ${st("not_met").join(", ")}.`, st("unclear").length && `Chưa rõ: ${st("unclear").join(", ")}.`].filter(Boolean).join(" ");
      delete g.sourceQuote; delete g.factSrc;
      g.unverified = g.parts.some((p) => p.unverified) || undefined;
      if (g.hsmtQuote && !inHsmt(g.hsmtQuote)) {
        g.unverified = true; problems.push(`#${c.rank} ${g.item}: câu trích HSMT`);
        if (g.status === "met") g.status = "unclear";
      }
      return [g];
    });
    // Suppliers: only ids of the supplier DB, each with a row of its own tables that names this engine (and alternator).
    const squash = (s) => norm(s).replace(/\s/g, "");
    c.suppliers = (c.suppliers || []).filter((s) => {
      if (sup.has(s.supplierId)) return true;
      problems.push(`#${c.rank}: nhà cung cấp ${s.supplierId} không có trong hệ thống, đã bỏ`);
      return false;
    }).slice(0, 3);
    for (const s of c.suppliers) {
      const t = (sup.get(s.supplierId).specTables || []).find((x) => x.n === Number(s.n) && x.rows.some((l) => norm(l) === norm(s.line)));
      const row = t ? squash([...(t.header || []), s.line, t.title].join(" ")) : "";
      if (!t) { s.unverified = true; problems.push(`#${c.rank}: dòng bảng của ${s.supplierId} không có trong CSDL`); continue; }
      if (c.engine?.model && !row.includes(squash(c.engine.model))) { s.unverified = true; problems.push(`#${c.rank}: dòng của ${s.supplierId} không ghi động cơ ${c.engine.model}`); }
      s.hasAlternator = !!c.alternator?.model && row.includes(squash(c.alternator.model));
      const ck = c.controller?.model && CAT.keyOf(c.controller.model);
      s.hasController = !!ck && (row.includes(squash(c.controller.model)) || (sup.get(s.supplierId).controllers || []).some((x) => x.model && CAT.keyOf(x.model) === ck));
    }
    if (!c.suppliers.length) c.gaps = [...(c.gaps || []), "Chưa có nhà cung cấp nào trong hệ thống có dòng bảng chào đúng cấu hình này."];
  }
  if (problems.length) result.notes = [...(result.notes || []), `Kiểm tra bằng code: ${problems.length} điểm chưa khớp nguồn, đã đánh dấu ⚠.`];
  if (!result.configs.length && !result.message) result.message = "Không có động cơ và đầu phát nào trong hệ thống hay trên internet đáp ứng đủ yêu cầu của HSMT.";
  return { result, problems, hints };
}
function checkDir(dir, suppliers, added = [], origin) {
  const result = JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8"));
  // A supplier added from the internet: its rows were numbered in newCatalog.json, renumbered when added.
  for (const a of added) if (a.nmap) for (const c of result.configs || []) for (const s of c.suppliers || []) if (s.supplierId === a.supplierId && a.nmap[s.n] != null) s.n = a.nmap[s.n];
  if (added.length) result.catalogAdded = added.map(({ nmap, ...a }) => a);
  const readWeb = (f) => { const p = path.join(dir, f); return p.startsWith(path.join(dir, "web")) && fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
  const out = check(result, { hsmtText: fs.readFileSync(path.join(dir, "hsmt.txt"), "utf8"), suppliers, readWeb, origin });
  rankConfigs(out.result);
  return out;
}
// The order of the configurations and of their suppliers, set in code (Khoa, 2026-11-02): the engine and the
// controller first, then the alternator and the genset as a whole; options (tank, size, noise...) come last. In each
// group a "not met" weighs more than a supplier that fits, which weighs more than an "unclear"; a core requirement with
// no check counts as unclear, so a configuration checked on fewer points is not ranked higher. Ties keep the agent's order.
const groupOf = (x) => (x.level === "option" ? 2 : x.part === "engine" || x.part === "controller" ? 0 : 1);
export function scoreOf(c, reqs = []) {
  const n = [[0, 0], [0, 0], [0, 0]], seen = new Set();
  for (const x of c.checks || []) {
    seen.add(norm(x.item));
    const g = groupOf(x);
    if (x.status === "not_met") n[g][0]++; else if (x.status !== "met" || x.unverified) n[g][1]++;
  }
  for (const r of reqs) if (!seen.has(norm(r.item))) n[groupOf(r)][1]++;
  const fits = (c.suppliers || []).some((s) => !s.unverified) ? 0 : 1;
  return [n[0][0], n[1][0], fits, n[0][1], n[1][1], n[2][0], n[2][1]];
}
// A configuration with no controller, when the HSMT asks for one, is "not met" on the controller (Khoa, 2026-11-02):
// its controller checks would all be "unclear", which ranked it above configurations that offer one but miss a point
// elsewhere. The check is written by the code and shown like the others.
export const NO_CONTROLLER = "Bộ điều khiển của cấu hình";
function noController(c, reqs) {
  const has = !!c.controller?.model && !c.controller.unverified, mine = (x) => x.byCode && x.item === NO_CONTROLLER;
  // A controller added later (Tìm NCC's check) takes the code's check away again.
  if (has) { if ((c.checks || []).some(mine)) c.checks = c.checks.filter((x) => !mine(x)); return; }
  if (!reqs.some((r) => r.part === "controller" && r.level !== "option") || (c.checks || []).some(mine)) return;
  c.checks = [{ item: NO_CONTROLLER, requirement: "Có bộ điều khiển đáp ứng các yêu cầu bộ điều khiển của HSMT", offered: "Không có bộ điều khiển nào có nguồn trong cấu hình này",
    part: "controller", level: "core", status: "not_met", byCode: true, note: "Code ghi: cấu hình không có bộ điều khiển nên tính là không đạt ở bộ điều khiển." }, ...(c.checks || [])];
}
export function rankConfigs(result) {
  const reqs = result.requirements || [];
  for (const c of result.configs || []) noController(c, reqs);
  const cmp = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
  const list = (result.configs || []).map((c, i) => ({ c, i, s: scoreOf(c, reqs) }));
  list.sort((x, y) => cmp(x.s, y.s) || (x.c.rank ?? x.i) - (y.c.rank ?? y.i) || x.i - y.i);
  result.configs = list.map(({ c }, i) => {
    // Suppliers: one offering both the engine (its checked row names it) and the controller first, then one whose
    // row names the engine, then the genset row's own supplier, one whose row names the alternator, then the agent's
    // order (confidence, role).
    const sup = (c.suppliers || []).map((s, j) => ({ s, k: [!s.unverified && s.hasController ? 0 : 1, s.unverified ? 1 : 0, c.genset?.src?.supplierId === s.supplierId ? 0 : 1, s.hasAlternator ? 0 : 1, j] }));
    sup.sort((x, y) => cmp(x.k, y.k));
    return { ...c, rank: i + 1, suppliers: sup.map((x) => x.s) };
  });
  return result;
}

// ---------- add internet finds to the catalog ----------
// newCatalog.json (agent, only after an internet search): supplier records in the schema.json shape whose sources
// point at pages saved with `save` (web/<k>.txt). For a supplier already in the system only its new sources,
// productLines and specTables are added. Sources are renumbered after the record's own (from 2001) and the saved
// page becomes sources/<id>/<n>.md, the way fetch-source.mjs writes it (Khoa, 2026-10-29).
export function catalogRecords(entries, { existing, readWeb, today }) {
  const out = [];
  for (const e of Array.isArray(entries) ? entries : []) {
    const id = String(e?.id || "");
    if (!/^[a-z0-9-]+$/.test(id)) { out.push({ id, error: "id không hợp lệ" }); continue; }
    const old = existing.get(id) || null, files = {}, nmap = new Map(), sources = [];
    // 2001–2999: pages of internet finds; 3001–3999 belong to controllers.mjs --crawl.
    let next = Math.max(2000, ...(old?.sources || []).map((s) => s.n).filter((n) => n < 3000)) + 1, error = "";
    for (const s of e.sources || []) {
      const txt = /^web\/\d+\.txt$/.test(s.file || "") ? readWeb(s.file) : null;
      if (!txt) { error = `nguồn ${s.n}: không có trang đã lưu ${s.file}`; break; }
      const [, url = "", accessed = ""] = txt.match(/^URL:\s*(\S+)\s*\nAccessed:\s*(\S+)/) || [];
      const n = next++, file = `sources/${id}/${n}.md`;
      nmap.set(Number(s.n), n); files[file] = txt;
      sources.push({ n, url, accessedAt: accessed, tier: s.tier, quote: s.quote, file });
    }
    if (error) { out.push({ id, error }); continue; }
    const re = (src) => (Array.isArray(src) ? src.map((n) => nmap.get(Number(n)) ?? -1) : src);
    const lines = (e.productLines || []).map((p) => ({ ...p, src: re(p.src), ...(p.power ? { power: { ...p.power, src: re(p.power.src) } } : {}) }));
    const tables = (e.specTables || []).map((t) => ({ ...t, n: nmap.get(Number(t.n)) ?? -1 }));
    const ctrls = (e.controllers || []).map((c) => ({ brand: c.brand, model: c.model || null, text: c.text, line: c.line, src: re(c.src) }));
    const rec = old
      ? { ...old, sources: [...old.sources, ...sources], productLines: [...(old.productLines || []), ...lines], specTables: [...(old.specTables || []), ...tables], ...(ctrls.length ? { controllers: [...(old.controllers || []), ...ctrls] } : {}), checkedAt: today }
      : { country: e.country, role: e.role, status: "partial", names: e.names || {}, website: e.website || null, hq: e.hq || { province: null, city: null },
        founded: null, relatedIds: [], strengths: (e.strengths || []).map((x) => ({ ...x, src: re(x.src) })), productLines: lines,
        certifications: (e.certifications || []).map((x) => ({ ...x, src: re(x.src) })), exportMarkets: [], missing: e.missing || [],
        sources, confidence: e.confidence, checkedAt: today, checkedBy: "config-bot", specTables: tables, ...(ctrls.length ? { controllers: ctrls } : {}), id };
    out.push({ id, rec, files, nmap, isNew: !old, tables: tables.length });
  }
  return out;
}

const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
// Writes the records into a fresh worktree of the repo (origin/main), checks them with that tree's verify.mjs, posts
// the ones that pass to the web as supplier/<id> and opens a pull request with them (records, saved pages).
// opts (Tìm NCC): its own branch and PR title, so a Gemini round and a Claude round never share a branch.
// The repo is private on the Free plan, so GitHub auto-merge is off. A detached process waits for CI on the PR and
// squash-merges it when every check passes; a failed check leaves the PR open. The run does not wait for it.
function mergeWhenGreen(pr, cwd) {
  const gh = process.env.GENBID_GH || "gh";
  const code = `const { spawnSync } = require("node:child_process"), [gh, pr] = process.argv.slice(1);
setTimeout(() => {
  const opt = { stdio: "ignore", windowsHide: true };
  if (spawnSync(gh, ["pr", "checks", pr, "--watch", "--fail-fast", "--interval", "20"], opt).status === 0)
    spawnSync(gh, ["pr", "merge", pr, "--squash", "--delete-branch"], opt);
}, 30000);`;
  try { spawn(process.execPath, ["-e", code, gh, pr], { cwd: os.tmpdir(), detached: true, stdio: "ignore", windowsHide: true }).unref(); } catch {}
}

export async function addToCatalog(dir, key, suppliers, opts = {}) {
  const file = path.join(dir, "newCatalog.json");
  if (!fs.existsSync(file)) return { added: [], records: [] };
  const repo = process.env.GENBID_REPO_DIR || path.join(ROOT, ".."), branch = opts.branch || `catalog/${key.toLowerCase()}`;
  const wt = path.join(os.tmpdir(), "genbid-catalog", branch.replace(/[^\w-]+/g, "-"));
  const title = opts.title || `Danh mục: bổ sung từ Gợi ý cấu hình ${key}`;
  const body = opts.body || `Tìm trên internet khi Gợi ý cấu hình gói ${key} không có nhà cung cấp phù hợp trong hệ thống. Bản ghi đã qua verify.mjs và đã đăng lên web.`;
  fs.rmSync(wt, { recursive: true, force: true });
  git(repo, "fetch", "-q", "origin", "main");
  git(repo, "worktree", "add", "-f", "-B", branch, wt, "origin/main");
  const added = [], records = [];
  try {
    const { checkRecord } = await import(pathToFileURL(path.join(wt, "suppliers", "verify.mjs")).href + `?${Date.now()}`);
    // The repo copy of a record comes with its saved pages, which verify.mjs reads.
    const existing = new Map(suppliers.map((s) => [s.id, s])), cnDir = path.join(wt, "suppliers", "cn");
    for (const f of fs.readdirSync(cnDir).filter((f) => f.endsWith(".json"))) existing.set(f.slice(0, -5), JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8")));
    const readWeb = (f) => { const p = path.join(dir, f); return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
    for (const x of catalogRecords(JSON.parse(fs.readFileSync(file, "utf8")), { existing, readWeb, today: new Date().toISOString().slice(0, 10) })) {
      if (x.error) { added.push({ supplierId: x.id, error: x.error }); continue; }
      for (const [f, txt] of Object.entries(x.files)) { fs.mkdirSync(path.dirname(path.join(wt, "suppliers", f)), { recursive: true }); fs.writeFileSync(path.join(wt, "suppliers", f), txt, "utf8"); }
      const recFile = path.join(wt, "suppliers", "cn", `${x.id}.json`);
      const { errors } = checkRecord(x.rec, recFile);
      if (errors.length) {
        for (const f of Object.keys(x.files)) fs.rmSync(path.join(wt, "suppliers", f), { force: true });
        added.push({ supplierId: x.id, error: `verify.mjs: ${errors.slice(0, 4).join("; ")}${errors.length > 4 ? ` (+${errors.length - 4})` : ""}` });
        continue;
      }
      fs.writeFileSync(recFile, JSON.stringify(x.rec, null, 2) + "\n", "utf8");
      records.push(x.rec);
      added.push({ supplierId: x.id, name: x.rec.names?.en || x.rec.names?.zh || x.id, isNew: x.isNew, tables: x.tables, nmap: Object.fromEntries(x.nmap) });
    }
    // GENBID_CATALOG_DRY=1: check only, nothing is posted or pushed.
    if (records.length && !process.env.GENBID_CATALOG_DRY) {
      await post(records.map((r) => ({ coll: "supplier", id: r.id, data: r })));
      try {
        git(wt, "add", "-A", "suppliers");
        git(wt, "-c", `user.name=${process.env.GENBID_GIT_NAME || "GenBid Bot"}`, "-c", `user.email=${process.env.GENBID_GIT_EMAIL || "genbid-bot@users.noreply.github.com"}`,
          "commit", "-q", "-m", `${title} (${records.map((r) => r.id).join(", ")})`);
        git(wt, "push", "-q", "-f", "-u", "origin", branch);
        const pr = execFileSync(process.env.GENBID_GH || "gh", ["pr", "create", "--head", branch, "--base", "main", "--title", title, "--body", body], { cwd: wt, encoding: "utf8" }).trim();
        for (const a of added) if (!a.error) a.pr = pr.split("\n").pop();
        mergeWhenGreen(pr.split("\n").pop(), wt);
      } catch (e) { for (const a of added) if (!a.error) a.prError = `Đã đăng lên web nhưng chưa mở được PR vào repo: ${String(e.stderr || e.message).trim().slice(0, 200)}`; }
    }
  } finally {
    try { git(repo, "worktree", "remove", "-f", wt); } catch { fs.rmSync(wt, { recursive: true, force: true }); }
    try { git(repo, "branch", "-D", branch); } catch {}
  }
  return { added, records };
}

// ---------- run ----------
async function answer(req, suppliers) {
  const key = req.key, dir = path.join(os.tmpdir(), "genbid-config", key);
  fs.rmSync(dir, { recursive: true, force: true });
  // configreq keeps the request's own fields and gets doneAt (+ error); configmatch carries the verified result.
  const done = ({ result, error }) => {
    const at = new Date().toISOString();
    const reqData = { notifyNo: req.notifyNo || key, bidName: req.bidName, origin: req.origin, extra: req.extra, requestedAt: req.requestedAt, by: req.by, from: req.from, doneAt: at, error: error || "" };
    return post([...(result ? [{ coll: "configmatch", id: key, data: { at, result } }] : []), { coll: "configreq", id: key, data: JSON.parse(JSON.stringify(reqData)) }]);
  };
  try {
    const info = await prep(key, dir, { ...req, prevResult: (await doc("configmatch", key).catch(() => null))?.result }, suppliers);
    // Same minimal setup as the bot's agent (GenBid-Bot.ps1), plus web search for step 3 of config-prompt.md.
    const r = await runClaude(dir, "Đọc prompt.md trong thư mục này và làm đúng như vậy: đọc input.md, hsmt.txt, catalog.md, chỉ ghi result.json (và newCatalog.json khi prompt.md yêu cầu). Chạy không người trông, không ai trả lời câu hỏi.");
    fs.writeFileSync(path.join(os.tmpdir(), `genbid-config-${key}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
    if (!fs.existsSync(path.join(dir, "result.json"))) throw new Error(`Agent không trả kết quả${r.error ? `: ${r.error.message}` : r.status ? ` (mã ${r.status})` : ""}.`);
    // Internet finds that pass verify.mjs join the catalog first, so the configuration's suppliers can point at them.
    const { added, records } = await addToCatalog(dir, key, suppliers).catch((e) => ({ added: [{ error: `Chưa bổ sung được vào danh mục: ${e.message}` }], records: [] }));
    const all = [...suppliers.filter((s) => !records.some((r) => r.id === s.id)), ...records];
    const { result, problems } = checkDir(dir, all, added, originOfReq(req.origin));
    if (extraOf(req)) result.extra = extraOf(req);
    // Read again next time only when the HSMT or Yêu cầu khác changed (prep, requirements.json).
    if (!(result.requirements || []).some((r) => r.unverified)) result.reqHash = info.reqHash;
    await done({ result, error: "" });
    console.log(`${key}: ${result.configs.length} cấu hình${problems.length ? `, ${problems.length} điểm chưa khớp nguồn` : ""}`);
  } catch (e) {
    await done({ error: e.message || String(e) }).catch(() => {});
    console.log(`${key}: lỗi ${e.message}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

// The log is the agent's whole stream, each line with the seconds since the start, to see where a run's minutes go
// (every tool call and its result); nothing else reads stdout.
const CLAUDE_TIMEOUT = 40 * 60e3;
function runClaude(dir, input) {
  const t0 = Date.now(), args = ["-p", "--permission-mode", "auto", "--output-format", "stream-json", "--verbose", "--model", process.env.GENBID_CONFIG_MODEL || "opus",
    "--strict-mcp-config", "--disable-slash-commands", "--tools", "Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch"];
  return new Promise((ok) => {
    let out = "", err = "", buf = "", done = false, late = false;
    const stamp = (l) => `[${Math.round((Date.now() - t0) / 1000)}s] ${l}\n`;
    const p = spawn(CLAUDE, args, { cwd: dir, windowsHide: true });
    const timer = setTimeout(() => { late = true; p.kill(); }, CLAUDE_TIMEOUT);
    const end = (status, error) => { if (done) return; done = true; clearTimeout(timer); if (buf) out += stamp(buf); ok({ stdout: out, stderr: err, status, error }); };
    p.stdout.setEncoding("utf8").on("data", (d) => { buf += d; for (let i; (i = buf.indexOf("\n")) >= 0; buf = buf.slice(i + 1)) out += stamp(buf.slice(0, i)); });
    p.stderr.setEncoding("utf8").on("data", (d) => { err += d; });
    p.on("error", (e) => end(null, e));
    p.on("close", (code) => end(code, late ? new Error(`quá ${CLAUDE_TIMEOUT / 60e3} phút`) : null));
    p.stdin.on("error", () => {});
    p.stdin.end(input);
  });
}

// ---------- Tìm NCC (findreq/<TBMT> → findmatch/<TBMT>) ----------
// "Tìm NCC" next to "Gợi ý" (Khoa, 2026-10-31): search the internet for more suppliers that fit the tender's technical
// requirements and add them to the catalog, following find-prompt.md in a folder made by prep. Claude (Opus) only
// (Khoa, 2026-11-03: Gemini took ~23 minutes a run and seldom found a row that fit). GENBID_FIND_ENGINES=gemini,claude
// puts Gemini (Antigravity CLI) back first.
const FIND_ENGINES = (process.env.GENBID_FIND_ENGINES || "claude").split(",").map((s) => s.trim()).filter((s) => s === "gemini" || s === "claude");
const AGY = process.env.GENBID_AGY || path.join(process.env.LOCALAPPDATA || "", "agy", "bin", "agy.exe");
const GEMINI_MODEL = process.env.GENBID_GEMINI_MODEL || "gemini-3.8-flash-medium";
const ENGINE = { gemini: "Gemini (Antigravity)", claude: "Claude" };
const FIND_INPUT = "Đọc prompt.md trong thư mục này và làm đúng như vậy: đọc input.md và catalog.md, tìm trên internet, chỉ ghi newCatalog.json và find.json (cùng các trang lưu bằng lệnh save). Chạy không người trông, không ai trả lời câu hỏi.";
function runGemini(dir, input) {
  if (!fs.existsSync(AGY)) return { error: "chưa cài Antigravity CLI (agy)" };
  const r = spawnSync(AGY, ["--model", GEMINI_MODEL, "--output-format", "json", "--disable-slash-commands", "--dangerously-skip-permissions", "--print-timeout", "2400s"],
    { cwd: dir, encoding: "utf8", timeout: 42 * 60e3, maxBuffer: 64 << 20, windowsHide: true, input });
  let j = null; try { j = JSON.parse(r.stdout); } catch {}
  return { stdout: r.stdout, stderr: r.stderr, error: j?.status === "SUCCESS" ? "" : (j?.response || r.stderr || r.error?.message || `mã thoát ${r.status}`).trim().slice(0, 300) };
}
async function findPrep(key, dir, req, suppliers) {
  const info = await prep(key, dir, req, suppliers);
  // Tìm NCC must see every supplier in the system (not only those of the candidate rows), so as not to suggest them again.
  const cat = fs.readFileSync(path.join(dir, "catalog.md"), "utf8"), cut = cat.indexOf("\n\n# Nhà cung cấp trong hệ thống");
  fs.writeFileSync(path.join(dir, "catalog.md"), (cut >= 0 ? cat.slice(0, cut) : cat) + "\n\n" + suppliersMd(JSON.parse(fs.readFileSync(path.join(dir, "suppliers.json"), "utf8"))), "utf8");
  const watch = fs.existsSync(path.join(ROOT, "discover-watchlist.json")) ? JSON.parse(fs.readFileSync(path.join(ROOT, "discover-watchlist.json"), "utf8")) : [];
  const head = [
    `# Tìm NCC cho gói ${key}`, "",
    `Lệnh kiểm tra newCatalog.json: node "${SCRIPT}" find-check --dir .`,
    `Lệnh kiểm tra đã có: node "${path.join(ROOT, "discover.mjs")}" check "<tên công ty hoặc website>"`,
    "", "## Công ty Khoa hay làm việc (tìm riêng theo tên trước)", ...watch.map((w) => `- ${w.name}${w.note ? ` (${w.note})` : ""}`), "", "",
  ].join("\n");
  const input = path.join(dir, "input.md");
  fs.writeFileSync(input, head + fs.readFileSync(input, "utf8"), "utf8");
  fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(path.join(ROOT, "find-prompt.md"), "utf8"), "utf8");
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ origin: info.origin, cap: info.cap }), "utf8");
  return info;
}
// A product line of the record that covers the tender's power, in the tender's unit (95% to 140%, as catalog.md).
export function fitsCap(rec, cap) {
  if (!cap) return (rec.productLines || []).some((p) => p.power);
  return (rec.productLines || []).some((p) => p.power?.unit === cap.unit && p.power.min <= cap.value * 1.4 && p.power.max >= cap.value * 0.95);
}
// newCatalog.json checked offline, the way addToCatalog will: records built with catalogRecords, then verify.mjs on a
// copy in <dir>/_check with the saved pages. For a supplier already in the system only its new parts are checked
// (its own pages are not here) and only its new product lines count for the power.
export async function findCheck(dir, suppliers, cap) {
  const file = path.join(dir, "newCatalog.json"), out = [];
  if (!fs.existsSync(file)) return [{ id: "", errors: ["chưa có newCatalog.json"] }];
  let entries; try { entries = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return [{ id: "", errors: [`newCatalog.json không phải JSON: ${e.message}`] }]; }
  const chk = path.join(dir, "_check");
  fs.rmSync(chk, { recursive: true, force: true }); fs.mkdirSync(path.join(chk, "cn"), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "verify.mjs"), path.join(chk, "verify.mjs"));
  const { checkRecord } = await import(pathToFileURL(path.join(chk, "verify.mjs")).href + `?${Date.now()}`);
  const readWeb = (f) => { const p = path.join(dir, f); return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; };
  const existing = new Map(suppliers.map((s) => [s.id, s]));
  for (const x of catalogRecords(entries, { existing, readWeb, today: new Date().toISOString().slice(0, 10) })) {
    if (x.error) { out.push({ id: x.id, errors: [x.error] }); continue; }
    for (const [f, txt] of Object.entries(x.files)) { fs.mkdirSync(path.dirname(path.join(chk, f)), { recursive: true }); fs.writeFileSync(path.join(chk, f), txt, "utf8"); }
    const own = new Set(x.nmap.values()), isOwn = (src) => Array.isArray(src) && src.length && src.every((n) => own.has(n));
    const rec = x.isNew ? x.rec : { ...x.rec, sources: x.rec.sources.filter((s) => own.has(s.n)), productLines: (x.rec.productLines || []).filter((p) => isOwn(p.src)),
      specTables: (x.rec.specTables || []).filter((t) => own.has(t.n)), controllers: (x.rec.controllers || []).filter((c) => isOwn(c.src)), strengths: [], certifications: [], contacts: [], vietnam: undefined, founded: null };
    out.push({ id: x.id, isNew: x.isNew, errors: checkRecord(rec, path.join(chk, "cn", `${x.id}.json`)).errors, fits: fitsCap(rec, cap) });
  }
  return out;
}
// Suppliers Tìm NCC added go into the suggested configurations in code, with no agent and no tokens (Khoa,
// 2026-11-01), from its table rows (web/catalog.js) for an engine of the origin asked for whose smallest rating is 100%
// to 140% of the tender's power (Khoa, 2026-11-02): a row with the engine (and, when both name one, the alternator) of
// a configuration already suggested adds the supplier under it; a supplier that joins none becomes a new configuration,
// marked fromFind, from its row closest to the power, with that supplier alone. The new one's only check is the power
// read from that row, left "unclear", since nothing else of the HSMT was compared with it. Every model and line is the
// row word for word.
const powerText = (p) => Object.entries(p || {}).map(([k, v]) => `${{ prime: "Prime", standby: "Standby", rated: "Định mức" }[k] || k} ${[v.kVA && `${v.kVA} kVA`, v.kW && `${v.kW} kW`].filter(Boolean).join(" / ")}`).join(", ");
export function mergeFind(result, records, { cap, origin, max = 5 } = {}) {
  const ids = new Set(records.map((r) => r.id)), keyOf = CAT.keyOf;
  // The row's smallest rating (prime when it gives both) is at least the tender's power, and not past 140% of it.
  const near = (u) => !cap || (rowPower(u, cap) >= cap.value && rowPower(u, cap) <= cap.value * 1.4);
  const lineOf = (u, model) => u.line || (u.lines?.rows || []).find((l) => keyOf(l).includes(keyOf(model))) || null;
  const configs = result.configs || (result.configs = []), out = { joined: [], created: [] };
  const o = originOfReq(origin), cn = cnSuppliers(records), rows = new Map();
  for (const e of byOrigin(CAT.build(records).engines, o, cn)) {
    // Under "cn" a foreign engine comes only with the suppliers based in China that offer it.
    const viaCn = o === "cn" && CAT.originOf(e) === "other";
    for (const u of e.uses) {
      if (!ids.has(u.supplierId) || !near(u) || !lineOf(u, e.model) || (viaCn && !cn.has(u.supplierId))) continue;
      rows.set(u.supplierId, [...(rows.get(u.supplierId) || []), { e, u, d: cap ? Math.abs(rowPower(u, cap) - cap.value) : 0 }]);
    }
  }
  // The same configuration: the same engine, and the same alternator when both name one.
  const same = (c, { e, u }) => c.engine?.model && keyOf(c.engine.model) === e.key && (!c.alternator?.model || !u.other || keyOf(c.alternator.model) === keyOf(u.other));
  const mineOf = (r) => (rows.get(r.id) || []).sort((a, b) => a.d - b.d);
  // The controllers the supplier's pages name (controllers.mjs) are said too, as recorded.
  const entry = (r, { e, u }) => {
    const ctrls = [...new Set((r.controllers || []).filter((c) => c.model).map((c) => c.model))];
    return { supplierId: u.supplierId, n: u.n, line: lineOf(u, e.model), fromFind: true, why: `Nhà cung cấp mới tìm được (Tìm NCC): dòng bảng ghi động cơ ${e.model}${u.power ? ` (${powerText(u.power)})` : ""}.${ctrls.length ? ` Bộ điều khiển trên trang của nhà cung cấp: ${ctrls.join(", ")}.` : ""}` };
  };
  // Adds the supplier under every configuration it has a row for; true when there is one. A second run adds nothing twice.
  const join = (r) => {
    let found = false;
    for (const c of configs) {
      const x = mineOf(r).find((m) => same(c, m));
      if (!x) continue;
      found = true;
      c.suppliers = c.suppliers || [];
      if (!c.suppliers.some((s) => s.supplierId === r.id)) { c.suppliers.push(entry(r, x)); out.joined.push({ rank: c.rank, supplierId: r.id }); }
    }
    return found;
  };
  const listed = (r) => configs.some((c) => c.suppliers?.some((s) => s.supplierId === r.id));
  for (const r of records) join(r);
  for (const r of records) {
    const mine = mineOf(r);
    // A configuration made just before for another supplier found may already be this one's.
    if (!mine.length || listed(r) || join(r) || out.created.length >= max) continue;
    const { e, u } = mine[0], line = lineOf(u, e.model), src = { kind: "catalog", supplierId: u.supplierId, n: u.n, line };
    const c = {
      rank: Math.max(0, ...configs.map((x) => x.rank || 0)) + 1, fromFind: true,
      engine: { model: e.model, ...(e.make ? { make: e.make } : {}), src },
      ...(u.other ? { alternator: { model: u.other, src } } : {}),
      ...(u.genset ? { genset: { model: u.genset, src } } : {}),
      ...((ctl) => (ctl ? { controller: { model: ctl.model, make: ctl.brand, src } } : {}))(CAT.controllersIn(line).find((x) => x.model)),
      checks: [{ item: "Công suất", part: "genset", requirement: cap ? `khoảng ${cap.value} ${cap.unit}` : "", offered: powerText(u.power) || "—", sourceQuote: line, status: "unclear",
        note: "Bổ sung tự động từ Tìm NCC, không dùng AI: công suất nhỏ nhất ghi trong dòng bảng từ 100% đến 140% công suất của gói. Các yêu cầu khác của HSMT chưa được đối chiếu (bấm Gợi ý lại nếu cần)." }],
      suppliers: [entry(r, mine[0])],
      gaps: ["Cấu hình bổ sung từ Tìm NCC: chưa đối chiếu từng yêu cầu kỹ thuật của HSMT.", ...(result.extra ? [`Chưa đối chiếu Yêu cầu khác: ${result.extra}`] : [])],
    };
    configs.push(c);
    out.created.push({ rank: c.rank, engine: e.model, supplierId: u.supplierId });
  }
  // The other suppliers found with a row for a configuration made here are added under it too.
  for (const r of records) join(r);
  return out;
}
// Reads configmatch/<key> and posts it back with the new suppliers merged in. No configmatch yet: nothing to merge into.
async function mergeFindIntoConfig(key, records, { cap, origin, suppliers = records }) {
  const prev = await doc("configmatch", key);
  if (!prev?.result) return null;
  const result = JSON.parse(JSON.stringify(prev.result)), out = mergeFind(result, records, { cap, origin: result.origin || origin });
  if (!out.joined.length && !out.created.length) return out;
  const at = new Date().toISOString().slice(0, 16).replace("T", " ");
  result.notes = [...(result.notes || []), `Tìm NCC lúc ${at} UTC: ${mergeText(out)}, bằng code từ dòng bảng của nhà cung cấp.`];
  // The new configurations are checked against the stored requirements by a small agent (Khoa, 2026-11-02).
  if (out.created.length) {
    const all = [...suppliers.filter((s) => !records.some((r) => r.id === s.id)), ...records];
    out.checked = await checkNewConfigs(key, result, out.created.map((c) => c.rank), all, cap).catch((e) => ({ error: e.message }));
    result.notes.push(out.checked.error ? `Chưa đối chiếu được cấu hình mới với HSMT: ${out.checked.error}` : `Đã đối chiếu ${out.checked.checked} cấu hình mới với ${result.requirements.length} yêu cầu của HSMT${out.checked.problems ? `, ${out.checked.problems} điểm chưa khớp nguồn` : ""}.`);
  }
  rankConfigs(result);
  await post([{ coll: "configmatch", id: key, data: { ...prev, at: new Date().toISOString(), result } }]);
  return out;
}
// Tìm NCC: the configurations made in code for the suppliers found have only their power read. A small agent
// (check-prompt.md) checks each against the requirements stored with the suggestion, reading only those
// configurations and the figures of their models; check() verifies its answer as for Gợi ý.
async function checkNewConfigs(key, result, ranks, suppliers, cap) {
  const mine = (result.configs || []).filter((c) => ranks.includes(c.rank) && c.engine?.model);
  if (!mine.length) return { checked: 0 };
  if (!result.requirements?.length) throw new Error("gợi ý trước không có danh sách yêu cầu");
  const dir = path.join(os.tmpdir(), "genbid-findcheck", key);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(path.join(dir, "web"), { recursive: true });
  try {
    const { text } = await hsmtTextOf(key);
    fs.writeFileSync(path.join(dir, "hsmt.txt"), text, "utf8");
    const cat = CAT.build(suppliers), focus = new Set(mine.map((c) => CAT.keyOf(c.engine.model)));
    const { md, ctlMd, shown } = catalogMd(cat, cap, hintsOf(text, result.extra || ""), { suppliers, origin: "all", focus });
    fs.writeFileSync(path.join(dir, "catalog.md"), md + "\n\n" + suppliersMd(suppliers.filter((s) => shown.has(s.id))), "utf8");
    if (ctlMd) fs.writeFileSync(path.join(dir, "controllers.md"), ctlMd, "utf8");
    fs.writeFileSync(path.join(dir, "suppliers.json"), JSON.stringify(suppliers), "utf8");
    fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ origin: result.origin || "all" }), "utf8");
    fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify({ requirements: result.requirements, configs: mine.map(({ checks, ...c }) => ({ ...c, checks: [] })) }, null, 1), "utf8");
    fs.writeFileSync(path.join(dir, "prompt.md"), fs.readFileSync(path.join(ROOT, "check-prompt.md"), "utf8").replace("<check>", `node "${SCRIPT}" check --dir .`) + formulasMd(), "utf8");
    const r = await runClaude(dir, "Đọc prompt.md trong thư mục này và làm đúng như vậy: điền checks cho các cấu hình trong result.json, chỉ sửa result.json. Chạy không người trông, không ai trả lời câu hỏi.");
    fs.writeFileSync(path.join(os.tmpdir(), `genbid-findcheck-${key}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
    const got = JSON.parse(fs.readFileSync(path.join(dir, "result.json"), "utf8"));
    return mergeChecked(result, got, { hsmtText: text, suppliers, origin: result.origin });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
// The agent's checks (and controller) for the configurations of `got`, verified by check() and put back by rank.
// Only checks and the controller are taken: the engine, alternator, genset and suppliers stay as the code made them.
export function mergeChecked(result, got, { hsmtText, suppliers, origin }) {
  const byRank = new Map((result.configs || []).map((c) => [c.rank, c]));
  const sub = { requirements: JSON.parse(JSON.stringify(result.requirements || [])), configs: [] };
  for (const g of got.configs || []) {
    const c = byRank.get(g.rank);
    if (!c || !Array.isArray(g.checks) || !g.checks.length) continue;
    sub.configs.push({ ...JSON.parse(JSON.stringify(c)), checks: g.checks, ...(g.controller?.model ? { controller: g.controller } : {}) });
  }
  if (!sub.configs.length) return { checked: 0, problems: 0 };
  const { result: done, problems } = check(sub, { hsmtText, suppliers, readWeb: () => null, origin: origin || "all" });
  let checked = 0;
  for (const c of done.configs) {
    const old = byRank.get(c.rank);
    if (!old) continue;
    Object.assign(old, { checks: c.checks, findChecked: true, gaps: (old.gaps || []).filter((g) => !/chưa đối chiếu từng yêu cầu/.test(g)) });
    if (c.controller) old.controller = c.controller;
    checked++;
  }
  return { checked, problems: problems.length };
}
const mergeText = (m) => (!m ? "chưa có cấu hình gợi ý để bổ sung (bấm Gợi ý)" : !m.joined.length && !m.created.length ? "không có dòng bảng nào đúng công suất và xuất xứ để bổ sung vào cấu hình" : [m.joined.length && `bổ sung ${m.joined.map((j) => `${j.supplierId} vào cấu hình #${j.rank}`).join(", ")}`, m.created.length && `thêm ${m.created.length} cấu hình mới${m.checked?.checked ? ` (đã đối chiếu HSMT ${m.checked.checked} cấu hình)` : " (chưa đối chiếu đủ HSMT)"}, mỗi cấu hình chỉ có nhà cung cấp vừa tìm được (${m.created.map((c) => c.supplierId).join(", ")})`].filter(Boolean).join("; "));

async function find(req, suppliers) {
  const key = req.key, tried = [];
  const done = ({ result, error }) => {
    const at = new Date().toISOString();
    const reqData = { notifyNo: req.notifyNo || key, bidName: req.bidName, origin: req.origin, extra: req.extra, requestedAt: req.requestedAt, by: req.by, from: req.from, doneAt: at, error: error || "" };
    return post([...(result ? [{ coll: "findmatch", id: key, data: { at, result } }] : []), { coll: "findreq", id: key, data: JSON.parse(JSON.stringify(reqData)) }]);
  };
  try {
    for (const engine of FIND_ENGINES) {
      const dir = path.join(os.tmpdir(), "genbid-find", `${key}-${engine}`);
      fs.rmSync(dir, { recursive: true, force: true });
      try {
        const { cap } = await findPrep(key, dir, req, suppliers);
        const r = engine === "gemini" ? runGemini(dir, FIND_INPUT) : await runClaude(dir, FIND_INPUT);
        fs.writeFileSync(path.join(os.tmpdir(), `genbid-find-${key}-${engine}.log`), `${r.stdout || ""}\n${r.stderr || ""}`, "utf8");
        if (r.error && !fs.existsSync(path.join(dir, "newCatalog.json"))) { tried.push({ engine: ENGINE[engine], error: r.error }); continue; }
        const checked = await findCheck(dir, suppliers, cap), fit = checked.filter((c) => !c.errors.length && c.fits);
        const info = (() => { try { return JSON.parse(fs.readFileSync(path.join(dir, "find.json"), "utf8")); } catch { return {}; } })();
        const dropped = checked.filter((c) => !fit.includes(c)).map((c) => ({ supplierId: c.id, error: c.errors.length ? `verify.mjs: ${c.errors.slice(0, 3).join("; ")}` : `không có dòng sản phẩm đúng công suất ${cap ? `${cap.value} ${cap.unit}` : ""}` }));
        if (!fit.length) { tried.push({ engine: ENGINE[engine], error: info.summary || "không tìm được nhà cung cấp nào qua được kiểm tra", dropped }); continue; }
        // Only the suppliers that passed and fit go to the catalog.
        const ids = new Set(fit.map((c) => c.id));
        fs.writeFileSync(path.join(dir, "newCatalog.json"), JSON.stringify(JSON.parse(fs.readFileSync(path.join(dir, "newCatalog.json"), "utf8")).filter((e) => ids.has(e?.id)), null, 1), "utf8");
        const { added, records } = await addToCatalog(dir, key, suppliers, { branch: `ncc/${key.toLowerCase()}-${engine}`, title: `Nhà cung cấp: Tìm NCC gói ${key} (${ENGINE[engine]})`,
          body: `Nút Tìm NCC ở tab Cấu hình gợi ý gói ${key}: ${ENGINE[engine]} tìm trên internet nhà cung cấp phù hợp yêu cầu kỹ thuật${cap ? ` (${cap.value} ${cap.unit})` : ""}. Bản ghi đã qua verify.mjs và đã đăng lên web.` });
        if (!added.some((a) => !a.error)) { tried.push({ engine: ENGINE[engine], error: "bản ghi không qua được verify.mjs của repo", dropped: added }); continue; }
        const merged = await mergeFindIntoConfig(key, records, { cap, origin: req.origin, suppliers }).catch((e) => ({ error: e.message }));
        const configMerge = merged?.error ? `chưa bổ sung được vào cấu hình gợi ý: ${merged.error}` : mergeText(merged);
        await done({ result: { engine: ENGINE[engine], cap, ...(extraOf(req) ? { extra: extraOf(req) } : {}), summary: info.summary || "", added: [...added, ...dropped], skipped: info.skipped || [], notes: info.notes || [], tried, configMerge } });
        console.log(`${key}: Tìm NCC (${ENGINE[engine]}) bổ sung ${added.filter((a) => !a.error).length} nhà cung cấp; cấu hình: ${configMerge}`);
        return;
      } finally { fs.rmSync(dir, { recursive: true, force: true }); }
    }
    await done({ result: { engine: "", ...(extraOf(req) ? { extra: extraOf(req) } : {}), summary: "Không tìm được nhà cung cấp mới nào phù hợp yêu cầu kỹ thuật và qua được kiểm tra nguồn.", added: [], skipped: [], notes: [], tried } });
    console.log(`${key}: Tìm NCC không tìm được ai`);
  } catch (e) {
    await done({ error: e.message || String(e) }).catch(() => {});
    console.log(`${key}: Tìm NCC lỗi ${e.message}`);
  }
}

const cmd = process.argv[2];
if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT) {
  if (cmd === "save") console.log(await save(arg("dir", "."), arg("url")));
  else if (cmd === "prep") console.log(JSON.stringify(await prep(arg("key"), arg("out"), { bidName: arg("bid-name"), origin: arg("origin") })));
  else if (cmd === "check") {
    // Offline in a folder made by prep (suppliers.json, meta.json); elsewhere the supplier DB is read from the web.
    const dir = arg("dir", "."), local = (f) => (fs.existsSync(path.join(dir, f)) ? JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) : null);
    const { problems, result, hints } = checkDir(dir, local("suppliers.json") || (await api("kind=docs&coll=supplier")).map((d) => d.data), [], local("meta.json")?.origin);
    fs.writeFileSync(path.join(dir, "result.checked.json"), JSON.stringify(result, null, 1));
    console.log(problems.length ? problems.join("\n") : "Không có điểm nào chưa khớp nguồn.");
    // "unclear" checks whose sources have a line about them (config-prompt.md: read each, set met / not_met if it says).
    if (hints.length) console.log(`\nCÓ THỂ TRA ĐƯỢC — ${hints.length} mục chưa rõ mà nguồn có dòng liên quan (đọc dòng đó: nêu đạt / không đạt thì sửa, không nói thì để chưa rõ):\n${hints.join("\n")}`);
  } else if (cmd === "find-check") {
    // Offline in a folder made for Tìm NCC (suppliers.json, meta.json).
    const dir = arg("dir", "."), meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
    const res = await findCheck(dir, JSON.parse(fs.readFileSync(path.join(dir, "suppliers.json"), "utf8")), meta.cap);
    for (const c of res) console.log(`${c.id || "?"}: ${c.errors.length ? `KHÔNG QUA — ${c.errors.join("; ")}` : "qua verify.mjs"}${c.errors.length ? "" : c.fits ? ", phù hợp công suất" : `, CHƯA có dòng sản phẩm phù hợp công suất${meta.cap ? ` ${meta.cap.value} ${meta.cap.unit}` : ""}`}`);
    if (!res.length) console.log("newCatalog.json rỗng.");
  } else if (cmd === "post") {
    const dir = arg("dir", "."), { result } = checkDir(dir, (await api("kind=docs&coll=supplier")).map((d) => d.data));
    console.log(await post([{ coll: "configmatch", id: arg("key"), data: { at: new Date().toISOString(), result } }, { coll: "configreq", id: arg("key"), data: { notifyNo: arg("key"), requestedAt: arg("requested-at"), doneAt: new Date().toISOString(), error: "" } }]));
  } else if (cmd === "merge-find") {
    // The suppliers of the stored findmatch/<key>, read again from the web, merged into configmatch/<key>.
    const key = arg("key"), f = await doc("findmatch", key), ids = new Set((f?.result?.added || []).filter((a) => !a.error).map((a) => a.supplierId));
    const suppliers = (await api("kind=docs&coll=supplier")).map((d) => d.data), records = suppliers.filter((s) => ids.has(s.id));
    const m = await mergeFindIntoConfig(key, records, { cap: f?.result?.cap, origin: (await doc("findreq", key))?.origin, suppliers });
    if (f?.result) await post([{ coll: "findmatch", id: key, data: { ...f, result: { ...f.result, configMerge: mergeText(m) } } }]);
    console.log(`${key}: ${mergeText(m)}${m ? ` ${JSON.stringify(m)}` : ""}`);
  } else if (cmd === "run") {
    const lock = path.join(os.tmpdir(), "genbid-config.lock");
    // A lock left by a run that died (killed, node exit 13) used to hold every request for an hour (2026-11-03): it counts
    // only while the process that wrote it is alive, and for at most 4 hours (the bot stops a run after 3).
    const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
    if (fs.existsSync(lock) && Date.now() - fs.statSync(lock).mtimeMs < 4 * 60 * 60e3 && alive(Number(fs.readFileSync(lock, "utf8")) || -1)) { console.log("SUMMARY: đang có lượt khác chạy"); process.exit(4); }
    fs.writeFileSync(lock, String(process.pid));
    try {
      const [pending, finds, prices] = await Promise.all([api("kind=config"), api("kind=find"), api("kind=bidprice")]);
      // Gợi ý giá đấu first: a few minutes each, no web search (bidprice-bot.mjs).
      // Only requests the web wrote (basis): an older API answers an unknown kind with the file requests.
      // In a child process: bidprice-bot.mjs imports this script, and an import of it from here (the main module, still
      // in its top-level await) never settles, so node quit with code 13 and left the lock behind (2026-11-03).
      if (prices.some((r) => r.basis)) spawnSync(process.execPath, [path.join(ROOT, "bidprice-bot.mjs"), "run"], { stdio: "inherit", windowsHide: true, timeout: 3 * 60 * 60e3 });
      if (pending.length || finds.length) {
        const suppliers = (await api("kind=docs&coll=supplier")).map((d) => d.data);
        for (const req of pending) await answer(req, suppliers);
        for (const req of finds) await find(req, suppliers);
      }
      console.log(`SUMMARY: ${pending.length} yêu cầu gợi ý cấu hình, ${finds.length} yêu cầu Tìm NCC, ${prices.length} yêu cầu gợi ý giá đấu`);
    } finally { fs.rmSync(lock, { force: true }); }
  } else { console.error("usage: config-bot.mjs run | prep --key K --out D | save --dir D --url U | check --dir D | post --dir D --key K --requested-at T"); process.exit(2); }
}
