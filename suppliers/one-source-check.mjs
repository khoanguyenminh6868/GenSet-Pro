// Giá trị một nguồn internet (Khoa 24/11/2026; thiết kế nghiem-thu/gia-tri-mot-nguon-thiet-ke.md ở nhánh dieu-phoi, PR 1):
// thông số động cơ / đầu phát / bộ điều khiển mà tài liệu hãng KHÔNG ghi, lấy từ MỘT trang internet, lưu riêng ở
// suppliers/one-source.json (nguồn ở sources/one-source/<n>.md), đánh dấu riêng, không bao giờ là "đạt".
// Bộ kiểm của tệp đó. `checkOneSource(records, ctx)` là hàm thuần: mọi thứ nó cần (tệp nguồn, danh mục, fact tờ hãng,
// định mức đầu phát, hồ sơ) đi vào qua `ctx`; `contextOf` dựng ctx thật từ repo.
//   node suppliers/one-source-check.mjs [tệp]   (mặc định suppliers/one-source.json; verify.mjs gọi `runOneSource` cuối lượt)
// Bẫy vòng import: config-bot.mjs import verify.mjs, nên tệp này chỉ import config-bot ĐỘNG trong `contextOf`, và verify.mjs
// gọi tệp này bằng import động + .then (không top-level await: verify thành module async đang chạy dở, config-bot chờ nó,
// nó chờ config-bot → node thoát 13). Code khác (spec-standard, config-bot) đọc thẳng one-source.json, KHÔNG import tệp này.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { norm, numbersIn, loadAll } from "./verify.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const FILE = path.join(ROOT, "one-source.json");
export const PARTS = new Set(["engine", "alternator", "controller"]);
export const KEYS = new Set(["id", "part", "make", "model", "key", "field", "value", "unit", "cond", "level", "url", "file", "accessedAt", "quote", "condQuote", "makerChecked", "addedBy", "note"]);
const REQUIRED = ["id", "part", "make", "model", "key", "field", "value", "level", "url", "file", "accessedAt", "quote", "makerChecked"];
// Tên, model, nước thương hiệu là danh tính của model (từ danh mục), không phải thông số lấy từ một trang.
export const NOT_FIELDS = new Set(["brand", "model", "brand_country"]);
// Ô của trường bảng là điều kiện (điện áp, tần số, mức, cấp, tốc độ…), không phải giá trị.
export const COND_COLS = new Set(["voltage", "connection", "phases", "hz", "duty", "ambient_c", "insulation_rise", "rating", "rpm", "kind"]);
const MC_KEYS = new Set(["supplierId", "n", "note"]);
const RATED = { prime: "engPrime", standby: "engStandby" };
// Thuộc tính tờ đầu phát (ratings.mjs altSheetAttrs / lsSheetAttrs) → trường chuẩn.
const ATTR_FIELD = { insulation: "insulation", poles: "poles", overspeed: "overspeed", thd: "thd_linear_load" };

export const stable = (v) => JSON.stringify(v, (_, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : x));
const isObj = (v) => v != null && typeof v === "object" && !Array.isArray(v);
const list = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
const canon = (s) => norm(s).replace(/[^\p{L}\p{N}]/gu, "");
const short = (s, n = 80) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const dutyOf = (s) => (s == null ? null : /stand/i.test(String(s)) ? "standby" : "continuous");
const riseOf = (s) => (s == null ? null : numbersIn(s).find((x) => x >= 60 && x <= 200) ?? null);
const same = (a, b) => a == null || b == null || a === b;

// Chữ điều kiện (ô điều kiện, cond): số có trong câu trích; chữ không số thì có nguyên văn (mức: "Cont." / "Stand-by" cũng được).
function condCovered(x, text) {
  if (typeof x === "number") return numbersIn(text).includes(x);
  const s = String(x), t = norm(text);
  if (/\d/.test(s)) { const have = numbersIn(text); return numbersIn(s).every((n) => have.includes(n)); }
  if (t.includes(norm(s))) return true;
  if (/^continuous$/i.test(s)) return /\bcont/.test(t);
  if (/^standby$/i.test(s)) return /stand\s*-?\s*by/.test(t);
  return false;
}
// Giá trị: số có trong câu trích (numbersIn của verify.mjs), chữ có nguyên văn. Không quy đổi.
const valueCovered = (x, text) => (typeof x === "number" ? numbersIn(text).includes(x) : norm(text).includes(norm(x)));

