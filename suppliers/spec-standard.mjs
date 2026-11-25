// Bản chuẩn thông số theo suppliers/spec-fields.json (bước 2 của chuẩn hoá datasheet, Khoa chốt 24/11/2026).
//   node suppliers/spec-standard.mjs --stats             độ phủ theo trường, trường chưa có code đọc
//   node suppliers/spec-standard.mjs --out <thư mục>     ghi từng doc ra JSON để soát
//   node suppliers/spec-standard.mjs --post [--dry]      đăng vào bảng spec_std (chỉ doc đổi nội dung); xem post()
// KHÔNG có bộ đọc bảng mới: mọi giá trị đi từ CAT.build / gensetsOf + SN.normalizeRecord + sourceRatings. Không ngày giờ
// trong nội dung, khoá sắp xếp: cùng đầu vào ra cùng byte. Chưa nơi nào đọc collection này (web, config-bot là bước 5).
// Giá trị một nguồn internet (one-source.json, PR 3 của thiết kế gia-tri-mot-nguon): thêm SAU khi gộp số NCC + tờ hãng, mỗi
// bản ghi một dòng riêng có dấu `origin: "one-source"` (xem oneSourcePick / oneSourceItem). Đọc thẳng JSON; KHÔNG import
// one-source-check.mjs (nó nạp config-bot), luật chung lấy từ one-source-rules.mjs.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sourceRatings, modelFacts } from "./config-bot.mjs";
import { ONE_SOURCE_FILE, readOneSource, oneSourcePick } from "./one-source-rules.mjs";
import { controllerFeatures, ctlFeatureFields } from "./controllers-features.mjs";
import { norm } from "./verify.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
for (const f of ["conversions.js", "catalog.js", "spec-norm.js"]) await import(pathToFileURL(path.join(ROOT, "..", "web", f)).href);
const CAT = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
export const FIELDS = JSON.parse(fs.readFileSync(path.join(ROOT, "spec-fields.json"), "utf8"));
export const COLL = "specstd";
const PARTS = ["genset", "engine", "alternator", "controller"];
const fieldOf = Object.fromEntries(PARTS.map((p) => [p, Object.fromEntries(FIELDS.parts[p].map((f) => [f.id, f]))]));
const byKey = Object.fromEntries(PARTS.map((p) => [p, Object.fromEntries(FIELDS.parts[p].filter((f) => f.key).map((f) => [f.key, f]))]));
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
// JSON with object keys sorted at every level: the byte-stable form of a doc and of a merge key.
export const stable = (v) => JSON.stringify(v, (_, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => cmp(a, b))) : x));
export const hashOf = (doc) => crypto.createHash("sha256").update(stable({ ...doc, hash: undefined })).digest("hex").slice(0, 16);

