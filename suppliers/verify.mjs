// Checks every supplier record against its saved sources, no AI: node suppliers/verify.mjs [--json]
// A record passes only when each quote is found word for word in the source file it names, each number in a
// product line's power range is in the quote it cites, and every src points at a real source.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ROLES = new Set(["genset_oem", "engine_maker", "alternator_maker", "distributor"]);
const STATUS = new Set(["verified", "partial", "incomplete"]);
const FUELS = new Set(["diesel", "gas", "dual", "hfo", "gasoline", "other"]);
const RATINGS = new Set(["prime", "standby", "continuous", "unspecified"]);
const UNITS = new Set(["kVA", "kW", "hp", "PS"]);
const TIERS = new Set(["A", "B", "C"]);
const KINDS = new Set(["genset", "engine", "alternator"]);
const CONTACTS = new Set(["email", "phone", "whatsapp", "wechat"]);

// Same text either side: whitespace collapsed, full-width tildes and dashes read as their ASCII forms.
export const norm = (s) => String(s ?? "").normalize("NFKC").replace(/[～〜]/g, "~").replace(/[‐-―−]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
const numbersIn = (s) => (norm(s).replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);

export function checkRecord(rec, file) {
  const errors = [], warnings = [];
  const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
  if (!/^[a-z0-9-]+$/.test(rec.id || "")) err("id: a-z 0-9 -");
  if (file && path.basename(file, ".json") !== rec.id) err(`id ${rec.id} khác tên file`);
  if (!rec.country || !/^[A-Z]{2}$/.test(rec.country)) err("country: mã 2 chữ");
  if (!ROLES.has(rec.role)) err(`role ${rec.role}`);
  if (!STATUS.has(rec.status)) err(`status ${rec.status}`);
  if (!rec.names?.en && !rec.names?.zh) err("names: cần tên");
  const sources = new Map();
  for (const s of rec.sources || []) {
    if (sources.has(s.n)) err(`source ${s.n} trùng`);
    if (!/^https?:\/\//.test(s.url || "")) err(`source ${s.n}: url`);
    if (!TIERS.has(s.tier)) err(`source ${s.n}: tier`);
    let text = null;
    const f = s.file && path.join(ROOT, s.file);
    if (!f || !fs.existsSync(f)) err(`source ${s.n}: thiếu file ${s.file}`);
    else text = norm(fs.readFileSync(f, "utf8"));
    const quotes = Array.isArray(s.quote) ? s.quote : [s.quote];
    if (!quotes.length || quotes.some((q) => !q || String(q).length < 8)) err(`source ${s.n}: cần câu trích`);
    if (text != null) for (const q of quotes) if (q && !text.includes(norm(q))) err(`source ${s.n}: không tìm thấy câu trích "${String(q).slice(0, 80)}"`);
    sources.set(s.n, { ...s, quotes });
  }
  const srcOk = (src, where) => {
    if (!Array.isArray(src) || !src.length) { err(`${where}: thiếu src`); return []; }
    return src.map((n) => sources.get(n) || (err(`${where}: src ${n} không có`), null)).filter(Boolean);
  };
  const quoted = (list) => list.flatMap((s) => s.quotes).join(" | ");
  for (const [i, s] of (rec.strengths || []).entries()) { if (!s.text) err(`strengths[${i}]: text`); srcOk(s.src, `strengths[${i}]`); }
  for (const [i, c] of (rec.certifications || []).entries()) srcOk(c.src, `certifications[${i}] ${c.name}`);
  for (const [i, d] of (rec.vietnam?.distributors || []).entries()) srcOk(d.src, `vietnam.distributors[${i}]`);
  if (rec.founded != null) srcOk(rec.foundedSrc, "founded");
  // Contacts (contacts.mjs): the value is in a quote of its source, so it was read from the page, not typed.
  for (const [i, c] of (rec.contacts || []).entries()) {
    const where = `contacts[${i}] ${c.type} ${c.value}`;
    if (!CONTACTS.has(c.type)) err(`${where}: type`);
    if (!c.value) err(`${where}: value`);
    else if (!norm(quoted(srcOk(c.src, where))).includes(norm(c.value))) err(`${where}: không có trong câu trích nguồn`);
  }
  for (const [i, p] of (rec.productLines || []).entries()) {
    const where = `productLines[${i}] ${p.series || ""}`;
    if (!KINDS.has(p.kind)) err(`${where}: kind ${p.kind}`);
    if (p.kind !== "alternator" && !FUELS.has(p.fuel)) err(`${where}: fuel ${p.fuel}`);
    srcOk(p.src, where);
    if (p.power) {
      const pw = p.power;
      if (!UNITS.has(pw.unit)) err(`${where}: power.unit`);
      if (!RATINGS.has(pw.rating)) err(`${where}: power.rating`);
      if (!(pw.min > 0) || !(pw.max >= pw.min)) err(`${where}: power min/max`);
      const nums = numbersIn(quoted(srcOk(pw.src, `${where} power`)));
      for (const v of [pw.min, pw.max]) if (!nums.includes(v)) err(`${where}: số ${v} không có trong câu trích nguồn`);
    }
  }
  // Spec tables (crawl-specs.mjs): every header and row line must be in the saved page of its source.
  for (const [i, t] of (rec.specTables || []).entries()) {
    const s = sources.get(t.n);
    if (!s) { err(`specTables[${i}]: src ${t.n} không có`); continue; }
    if (!t.rows?.length) err(`specTables[${i}]: không có dòng`);
    const text = s.file && fs.existsSync(path.join(ROOT, s.file)) ? norm(fs.readFileSync(path.join(ROOT, s.file), "utf8")) : "";
    for (const l of [...(t.header || []), ...(t.rows || [])]) if (!text.includes(norm(l))) err(`specTables[${i}]: không tìm thấy dòng "${String(l).slice(0, 60)}"`);
  }
  if (rec.status === "verified") {
    if (!rec.website) err("verified: thiếu website");
    if (!(rec.productLines || []).some((p) => p.power)) err("verified: cần ít nhất 1 dòng máy có dải công suất");
  }
  const tiers = [...sources.values()].map((s) => s.tier);
  if (rec.confidence === "high" && !tiers.includes("A")) warn("confidence high nhưng không có nguồn tier A");
  if (tiers.length && tiers.every((t) => t === "C") && rec.confidence !== "low") err("chỉ có nguồn tier C thì confidence phải là low");
  return { errors, warnings };
}

export function loadAll(dir = path.join(ROOT, "cn")) {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => {
    const file = path.join(dir, f);
    try { return { file, rec: JSON.parse(fs.readFileSync(file, "utf8")) }; }
    catch (e) { return { file, rec: null, parseError: e.message }; }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const all = loadAll();
  let bad = 0;
  const count = (key) => all.reduce((m, { rec }) => (rec && (m[rec[key]] = (m[rec[key]] || 0) + 1), m), {});
  for (const { file, rec, parseError } of all) {
    if (parseError) { bad++; console.log(`✗ ${path.basename(file)}: JSON lỗi: ${parseError}`); continue; }
    const { errors, warnings } = checkRecord(rec, file);
    if (errors.length) bad++;
    console.log(`${errors.length ? "✗" : "✓"} ${rec.id} (${rec.role}, ${rec.status}, ${rec.confidence})`);
    for (const e of errors) console.log(`    lỗi: ${e}`);
    for (const w of warnings) console.log(`    lưu ý: ${w}`);
  }
  const ids = all.map(({ rec }) => rec?.id).filter(Boolean);
  for (const { rec } of all) for (const r of rec?.relatedIds || []) if (!ids.includes(r)) console.log(`lưu ý: ${rec.id} liên kết tới ${r} chưa có bản ghi`);
  console.log(`\n${all.length} bản ghi, ${bad} có lỗi`);
  console.log("role:", JSON.stringify(count("role")), " status:", JSON.stringify(count("status")), " confidence:", JSON.stringify(count("confidence")));
  process.exit(bad ? 1 : 0);
}