function typeError(f, v) {
  if (f.type === "number") return typeof v === "number" && Number.isFinite(v) ? null : "phải là số";
  if (f.type === "text") return typeof v === "string" && v.trim() ? null : "phải là chữ";
  if (f.type === "enum") return (f.values || []).includes(v) ? null : `phải là một trong ${(f.values || []).join(", ")}`;
  if (f.type === "bool") return typeof v === "boolean" ? null : "phải là true / false";
  if (f.type === "country") return typeof v === "string" && /^[A-Z]{2}$/.test(v) ? null : "phải là mã nước 2 chữ";
  if (f.type === "table") {
    if (!isObj(v)) return `phải là một dòng (object, cột ${(f.cols || []).join(", ")})`;
    const odd = Object.keys(v).filter((k) => !(f.cols || []).includes(k));
    if (odd.length) return `cột lạ ${odd.join(", ")} (cột ${(f.cols || []).join(", ")})`;
    if (!Object.entries(v).some(([k, x]) => !COND_COLS.has(k) && x != null)) return "dòng không có giá trị nào ngoài điều kiện";
    return null;
  }
  return `kiểu ${f.type} chưa hỗ trợ`;
}

// Điều kiện và giá trị của một bản ghi, để so trùng / mâu thuẫn.
export function sigOf(rec, f) {
  const pick = (want) => Object.fromEntries(Object.entries(rec.value || {}).filter(([k]) => COND_COLS.has(k) === want));
  const table = f?.type === "table" && isObj(rec.value);
  return { cond: stable({ cond: rec.cond ?? null, cells: table ? pick(true) : null }), value: stable({ value: table ? pick(false) : rec.value, unit: rec.unit ?? null }) };
}

// Tài liệu hãng trong repo đã ghi trường này cho model này chưa (lỗi 6). `auto`: false = không kiểm tự động được (trường chưa
// có code đọc, bộ điều khiển): bộ kiểm ghi lưu ý và đòi makerChecked không rỗng. `hits`: dòng tờ hãng ghi trường đó.
export function makerHits(rec, f, ctx) {
  const role = (id) => ctx.suppliers?.get(id)?.role;
  const hit = (x) => `${x.supplierId} nguồn ${x.n}: "${short(x.line ?? (x.lines || [])[0])}"`;
  const hits = [];
  if (rec.part === "controller") {
    const n = (ctx.facts?.get(`controller:${rec.key}`) || []).length;
    return { auto: false, hits, why: n ? `bộ điều khiển: ${n} dòng tờ hãng trong repo cho model này, chưa có code nối dòng với trường` : "bộ điều khiển: chưa có code nối dòng tờ hãng với trường" };
  }
  const facts = ctx.facts?.get(`${rec.part}:${rec.key}`) || [];
  if (rec.part === "engine" && f.id === "power_kwm") {
    const v = isObj(rec.value) ? rec.value : {}, keys = v.rating ? [RATED[v.rating]].filter(Boolean) : ["engPrime", "engStandby"];
    for (const x of facts) if ((keys.includes(x.key) && x.maker) || (x.key === "engPower" && x.sheet)) if (same(v.rpm ?? null, x.rpm ?? null)) hits.push(hit(x));
    for (const x of ctx.engRatings?.get(rec.key) || []) if (x.maker && keys.includes(x.key) && same(v.rpm ?? null, x.rpm ?? null)) hits.push(hit(x));
  } else if (f.key) for (const x of facts) if (x.sheet && x.key === f.key) hits.push(hit(x));
  if (rec.part === "alternator") {
    if (f.id === "ratings" && isObj(rec.value)) {
      const v = rec.value;
      for (const x of ctx.altRatings?.get(rec.key) || []) {
        if (role(x.supplierId) !== "alternator_maker") continue;
        if (same(v.voltage, x.volt) && same(v.hz, x.hz) && same(v.phases, x.phase) && same(dutyOf(v.duty), dutyOf(x.duty)) && same(riseOf(v.insulation_rise), riseOf(x.rise))) hits.push(hit(x));
      }
    }
    for (const a of ctx.altAttrs?.get(rec.key) || []) if (ATTR_FIELD[a.key] === f.id && role(a.supplierId) === "alternator_maker") hits.push(hit(a));
  }
  const auto = !!f.key || (rec.part === "alternator" && f.id === "ratings");
  return { auto, hits: [...new Set(hits)], why: auto ? null : "trường chưa có code đọc (không có key trong spec-fields.json)" };
}