// ---------- Luật gộp cách viết (sameValue, same của spec-fields.json); mỗi luật có tên để kiểm chéo ----------
const NFKC = (s) => String(s ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();
export function tidyText(s) {
  const rules = [];
  let t = NFKC(s);
  const x = t.replace(/(\d)\s*[×xX*]\s*(?=\d)/g, "$1 × ");
  if (x !== t) { rules.push("dau-nhan"); t = x; }
  return { text: t, rules };
}
// "& = and = + = / = dấu phẩy" when joining words (never between digits: "1500/1800" stays two figures).
export function joinKey(s) {
  return tidyText(s).text.toLowerCase().replace(/(?<=\p{L})\s*(?:&|\+|\/|,|\band\b)\s*(?=\p{L})/gu, " & ").replace(/\s+/g, " ").trim();
}
// Every standard value a spelling stands for (values first, then same); `enumOf` takes the first, the join needs exactly one.
function enumMatches(f, text) {
  const k = joinKey(text), out = [];
  for (const v of f.values || []) if (joinKey(v) === k) out.push({ value: v, rule: NFKC(text) === v ? null : "hoa-thuong" });
  for (const [v, list] of Object.entries(f.same || {})) if (list.some((w) => joinKey(w) === k) && !out.some((o) => o.value === v)) out.push({ value: v, rule: "same" });
  return out;
}
// Luật có tên (spec-standard-check.mjs phải giải thích được từng cái):
//   tien-to-o  ô dính cả dòng bảng "| Insulation class | H [| …]" (chỉ trường insulation): lấy ô cạnh nhãn.
//   chu-class  "H class" / "Class H" (chỉ insulation): chữ cái cấp là giá trị chuẩn.
//   ghep-o     chữ bị cắt ở "and" / "&" / "," / "+" / "/" ghép với ô KẾ TIẾP của cùng dòng nguồn (`next`), chỉ khi ghép ra ĐÚNG MỘT giá trị chuẩn.
// `joined` = ô kế tiếp đã ghép; `raw` vẫn là chữ nguồn của ô đầu.
// "Không chổi than" (Khoa 24/11/2026: tách khỏi hệ kích từ): chữ nguồn ghi brushless / brush less / 无刷. Chỉ nhận chữ ghi thẳng.
const BRUSHLESS = /brush\s*-?\s*less|无刷/i;
export const brushlessOf = (text) => BRUSHLESS.test(NFKC(text));
// The text without the brushless words and the separators they leave: "Brushless, self-excited" → "self-excited"; "Brushless," → "".
export const stripBrushless = (text) => NFKC(text).replace(new RegExp(BRUSHLESS.source, "gi"), " ").replace(/^[\s,;，、/&+]+|[\s,;，、/&+]+$/g, "").replace(/\s+/g, " ").trim();
export function enumOf(f, text, next = null) {
  let t = text, pre = null;
  if (f.id === "excitation" && brushlessOf(text)) {
    t = stripBrushless(text); pre = "tach-khong-choi-than";
    // "Brushless," + next cell of the same line ("self-exciting"): the join rule below.
    if (!t) {
      const nx = NFKC(next);
      const j = nx && /(?:\band\b|&|,|\+|\/)$/i.test(NFKC(text)) ? enumMatches(f, nx) : [];
      return j.length === 1 ? { value: j[0].value, rule: "ghep-o", joined: nx } : null;
    }
  }
  if (f.id === "insulation") {
    const m = /^\|\s*insulation\s+(?:class|system)\s*\|\s*([^|]+?)\s*(?:\||$)/i.exec(NFKC(text));
    if (m) { t = m[1]; pre = "tien-to-o"; }
  }
  const d = enumMatches(f, t)[0];
  if (d) return { value: d.value, rule: pre || d.rule };
  if (f.id === "insulation") {
    const m = /^(?:class\s+([A-Z])|([A-Z])\s+class)$/i.exec(NFKC(t));
    const c = m && enumMatches(f, m[1] || m[2])[0];
    if (c) return { value: c.value, rule: pre || "chu-class" };
  }
  const nx = NFKC(next);
  if (nx && /(?:\band\b|&|,|\+|\/)$/i.test(NFKC(t))) {
    const j = enumMatches(f, `${NFKC(t)} ${nx}`);
    if (j.length === 1) return { value: j[0].value, rule: "ghep-o", joined: nx };
  }
  return null;
}
// The cell that follows `text` on the same source line (`line` = "| a | b | c |"), or null: the next cell only, never another line.
export function nextCellOf(line, text) {
  if (!line) return null;
  const cells = String(line).split("|").map((c) => NFKC(c));
  const i = cells.findIndex((c) => c && c === NFKC(text));
  if (i < 0) return null;
  const nx = cells.slice(i + 1).find((c) => c);
  return nx ?? null;
}
const LAYOUT = { V: "V", L: "inline" };
const plainNum = (s) => (/^\d+(\.\d+)?$/.test(NFKC(s)) ? Number(NFKC(s)) : null);
const COND_SKIP = new Set(["headerUnit", "unitFrom", "layout", "unitCell"]);
const condOf = (n) => { const c = Object.fromEntries(Object.entries(n?.cond || {}).filter(([k, v]) => !COND_SKIP.has(k) && v != null)); return Object.keys(c).length ? c : null; };

// Emission levels as spec-norm reads them ([{ scale, level, text }]): kept as structure, never turned into text (String()
// of an object gave "[object Object]" for every emission value). The scale stays null when the source names none (no
// guess); `text` is the source's spelling, left to `raw`, so "Tier 2" and "T2" of one scale are one value. Sorted, no repeats.
export function levelsOf(e) {
  const list = (Array.isArray(e) ? e : [e]).filter((x) => x && typeof x === "object").map((x) => ({ scale: x.scale ?? null, level: x.level ?? null }));
  const seen = new Map(list.map((x) => [stable(x), x]));
  return [...seen.keys()].sort(cmp).map((k) => seen.get(k));
}
// The standard value of one normalized reading, or { drop } when no figure could be read.
export function valueOf(f, n, sp, next = null) {
  const out = (value, rules = []) => ({ value, unit: n?.unit ?? null, cond: condOf(n), missing: [...(n?.missing || [])], rules });
  if (n) {
    if (!SN.hasValue(n)) return { drop: (n.missing || []).join("+") || "no-value" };
    if (n.count != null) { const o = out(n.count, /v/i.test(n.raw.value) ? ["xi-lanh-v"] : []); o.missing = o.missing.filter((m) => m !== "layout"); o.layout = n.cond?.layout || null; return o; }
    if (n.bore) { const { bore, stroke } = n.bore; return out(stroke != null ? `${bore} × ${stroke}` : `${bore}`, ["dau-nhan"]); }
    if (n.dims) { const d = n.dims.asWritten || Object.values(n.dims); return out(d.join(" × "), ["dau-nhan"]); }
    if (n.enum) return out(levelsOf(n.enum));
    // Engine power written in HP / PS: spec-norm turns it into kW; the standard keeps the source's figure (field power_hp).
    if (f.id === "power_kwm" && n.conv?.from) return { ...out(n.conv.from.num, ["hp-giu-nguyen"]), unit: n.conv.from.unit };
    if (n.num != null) return out(n.num, Number(n.raw.value) === n.num && String(n.num) === NFKC(n.raw.value) ? [] : ["so"]);
    if (n.range) return out(`${n.range[0]}-${n.range[1]}`);
    if (n.options) return out(n.options);
    return { drop: "exempt" };
  }
  const raw = sp.value;
  if (f.type === "enum") {
    const e = enumOf(f, raw, next);
    if (e) return { value: e.value, unit: null, cond: null, missing: [], rules: e.rule ? [e.rule] : [], ...(e.joined ? { joined: e.joined } : {}) };
    // The cell says only "brushless": no excitation system is written, so no value (the brushless field takes it).
    if (f.id === "excitation" && brushlessOf(raw) && !stripBrushless(raw)) return { drop: "chi-khong-choi-than" };
    return { value: tidyText(raw).text, unit: null, cond: null, missing: ["enum"], rules: [] };
  }
  if (f.type === "number") {
    const v = plainNum(raw);
    if (v != null) return { value: v, unit: null, cond: null, missing: f.unit ? ["unit"] : [], rules: [] };
    return { value: tidyText(raw).text, unit: null, cond: null, missing: ["number-text"], rules: tidyText(raw).rules };
  }
  const t = tidyText(raw);
  return { value: t.text, unit: null, cond: null, missing: [], rules: t.rules };
}
// Which field a normalized fuel reading belongs to: by the load the source states; no load stays at the 100 % field
// with `missing: load` (Khoa 14/11: tiêu hao không ghi tải là số 100%, vẫn ghi chú thiếu).
function fieldFor(part, sp, n) {
  let f = byKey[part][sp.key];
  if (!f) return null;
  if (sp.key === "fuel" && n?.cond?.load != null && n.cond.load !== 100) {
    f = n.cond.load === 75 ? fieldOf.genset.fuel_75 : n.cond.load === 50 ? fieldOf.genset.fuel_50 : null;
  }
  return f;
}

// ---------- Gộp ----------
class Bag {
  constructor() { this.m = new Map(); }
  add(fid, r, src) {
    const key = stable([fid, typeof r.value === "string" ? joinKey(r.value) : r.value, r.unit, r.cond, [...r.missing].sort()]);
    let e = this.m.get(key);
    if (!e) this.m.set(key, (e = { fid, value: r.value, unit: r.unit, cond: r.cond, missing: [...r.missing].sort(), first: null, suppliers: new Set() }));
    const pos = src ? stable([src.supplierId, src.n, src.table, src.row]) : "";
    if (src && (!e.first || pos < e.first.pos)) e.first = { pos, raw: r.raw ?? null, src, rawJoined: !!r.rawJoined };
    if (!src && !e.first) e.first = { pos: "", raw: r.raw ?? null, src: null };
    if (src?.supplierId) e.suppliers.add(src.supplierId);
  }
  fields() {
    const out = {};
    for (const e of this.m.values()) (out[e.fid] ||= []).push(e);
    const res = {};
    for (const fid of Object.keys(out).sort()) {
      res[fid] = out[fid].map((e) => {
        const o = { value: e.value };
        if (e.unit) o.unit = e.unit;
        if (e.cond) o.cond = e.cond;
        if (e.missing.length) o.missing = e.missing;
        if (e.first?.raw != null) o.raw = e.first.raw;
        if (e.first?.rawJoined) o.rawJoined = true;
        if (e.first?.src) o.src = e.first.src;
        o.suppliers = e.suppliers.size;
        return o;
      }).sort((a, b) => b.suppliers - a.suppliers || cmp(stable(a.value), stable(b.value)) || cmp(stable(a.cond), stable(b.cond)) || cmp(stable(a.missing), stable(b.missing)));
    }
    return res;
  }
}
const srcOf = (u) => ({ supplierId: u.supplierId, n: u.n ?? null, table: u.table ?? null, row: u.row ?? null });
// The source cell holding a figure ("1,000" for 1000), so `raw` is text of the row and never a re-typed number.
function cellWith(line, num) {
  if (!line || num == null) return null;
  const want = String(num);
  for (const c of String(line).split("|").map((x) => x.trim())) if (c.replace(/,/g, "") === want || c === want) return c;
  return String(line).includes(want) ? want : null;
}

export const flatText = (s) => String(s).normalize("NFKC").replace(/[\s|]+/g, "");
// One use of a model: its normalized specs into the bag of `part`.
function addSpecs(bag, part, u, rows, audit, ctx) {
  const norm = SN.normalizeRecord(u, rows);
  const nOf = new Map();
  for (const n of norm) { const k = `${n.key} ${n.raw.label} ${n.raw.value}`; if (!nOf.has(k)) nOf.set(k, n); }
  for (const sp of u.specs || []) {
    const n = nOf.get(`${sp.key} ${sp.label ?? ""} ${sp.value ?? ""}`) || null;
    const f = fieldFor(part, sp, n);
    if (!f) { if (byKey[part][sp.key]) audit?.({ part, ...ctx, u, sp, n, drop: "load-khac" }); continue; }
    // The catalog key aircool holds charge-air AND piston cooling; the field charge_cooling is the charge air only. "Piston Cooling |
    // Oil cooled" (aosif n1086; L1-B4, 24/11/2026) is the pistons', not a value of this field.
    if (f.id === "charge_cooling" && /piston|活塞/i.test(String(sp.label ?? ""))) { audit?.({ part, ...ctx, u, sp, n, fid: f.id, drop: "piston" }); continue; }
    const r = valueOf(f, n, sp, f.type === "enum" && !n ? nextCellOf(u.line, sp.value) : null);
    // A cell of the excitation system that also says brushless: a second value, in its own field; raw is the source text of both.
    if (part === "alternator" && f.id === "excitation" && !n && brushlessOf(sp.value)) {
      const raw = sp.fixed?.from ?? sp.value;
      const rawJoined = !u.line && !sp.fixed && !flatText([...(u.lines?.rows || []), ...(u.lines?.header || []), ...(rows || [])].join("\n")).includes(flatText(raw));
      bag.add("brushless", { value: true, unit: null, cond: null, missing: [], raw, rawJoined }, srcOf(u));
      audit?.({ part, ...ctx, u, sp, n, fid: "brushless", value: true, rules: ["co-chu-khong-choi-than"] });
    }
    if (r.drop) { audit?.({ part, ...ctx, u, sp, n, fid: f.id, drop: r.drop }); continue; }
    // A value corrected by a listed exception (fixspec): raw is the text of the source, not the corrected figure.
    r.raw = sp.fixed?.from ?? sp.value;
    if (sp.fixed) r.rules = [...r.rules, "fixspec"];
    // A vertical sheet: the catalog joins cells into one value ("lt | 3,3" → "3,3 L", "105" + "127" → "105 × 127"), so the
    // text is not verbatim. Marked, and the check requires each of its figures in the table.
    if (!u.line && !sp.fixed) r.rawJoined = !flatText([...(u.lines?.rows || []), ...(u.lines?.header || []), ...(rows || [])].join("\n")).includes(flatText(r.raw));
    if (r.joined) r.rawJoined = true;
    if (f.cond?.includes("rating") && !n?.cond?.rating && !n?.cond?.ratings && !r.missing.includes("rating")) r.missing.push("rating");
    if (!n) for (const c of f.cond || []) if (!r.missing.includes(c)) r.missing.push(c);
    bag.add(f.id, r, srcOf(u));
    audit?.({ part, ...ctx, u, sp, n, fid: f.id, value: r.value, rules: r.rules, joined: r.joined });
    if (part === "engine" && f.id === "cylinders" && r.layout) bag.add("cyl_layout", { value: LAYOUT[r.layout] || r.layout, unit: null, cond: null, missing: [], raw: sp.value }, srcOf(u));
  }
}
// Engine power is a table: kWm by rating and speed, HP / PS in its own field; never turned into kVA or kW electric.
// A figure the source gives no unit for (unit null, missing "unit": ettes-power "kW/Hp" cells marked by unitspec, cells
// whose label names no unit) is neither kWm nor HP: it stays in power_kwm under the column `figure`, with missing "unit",
// so it is shown with its note and never read as kW. spec-fields.json is unchanged (`figure` is a cell, not a field).
export function moveEnginePower(fields) {
  const items = fields.power_kwm;
  if (!items) return;
  const kw = [], hp = [];
  for (const it of items) {
    const unit = String(it.unit || "");
    const isHp = /^(hp|bhp|ps)$/i.test(unit) || (!unit && /\b(hp|bhp|ps)\b/i.test(String(it.raw || "")));
    const col = isHp ? "hp" : unit ? "kwm" : "figure";
    const row = { rating: it.cond?.rating ?? null, rpm: it.cond?.speed ?? it.cond?.rpm ?? null, [col]: it.value };
    if (col === "figure" && !(it.missing || []).includes("unit")) it.missing = [...(it.missing || []), "unit"].sort();
    (isHp ? hp : kw).push({ ...it, value: row });
  }
  if (kw.length) fields.power_kwm = kw; else delete fields.power_kwm;
  if (hp.length) fields.power_hp = hp;
}

const groupsOf = (c) => {
  if (!c) return [];
  const g = Object.entries(CAT.COUNTRY_GROUP).filter(([, list]) => list.includes(c)).map(([k]) => k);
  if (c === "CN") g.push("cn");
  return g.sort();
};
function brandFields(bag, e) {
  const make = e.make || null;
  if (make) bag.add("brand", { value: make, unit: null, cond: null, missing: [], raw: make }, null);
  if (e.model) bag.add("model", { value: e.model, unit: null, cond: null, missing: [], raw: e.model }, null);
  // Engines only (ENGINE_COUNTRY, CN_MODEL through originOf). Alternator / controller: the maker's profile, step 4.
  // A make in NO_GROUP (Deutz) keeps its country and belongs to no group.
  const country = e.kind !== "engine" ? null : (make && CAT.ENGINE_COUNTRY[make]) || (CAT.originOf(e) === "cn" ? "CN" : null);
  if (country) bag.add("brand_country", { value: { country, groups: CAT.NO_GROUP.has(make) ? [] : groupsOf(country) }, unit: null, cond: null, missing: [], raw: make }, null);
  for (const at of CAT.madeOf(e).filter(Boolean).sort()) bag.add("made_in", { value: at, unit: null, cond: null, missing: [], raw: null }, null);
}
function addRatings(bag, list, attrs) {
  for (const x of list || []) {
    const raw = (x.lines || []).find((l) => String(l).includes(String(x.kVA))) || null;
    const value = { voltage: x.volt ?? null, connection: x.conn ?? null, phases: x.phase ?? null, hz: x.hz ?? null, duty: x.duty == null ? null : /standb/i.test(x.duty) ? "standby" : "continuous", // tờ không ghi chế độ (Linz cấp H / F, Firstall): để trống
      insulation_rise: x.rise ?? null, kva: x.kVA ?? null, kw: x.kW ?? null, efficiency_pct: x.eff ?? null };
    bag.add("ratings", { value, unit: null, cond: null, missing: [], raw }, { supplierId: x.supplierId, n: x.n, table: null, row: null });
  }
  for (const a of attrs || []) if (a.key === "insulation" && typeof a.value === "string") {
    bag.add("insulation", { value: a.value, unit: null, cond: null, missing: [], raw: (a.lines || [])[0] ?? null }, { supplierId: a.supplierId, n: a.n, table: null, row: null });
  }
}
const size = (d) => Buffer.byteLength(stable(d));

// ---------- Giá trị một nguồn internet ----------
// ONE_SOURCE_FILE, readOneSource, oneSourcePick: in one-source-rules.mjs since one-source-4 (config-bot uses the same pick).
export { ONE_SOURCE_FILE, readOneSource, oneSourcePick };
// One bản ghi as a value of the standard: its own line (never joined with a supplier's value, even the same figure), with the
// mark `origin: "one-source"`, `src` = the bản ghi id + url + level, `raw` = its first quote, `suppliers: 0` (no supplier wrote
// it, so it sorts after every supplier's value). `missing` as for a supplier value read without the normalizer: the unit the
// field has and the conditions it asks for, when the bản ghi does not give them.
export function oneSourceItem(rec, f) {
  const missing = [];
  if (f.unit && !rec.unit) missing.push("unit");
  for (const c of f.cond || []) if (rec.cond?.[c] == null) missing.push(c);
  const o = { value: rec.value };
  if (rec.unit) o.unit = rec.unit;
  if (rec.cond && Object.keys(rec.cond).length) o.cond = rec.cond;
  if (missing.length) o.missing = missing.sort();
  o.raw = (rec.quote || [])[0] ?? null;
  o.src = { oneSource: rec.id, url: rec.url, level: rec.level };
  o.origin = "one-source";
  o.suppliers = 0;
  return o;
}
// Kiểm chéo giá trị một nguồn của bản chuẩn (spec-standard-check.mjs, test): chúng không đi qua `audit` (không phải dòng
// catalog), nên kiểm riêng: bản ghi `src.oneSource` có trong one-source.json, cùng part / key / field / value / unit / cond /
// url / level, `raw` = câu trích đầu và nằm NGUYÊN VĂN (norm của verify.mjs) trong tệp nguồn của bản ghi; doc không có hai
// giá trị cùng một bản ghi. readSource(file) → chữ | null, file tính từ suppliers/. Trả về { checked, bad: [{ id, why }] }.
export function checkOneSourceValues(docs, records, readSource) {
  const byId = new Map((records || []).map((r) => [r.id, r]));
  const out = { checked: 0, bad: [] }, seen = new Set();
  const flat = norm;
  for (const d of docs) {
    if (d.part === "genset") { for (const m of Object.values(d.models)) for (const items of Object.values(m.fields)) if (items.some((x) => x.origin === "one-source")) out.bad.push({ id: d.id, why: "giá trị một nguồn ở doc tổ máy" }); continue; }
    for (const [fid, items] of Object.entries(d.fields)) for (const it of items) {
      if (it.origin !== "one-source" && it.src?.oneSource == null) continue;
      out.checked++;
      const bad = (why) => out.bad.push({ id: `${d.id} ${fid} ${it.src?.oneSource ?? "?"}`, why });
      const rec = byId.get(it.src?.oneSource);
      if (it.origin !== "one-source" || !rec) { bad(rec ? "thiếu origin one-source" : "không có bản ghi này trong one-source.json"); continue; }
      if (seen.has(rec.id)) bad("bản ghi hiện hai lần");
      seen.add(rec.id);
      if (rec.part !== d.part || rec.key !== d.key || rec.field !== fid) bad(`bản ghi là ${rec.part}:${rec.key} ${rec.field}`);
      if (stable(it.value) !== stable(rec.value) || (it.unit ?? null) !== (rec.unit ?? null) || stable(it.cond ?? null) !== stable(rec.cond && Object.keys(rec.cond).length ? rec.cond : null)) bad("value / unit / cond khác bản ghi");
      if (it.src.url !== rec.url || it.src.level !== rec.level) bad("url / level khác bản ghi");
      if (it.suppliers !== 0) bad(`suppliers ${it.suppliers}, phải là 0`);
      if (it.raw !== (rec.quote || [])[0]) bad("raw khác câu trích đầu của bản ghi");
      const text = readSource(rec.file);
      if (text == null) bad(`thiếu tệp nguồn ${rec.file}`);
      else if (!it.raw || !flat(text).includes(flat(it.raw))) bad(`raw không nằm nguyên văn trong ${rec.file}`);
    }
  }
  return out;
}
function addOneSource(fields, picked) {
  const items = picked.map((x) => ({ fid: x.f.id, it: oneSourceItem(x.rec, x.f) }))
    .sort((a, b) => cmp(a.fid, b.fid) || cmp(stable(a.it.value), stable(b.it.value)) || cmp(stable(a.it.cond), stable(b.it.cond)) || cmp(a.it.src.oneSource, b.it.src.oneSource));
  for (const { fid, it } of items) (fields[fid] ||= []).push(it);
  // Keys stay sorted, as Bag.fields() gives them.
  const out = {};
  for (const k of Object.keys(fields).sort()) out[k] = fields[k];
  return out;
}

// standardOf(suppliers): every doc, sorted by id. engine / alternator / controller: one doc per model. genset: one doc per
// supplier (its models inside), so a supplier's change never rewrites another supplier's genset rows.
// opts.oneSource: the bản ghi of one-source.json (default: read the file); opts.oneSourceReport: an object filled with
// { records, used, skipped } (see oneSourcePick); opts.facts: modelFacts for the maker-sheet rule (default: computed).
export function standardOf(suppliers, opts = {}) {
  const list = (suppliers || []).filter((s) => s && s.status !== "incomplete").slice().sort((a, b) => cmp(a.id, b.id));
  const byId = new Map(list.map((s) => [s.id, s]));
  const built = opts.built || CAT.build(list);
  const rt = sourceRatings(list, opts.sourcesDir || path.join(ROOT, "sources"));
  const rowsOf = (u) => byId.get(u.supplierId)?.specTables?.[u.table]?.rows;
  const audit = opts.audit;
  const docs = [];
  const oneRecords = opts.oneSource ?? readOneSource();
  const partList = { engine: built.engines, alternator: built.alternators, controller: built.controllers };
  const keysOf = Object.fromEntries(Object.entries(partList).map(([p, l]) => [p, new Set(l.map((e) => e.key))]));
  const one = oneSourcePick(oneRecords, {
    has: (part, key) => !!keysOf[part]?.has(key),
    makerCtx: () => ({ facts: opts.facts || modelFacts(built, list), altRatings: rt.alt, altAttrs: rt.attr, engRatings: rt.eng, suppliers: new Map((suppliers || []).filter(Boolean).map((s) => [s.id, { role: s.role }])) }),
  });
  const oneByDoc = new Map();
  for (const x of one.keep) { const id = `${x.rec.part}:${x.rec.key}`; oneByDoc.set(id, [...(oneByDoc.get(id) || []), x]); }
  if (opts.oneSourceReport) Object.assign(opts.oneSourceReport, { records: Array.isArray(oneRecords) ? oneRecords.length : 0, used: one.keep.length, docs: oneByDoc.size, skipped: one.skipped });
  // Chức năng bộ điều khiển từ datasheet hãng của chính model (controllers-features.mjs, PR G): chỉ vào trường chưa có giá trị.
  const ctl = opts.ctlFeatures ?? controllerFeatures(list);
  for (const [part, entries] of [["engine", built.engines], ["alternator", built.alternators], ["controller", built.controllers]]) {
    for (const e of entries) {
      const bag = new Bag();
      brandFields(bag, e);
      for (const u of e.uses) if (u.specs?.length) addSpecs(bag, part, u, rowsOf(u), audit, { key: e.key });
      if (part === "alternator") addRatings(bag, rt.alt.get(e.key), rt.attr.get(e.key));
      let fields = bag.fields();
      if (part === "engine") moveEnginePower(fields);
      if (part === "controller" && ctl.byModel.has(e.key)) fields = ctlFeatureFields(fields, ctl.byModel.get(e.key));
      if (oneByDoc.has(`${part}:${e.key}`)) fields = addOneSource(fields, oneByDoc.get(`${part}:${e.key}`));
      const doc = { id: `${part}:${e.key}`, part, key: e.key, model: e.model, make: e.make || null, suppliers: [...e.suppliers].sort(), fields };
      doc.hash = hashOf(doc);
      docs.push(doc);
    }
  }
  // Genset rows: the rows naming a set (engine / alternator records of the same row count once) + gensetsOf.
  const sets = new Map();
  const seen = new Set();
  const addSet = (u) => {
    const name = u.kind === "genset" ? u.model : u.genset;
    if (!name) return;
    const id = stable([u.supplierId, u.n, u.table, u.row, name]);
    if (seen.has(id)) return;
    seen.add(id);
    const k = `${u.supplierId}|${CAT.keyOf(name)}`;
    if (!sets.has(k)) sets.set(k, { supplierId: u.supplierId, key: CAT.keyOf(name), model: name, bag: new Bag() });
    const { bag } = sets.get(k);
    addSpecs(bag, "genset", u, rowsOf(u), audit, { key: k });
    for (const [rating, p] of Object.entries(u.power || {})) {
      const raw = cellWith(u.line, p.kVA) ?? cellWith(u.line, p.kW);
      bag.add("power", { value: { rating, kva: p.kVA ?? null, kw: p.kW ?? null, hz: u.freq ?? null }, unit: null, cond: null, missing: u.freq == null ? ["hz"] : [], raw }, srcOf(u));
    }
    if (u.freq != null) bag.add("frequency", { value: u.freq, unit: "Hz", cond: null, missing: [], raw: null }, srcOf(u));
    if (u.fuel) bag.add("fuel", { value: u.fuel, unit: null, cond: null, missing: [], raw: null }, srcOf(u));
    bag.add("model", { value: name, unit: null, cond: null, missing: [], raw: name }, srcOf(u));
    bag.add("supplier", { value: u.supplierId, unit: null, cond: null, missing: [], raw: null }, null);
    const home = byId.get(u.supplierId)?.country;
    if (home) bag.add("brand_country", { value: { country: home, groups: groupsOf(home) }, unit: null, cond: null, missing: [], raw: null }, null);
    if (u.kind !== "genset" && u.model) bag.add(u.kind === "engine" ? "engine_model" : "alternator_model", { value: u.model, unit: null, cond: null, missing: [], raw: u.model }, srcOf(u));
  };
  for (const e of built.engines) e.uses.forEach(addSet);
  for (const e of built.alternators) e.uses.forEach(addSet);
  for (const e of built.gensets) e.uses.forEach(addSet);
  const perSupplier = new Map();
  for (const x of [...sets.values()].sort((a, b) => cmp(a.key, b.key))) {
    if (!perSupplier.has(x.supplierId)) perSupplier.set(x.supplierId, {});
    perSupplier.get(x.supplierId)[x.key] = { model: x.model, fields: x.bag.fields() };
  }
  for (const [sid, models] of perSupplier) {
    const doc = { id: `genset:${sid}`, part: "genset", key: sid, supplierId: sid, models };
    doc.hash = hashOf(doc);
    docs.push(doc);
  }
  return docs.sort((a, b) => cmp(a.id, b.id));
}

// ---------- Độ phủ ----------
export function statsOf(docs) {
  const out = {};
  // oneSource: values marked origin "one-source" (counted inside `values` too); oneSourceOnly: models whose ONLY values of the
  // field are one-source ones (counted inside `models`), so the coverage of supplier + maker sheets alone is models − oneSourceOnly.
  for (const p of PARTS) out[p] = Object.fromEntries(FIELDS.parts[p].map((f) => [f.id, { models: 0, values: 0, missing: 0, oneSource: 0, oneSourceOnly: 0 }]));
  let oneSource = 0;
  const count = (part, fields) => {
    for (const [id, items] of Object.entries(fields)) {
      const c = out[part][id];
      if (!c) throw new Error(`trường lạ ${part}.${id}`);
      const k = items.filter((x) => x.origin === "one-source").length;
      c.models++; c.values += items.length; c.missing += items.filter((x) => x.missing?.length).length;
      c.oneSource += k; oneSource += k;
      if (k && k === items.length) c.oneSourceOnly++;
    }
  };
  const n = { genset: 0, engine: 0, alternator: 0, controller: 0 };
  for (const d of docs) {
    if (d.part === "genset") for (const m of Object.values(d.models)) { n.genset++; count("genset", m.fields); }
    else { n[d.part]++; count(d.part, d.fields); }
  }
  return { models: n, fields: out, oneSource };
}

// ---------- Đăng ----------
// Ghi thẳng bảng RIÊNG spec_std (web/supabase/schema.sql; Khoa 24/11/2026, phương án A: không realtime, không activity_log,
// không ghi vào docs) bằng service key, mỗi lô ≤ 200 dòng / 2 MB, đổi updated_at, CHỈ doc khác hash trên web. Đọc `id + hash`
// (không đọc data) để so, nên so sánh gần như không tốn egress. Doc không còn sinh ra được ghi { gone: true } thay vì xoá.
// Chỉ ghi thật khi SPEC_STD_PUBLISH=1 (và bảng đã được tạo tay trên Supabase).
export const TABLE = "spec_std";
export const rowOf = (d) => ({ id: d.id, part: d.part, hash: d.hash, data: d });
export function batchesOf(rows) {
  const out = [];
  for (const row of rows) {
    const last = out[out.length - 1], bytes = Buffer.byteLength(JSON.stringify(row));
    if (!last || last.rows.length >= 200 || last.bytes + bytes > 2e6) out.push({ rows: [row], bytes });
    else { last.rows.push(row); last.bytes += bytes; }
  }
  return out;
}
export function planOf(docs, remote) {
  const ids = new Set(docs.map((d) => d.id));
  const write = docs.filter((d) => remote.get(d.id) !== d.hash);
  const gone = [...remote.entries()].filter(([id, h]) => !ids.has(id) && h !== "gone").map(([id]) => ({ id, part: id.split(":")[0], gone: true, hash: "gone" })).sort((a, b) => cmp(a.id, b.id));
  return { write, gone, same: docs.length - write.length };
}
async function remoteHashes(SB, H) {
  const m = new Map();
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${SB}/rest/v1/${TABLE}?select=id,hash&order=id&offset=${from}&limit=1000`, { headers: H });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const rows = await r.json();
    for (const x of rows) m.set(x.id, x.hash);
    if (rows.length < 1000) return m;
  }
}
export async function post(docs, { dry }) {
  const SB = process.env.SUPABASE_URL, SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const H = SB && SERVICE ? { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } : null;
  const remote = H ? await remoteHashes(SB, H) : new Map();
  const { write, gone, same } = planOf(docs, remote);
  const rows = [...write, ...gone].map(rowOf);
  const batches = batchesOf(rows), bytes = batches.reduce((a, b) => a + b.bytes, 0);
  console.log(`${TABLE}: ${docs.length} doc, ${write.length} sẽ ghi, ${gone.length} đánh dấu gone, ${same} giữ nguyên; ${batches.length} lô, ${(bytes / 1e6).toFixed(2)} MB${H ? "" : " (không có Supabase: tính như web chưa có doc nào)"}.`);
  if (dry || !rows.length) return { rows: rows.length, bytes };
  if (!H) throw new Error("thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  if (process.env.SPEC_STD_PUBLISH !== "1") { console.log("SPEC_STD_PUBLISH chưa bật: không ghi."); return { rows: 0, bytes: 0 }; }
  for (const b of batches) {
    const now = new Date().toISOString();
    const r = await fetch(`${SB}/rest/v1/${TABLE}?on_conflict=id`, { method: "POST", headers: { ...H, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(b.rows.map((x) => ({ ...x, updated_at: now }))) });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
  }
  return { rows: rows.length, bytes };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2), opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
  const dir = path.join(ROOT, "cn");
  const all = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const report = {};
  const docs = standardOf(all, { oneSourceReport: report });
  const total = docs.reduce((a, d) => a + size(d), 0);
  console.log(`${docs.length} doc, ${(total / 1e6).toFixed(2)} MB, doc lớn nhất ${(Math.max(...docs.map(size)) / 1e3).toFixed(0)} KB`);
  const skippedText = Object.entries(report.skipped || {}).map(([k, ids]) => `${k} ${ids.length}`).join(", ");
  console.log(`one-source.json: ${report.records} bản ghi, ${report.used} giá trị vào ${report.docs} doc${skippedText ? `; không vào: ${skippedText}` : ""}`);
  if (opt("--out")) {
    fs.mkdirSync(opt("--out"), { recursive: true });
    // Model keys hold characters Windows refuses ("*") and differ only by case: the name carries a hash of the id.
    for (const d of docs) fs.writeFileSync(path.join(opt("--out"), `${d.part}-${d.key.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 60)}-${crypto.createHash("sha256").update(d.id).digest("hex").slice(0, 8)}.json`), `${stable(d)}\n`);
  }
  if (argv.includes("--stats")) {
    const s = statsOf(docs);
    console.log("model theo vai", JSON.stringify(s.models));
    console.log(`giá trị một nguồn internet (origin one-source): ${s.oneSource}`);
    for (const p of PARTS) {
      console.log(`\n[${p}] trường | model có giá trị | số giá trị | giá trị có missing | giá trị một nguồn | model chỉ có giá trị một nguồn`);
      for (const [id, c] of Object.entries(s.fields[p])) if (c.models) console.log(`${id} | ${c.models} | ${c.values} | ${c.missing} | ${c.oneSource} | ${c.oneSourceOnly}`);
      console.log(`chưa sinh: ${Object.entries(s.fields[p]).filter(([, c]) => !c.models).map(([id]) => id).join(", ") || "(không)"}`);
    }
  }
  if (argv.includes("--post")) await post(docs, { dry: argv.includes("--dry") });
}