// ctx: { fields (spec-fields.json parts), readSource(file) → chữ | null (file tính từ suppliers/), keyOf, entries
// { engine|alternator|controller: Map(key → { makes: [tên] }) }, facts (modelFacts), altRatings / altAttrs / engRatings
// (sourceRatings alt / attr / eng), suppliers: Map(id → { role, sources: Set(n) }) }.
// Trả về { errors: [{ id, msg }], warnings: [{ id, msg }] }.
export function checkOneSource(records, ctx) {
  const errors = [], warnings = [];
  if (!Array.isArray(records)) return { errors: [{ id: "", msg: "one-source.json phải là một danh sách" }], warnings };
  const ids = new Map(), ok = [];
  for (const [i, rec] of records.entries()) {
    const id = isObj(rec) && rec.id ? String(rec.id) : `#${i}`;
    const err = (msg) => errors.push({ id, msg }), warn = (msg) => warnings.push({ id, msg });
    if (!isObj(rec)) { err("bản ghi phải là object"); continue; }
    // 1. Khoá, phần, trường, bậc.
    for (const k of Object.keys(rec)) if (!KEYS.has(k)) err(`khoá lạ "${k}"`);
    for (const k of REQUIRED) if (rec[k] == null || rec[k] === "") err(`thiếu ${k}`);
    if (!/^[a-z0-9-]+$/.test(rec.id || "")) err("id: chỉ a-z 0-9 -");
    if (ids.has(rec.id)) err(`id trùng với bản ghi #${ids.get(rec.id)}`); else ids.set(rec.id, i);
    if (!PARTS.has(rec.part)) { err(`part "${rec.part}" (engine / alternator / controller)`); continue; }
    const f = (ctx.fields?.[rec.part] || []).find((x) => x.id === rec.field);
    if (!f) { err(`field "${rec.field}" không có trong spec-fields.json phần ${rec.part}`); continue; }
    if (NOT_FIELDS.has(f.id)) { err(`field "${f.id}" là danh tính của model, không lấy từ một nguồn`); continue; }
    if (![1, 2, 3].includes(rec.level)) err(`level ${rec.level} (1 trang hãng, 2 bản hãng do bên khác đăng lại, 3 nguồn khác)`);
    if (rec.value == null) continue;
    const te = typeError(f, rec.value);
    if (te) err(`value: ${te}`);
    if (rec.cond != null && !isObj(rec.cond)) err("cond phải là object hoặc null");
    // 2. Nguồn.
    if (!/^https?:\/\/\S+$/.test(rec.url || "")) err("url phải là http(s)");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rec.accessedAt || "")) err("accessedAt: yyyy-mm-dd");
    let text = null;
    if (!/^sources\/one-source\/\d+\.md$/.test(rec.file || "")) err(`file "${rec.file}" phải là sources/one-source/<n>.md`);
    else if ((text = ctx.readSource(rec.file)) == null) err(`thiếu tệp nguồn ${rec.file}`);
    else {
      const head = text.split(/\r?\n/, 4);
      const u = head.find((l) => /^URL:/.test(l))?.slice(4).trim(), d = head.find((l) => /^Accessed:/.test(l))?.slice(9).trim();
      if (head[0] !== `URL: ${u}` || u !== rec.url) err(`url khác dòng đầu "URL:" của ${rec.file} (${u ?? "không có"})`);
      if (d !== rec.accessedAt) err(`accessedAt ${rec.accessedAt} khác dòng "Accessed:" của ${rec.file} (${d ?? "không có"})`);
    }
    // 3. Câu trích nguyên văn trong tệp nguồn.
    const quotes = list(rec.quote), condQuotes = list(rec.condQuote);
    if (!Array.isArray(rec.quote) || !quotes.length) err("quote phải là danh sách câu trích không rỗng");
    if (rec.condQuote != null && !Array.isArray(rec.condQuote)) err("condQuote phải là danh sách");
    const page = text == null ? null : norm(text);
    for (const [name, qs] of [["quote", quotes], ["condQuote", condQuotes]]) for (const q of qs) {
      if (typeof q !== "string" || q.length < 8) err(`${name}: câu trích dưới 8 ký tự "${short(q)}"`);
      else if (page != null && !page.includes(norm(q))) err(`${name}: không tìm thấy câu trích "${short(q)}" trong ${rec.file}`);
    }
    // 4. Câu trích chứa giá trị; điều kiện trong câu trích hoặc câu điều kiện.
    const Q = quotes.join(" | "), QC = [...quotes, ...condQuotes].join(" | ");
    if (!te) {
      if (f.type === "table") {
        for (const [k, x] of Object.entries(rec.value)) {
          if (x == null) continue;
          if (COND_COLS.has(k)) { if (!condCovered(x, QC)) err(`điều kiện ${k} = ${x} không có trong quote / condQuote`); }
          else if (!valueCovered(x, Q)) err(`giá trị ${k} = ${x} không có trong quote`);
        }
      } else if (f.type === "number" || f.type === "text") { if (!valueCovered(rec.value, Q)) err(`giá trị ${rec.value} không có trong quote`); }
      else if (f.type === "enum") { if (![rec.value, ...(f.same?.[rec.value] || [])].some((s) => norm(Q).includes(norm(s)))) err(`giá trị ${rec.value} (và cách viết cùng nghĩa trong spec-fields.json) không có trong quote`); }
      else warn(`giá trị ${f.type} (${stable(rec.value)}): bộ kiểm không đọc được từ câu trích, soát tay`);
    }
    if (isObj(rec.cond)) for (const [k, x] of Object.entries(rec.cond)) if (x != null && !condCovered(x, QC)) err(`cond ${k} = ${x} không có trong quote / condQuote`);
    // 5. Model và hãng của khoá.
    if (ctx.keyOf && ctx.keyOf(rec.model || "") !== rec.key) err(`key ${rec.key} khác keyOf("${rec.model}") = ${ctx.keyOf(rec.model || "")}`);
    const entry = ctx.entries?.[rec.part]?.get(rec.key);
    if (!entry) warn(`khoá ${rec.key} không có trong danh mục (chưa NCC nào chào ${rec.part} này): giá trị chưa hiện ở đâu`);
    else {
      const makes = [...new Set((entry.makes || []).map((m) => m?.name ?? m).filter(Boolean))];
      const hit = makes.filter((m) => canon(m) === canon(rec.make));
      if (!makes.length) warn(`danh mục chưa rõ hãng của khoá ${rec.key}`);
      else if (hit.length !== 1) err(`make "${rec.make}" không phải hãng của khoá ${rec.key} trong danh mục (${makes.join(" / ")})`);
    }
    // 8. makerChecked: tài liệu hãng đã xem.
    const mc = rec.makerChecked;
    if (mc != null && !Array.isArray(mc)) err("makerChecked phải là danh sách");
    for (const [j, m] of (Array.isArray(mc) ? mc : []).entries()) {
      if (!isObj(m)) { err(`makerChecked[${j}] phải là object`); continue; }
      for (const k of Object.keys(m)) if (!MC_KEYS.has(k)) err(`makerChecked[${j}]: khoá lạ "${k}"`);
      const s = ctx.suppliers?.get(m.supplierId);
      if (!s) { err(`makerChecked[${j}]: không có hồ sơ ${m.supplierId}`); continue; }
      if (!Array.isArray(m.n) || !m.n.length) err(`makerChecked[${j}]: n phải là danh sách số nguồn`);
      else for (const n of m.n) if (!s.sources.has(n)) err(`makerChecked[${j}]: nguồn ${n} không có trong ${m.supplierId}`);
    }
    // 6. Không đè số của tờ hãng.
    const mh = makerHits(rec, f, ctx);
    for (const h of mh.hits) err(`tờ hãng trong repo đã ghi ${f.id} của ${rec.key}: ${h} (xoá bản ghi một nguồn)`);
    if (!mh.auto) {
      warn(`${mh.why}: không kiểm tự động được tờ hãng có ghi ${f.id} không, dựa vào makerChecked`);
      if (Array.isArray(mc) && !mc.length) err(`makerChecked rỗng: trường ${f.id} không kiểm tự động được nên phải ghi tài liệu hãng đã xem`);
    } else if (Array.isArray(mc) && !mc.length && !String(rec.note || "").trim()) err("makerChecked rỗng thì note phải ghi đã tìm tài liệu hãng ở đâu");
    ok.push({ i, rec, f });
  }
  // 7. Trùng / mâu thuẫn: cùng phần + khoá + trường + điều kiện.
  const groups = new Map();
  for (const x of ok) {
    const s = sigOf(x.rec, x.f), g = stable([x.rec.part, x.rec.key, x.rec.field, s.cond]);
    groups.set(g, [...(groups.get(g) || []), { ...x, sig: s }]);
  }
  for (const g of groups.values()) for (let a = 0; a < g.length; a++) for (let b = a + 1; b < g.length; b++) {
    const [x, y] = [g[a].rec, g[b].rec];
    if (g[a].sig.value === g[b].sig.value) errors.push({ id: y.id, msg: `trùng ${x.id} (cùng ${x.key} ${x.field}, cùng điều kiện, cùng giá trị): giữ một bản (bậc nhỏ hơn; cùng bậc thì accessedAt mới hơn)` });
    else errors.push({ id: y.id, msg: `mâu thuẫn với ${x.id} (cùng ${x.key} ${x.field}, cùng điều kiện, khác giá trị): không bản nào đủ tin, bỏ cả hai hoặc Khoa chọn` });
  }
  // Lưu ý: bậc 3 khi bản ghi khác của cùng model đã có bậc 1 / 2.
  for (const x of ok) if (x.rec.level === 3) {
    const better = ok.find((y) => y !== x && y.rec.part === x.rec.part && y.rec.key === x.rec.key && y.rec.level < 3);
    if (better) warnings.push({ id: x.rec.id, msg: `bậc 3 trong khi ${better.rec.id} cùng model có bậc ${better.rec.level}: có thể còn nguồn tốt hơn` });
  }
  return { errors, warnings };
}

// ctx thật từ repo. Chậm (~13 s: CAT.build + modelFacts + sourceRatings), nên chỉ dựng khi tệp có bản ghi.
export async function contextOf(root = ROOT) {
  const CB = await import(pathToFileURL(path.join(root, "config-bot.mjs")).href);
  const CAT = globalThis.GenbidCatalog;
  const all = loadAll(path.join(root, "cn")).map((x) => x.rec).filter(Boolean);
  const live = all.filter((s) => s.status !== "incomplete");
  const built = CAT.build(live);
  const rt = CB.sourceRatings(live, path.join(root, "sources"));
  const entries = Object.fromEntries([["engine", built.engines], ["alternator", built.alternators], ["controller", built.controllers]].map(([p, l]) => [p, new Map(l.map((e) => [e.key, { makes: e.makes || [] }]))]));
  return {
    fields: JSON.parse(fs.readFileSync(path.join(root, "spec-fields.json"), "utf8")).parts,
    readSource: (file) => { const p = path.join(root, file); return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null; },
    keyOf: CAT.keyOf, entries, facts: CB.modelFacts(built, live), altRatings: rt.alt, altAttrs: rt.attr, engRatings: rt.eng,
    suppliers: new Map(all.map((s) => [s.id, { role: s.role, sources: new Set((s.sources || []).map((x) => x.n)) }])),
  };
}

// Đọc tệp, kiểm, in. Tệp rỗng thì không dựng ctx (verify.mjs không chậm thêm). Trả về số lỗi.
export async function runOneSource({ file = FILE, root = ROOT, log = console.log } = {}) {
  const name = path.relative(root, file) || file;
  let records;
  try { records = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { log(`✗ ${name}: đọc lỗi: ${e.message}`); return 1; }
  if (Array.isArray(records) && !records.length) { log(`✓ ${name}: 0 bản ghi`); return 0; }
  const { errors, warnings } = checkOneSource(records, Array.isArray(records) ? await contextOf(root) : {});
  log(`${errors.length ? "✗" : "✓"} ${name}: ${Array.isArray(records) ? records.length : 0} bản ghi, ${errors.length} lỗi`);
  for (const e of errors) log(`    lỗi: [${e.id}] ${e.msg}`);
  for (const w of warnings) log(`    lưu ý: [${w.id}] ${w.msg}`);
  return errors.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2] ? path.resolve(process.argv[2]) : FILE;
  runOneSource({ file }).then((n) => process.exit(n ? 1 : 0));
}
