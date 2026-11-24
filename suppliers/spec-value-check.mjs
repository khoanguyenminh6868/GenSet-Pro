// Bộ kiểm giá trị từng thông số của bản chuẩn (Khoa 24/11/2026): node suppliers/spec-value-check.mjs [--out <thư mục>]
// Chạy trên MỌI giá trị, CHỈ BÁO: không sửa, không xoá, không ẩn dữ liệu. Luật + căn cứ dải ở spec-value-rules.json.
//   sai = ngoài dải hợp lý, hoặc không đúng loại thông số (đơn vị, mức prime / standby); trùng = cùng mã ở nhiều khoá.
// In tóm tắt theo trường; danh sách đầy đủ ghi ra <out>/violations.jsonl, <out>/duplicates.json (ngoài git).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { standardOf, FIELDS } from "./spec-standard.mjs";
import { useNormCtx } from "./config-bot.mjs";
import { absurdOf } from "./row-flags-lib.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const RULES = JSON.parse(fs.readFileSync(path.join(ROOT, "spec-value-rules.json"), "utf8")).fields;
const SN = globalThis.GenbidSpecNorm;
const PARTS = ["genset", "engine", "alternator", "controller"];
const fieldDef = (part, id) => FIELDS.parts[part].find((f) => f.id === id);

// ---------- Đọc số và đơn vị trong chữ ----------
// "1,200" = 1200; "12,5" = 12.5; danh sách và khoảng cho mọi số.
export function numsOf(v) {
  if (typeof v === "number") return [v];
  if (Array.isArray(v)) return v.flatMap(numsOf);
  if (v == null || typeof v === "object") return [];
  return (String(v).normalize("NFKC").match(/\d+(?:[.,]\d+)*/g) || []).map((x) => (/^\d{1,3}(,\d{3})+$/.test(x) ? +x.replace(/,/g, "") : +x.replace(",", "."))).filter(Number.isFinite);
}
const UNITS = {
  fuelrate: ["l/hr", "l/h", "lit/h", "ltr/h", "g/kwh", "g/kw.h", "gr/kwh", "kg/h", "m3/h", "m3/kwh", "l/kwh"],
  speed: ["rpm", "r/min", "rev/min", "转"],
  power: ["kwm", "kwe", "kw", "kva", "bhp", "hp", "ps"],
  mass: ["kgs", "kg", "tons", "ton"],
  volume: ["liters", "litres", "liter", "litre", "ltr", "lit", "lt", "ml", "cc", "cm3", "gal", "升", "l"],
  length: ["mm", "cm", "m"],
  volt: ["vac", "vdc", "kv", "v"],
  amp: ["amps", "amp", "a"],
  freq: ["hz"],
  pct: ["%"],
  noise: ["db(a)", "dba", "db"],
  time: ["hours", "hour", "hrs", "hr", "h"],
  phase: ["phases", "phase", "ph"],
};
const TOKEN = Object.entries(UNITS).flatMap(([kind, list]) => list.map((t) => [t, kind])).sort((a, b) => b[0].length - a[0].length);
const KIND = new Map(TOKEN);
const UNIT_RE = new RegExp(`\\d\\s*(${TOKEN.map(([t]) => t.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")).join("|")})(?![\\p{L}\\p{N}/])`, "giu");
// Loại đại lượng ghi ngay sau số trong chữ gốc.
export const unitKinds = (raw) => [...new Set([...String(raw ?? "").normalize("NFKC").matchAll(UNIT_RE)].map((m) => KIND.get(m[1].toLowerCase())))];
const FIG_UNIT_RE = new RegExp(`(\\d+(?:[.,]\\d+)*)\\s*(${TOKEN.map(([t]) => t.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")).join("|")})(?![\\p{L}\\p{N}/])`, "giu");
// The unit kinds written right after the value's OWN figures: "2650 kg / 600 L" holds a 600 L tank, not a mass.
export function ownUnitKinds(raw, value) {
  const xs = numsOf(value);
  if (!xs.length) return unitKinds(raw);
  const kinds = new Set();
  for (const m of String(raw ?? "").normalize("NFKC").matchAll(FIG_UNIT_RE)) if (numsOf(m[1]).some((x) => xs.includes(x))) kinds.add(KIND.get(m[2].toLowerCase()));
  return [...kinds];
}

const STANDBY = /stand\s*-?\s*by|stanby|\besp\b|备用|dự phòng/i, PRIME = /prime|\bprp\b|常用|主用|liên tục/i;
// Chữ gốc nói mức kia: có chữ một mức và không có chữ mức còn lại.
export function ratingClash(rating, raw) {
  const t = String(raw ?? "");
  if (rating === "prime") return STANDBY.test(t) && !PRIME.test(t);
  if (rating === "standby") return PRIME.test(t) && !STANDBY.test(t);
  return false;
}

// ---------- Luật một giá trị ----------
const inRange = (x, [a, b]) => x >= a && x <= b;
const BROKEN = /\[object Object\]/;
function checkNumber(rule, it, out) {
  const xs = numsOf(it.value);
  if (it.unit && rule.units && !rule.units.includes(it.unit)) out("don-vi", `đơn vị ${it.unit}, trường nhận ${rule.units.join(", ")}`);
  if (!xs.length) { out("khong-phai-so", "giá trị không có số"); return; }
  if (rule.set) for (const x of xs) if (!rule.set.includes(x)) out("ngoai-dai", `${x} ngoài {${rule.set.join(", ")}}`);
  if (rule.range) for (const x of xs) if (!inRange(x, rule.range)) out("ngoai-dai", `${x} ngoài ${rule.range.join("-")}`);
  if (rule.int) for (const x of xs) if (!Number.isInteger(x)) out("khong-nguyen", `${x} không nguyên`);
}
function checkFuel(rule, it, kws, nonDiesel, out) {
  const xs = numsOf(it.value), bands = { 100: [0.12, 0.45, 800], 75: [0.09, 0.36, 650], 50: [0.06, 0.26, 450] }[rule.load];
  if (!xs.length) { out("khong-phai-so", "giá trị không có số"); return; }
  for (const x of xs) {
    if (it.unit === "g/kWh") { if (!inRange(x, [150, 300])) out("ngoai-dai", `${x} g/kWh ngoài 150-300`); continue; }
    if (it.unit === "kg/h" || it.unit === "m³/kWh") continue; // chưa có dải có căn cứ
    // The L/h bands of `likely` are for diesel: a petrol or gas set burns more per kW, so only the ceiling applies to it.
    if (!kws.length || nonDiesel) { if (x > bands[2]) out("ngoai-dai", `${x} vượt trần ${bands[2]} L/h`); }
    // A set of 30 kW or less burns more per kW: `likely` allows it 300 g/kWh against 260, the same ratio here (powerpack PG13-Y).
    else if (it.unit === "L/h" && !kws.some((k) => x >= k * bands[0] && x <= k * bands[1] * (Math.max(...kws) <= 30 ? 300 / 260 : 1))) out("lech-cong-suat", `${x} L/h ngoài ${bands[0]}-${bands[1]} × kW (${kws.join(", ")})`);
  }
}
function checkDims(it, out) {
  const xs = numsOf(it.value);
  // Two versions in one cell ("3000×1120×1950 / 4000×1430×2040", open / silent) are 3 figures each.
  if (!xs.length || xs.length % 3) { out("so-chieu", `${xs.length} số, cần 3 (hoặc bội của 3)`); return; }
  const band = it.unit === "m" ? [0.3, 16] : it.unit === "cm" ? [30, 1600] : it.unit === "mm" ? [300, 16000] : null;
  for (const x of xs) if (band ? !inRange(x, band) : !(inRange(x, [300, 16000]) || inRange(x, [0.3, 16]))) out("ngoai-dai", `${x} ngoài dải chiều (${it.unit || "không đơn vị"})`);
}
// One value against its field's rule. → [{ rule, detail, level }]; ctx.kws: kW of the model's power rows.
export function checkValue(part, id, it, ctx = {}) {
  const rule = RULES[`${part}.${id}`], found = [];
  if (!rule) return found;
  // One value breaking one rule on several figures is one violation.
  const out = (code, detail, level = "sai") => { const h = found.find((f) => f.rule === code); if (h) h.detail += `; ${detail}`; else found.push({ rule: code, detail, level }); };
  const v = it.value;
  if (typeof v === "string" && BROKEN.test(v)) { out("gia-tri-hong", "giá trị là chữ [object Object]"); return found; }
  if (rule.kinds && it.raw != null && !it.rawJoined) {
    const bad = ownUnitKinds(it.raw, v).filter((k) => !rule.kinds.includes(k));
    if (bad.length) out("sai-loai", `chữ gốc mang đơn vị loại ${bad.join(", ")}`);
  }
  if (it.cond?.rating && ratingClash(it.cond.rating, it.raw)) out("nham-muc", `ghi ${it.cond.rating}, chữ gốc nói mức kia`);
  switch (rule.kind) {
    case "code": if (!String(v ?? "").trim()) out("rong", "giá trị rỗng"); break;
    case "country": {
      const c = v && typeof v === "object" ? v.country : v;
      if (c !== "?" && !/^[A-Z]{2}$/.test(String(c))) out("sai-loai", `"${c}" không là mã nước`);
      break;
    }
    case "enum": {
      const f = fieldDef(part, id);
      if (!(f.values || []).includes(v)) out("ngoai-danh-sach", `"${v}" chưa về giá trị chuẩn`, "chua-chuan");
      break;
    }
    case "text": if (!new RegExp(rule.must, "iu").test(String(v))) out("sai-loai", `"${v}" không nêu đúng loại thông số`); break;
    case "number": checkNumber(rule, it, out); break;
    case "fuel": checkFuel(rule, it, ctx.kws || [], !!ctx.nonDiesel, out); break;
    case "dims": checkDims(it, out); break;
    case "bore": {
      const xs = numsOf(v);
      if (!xs.length || xs.length > 2) out("so-chieu", `${xs.length} số, cần đường kính × hành trình`);
      for (const x of xs) if (!inRange(x, rule.range)) out("ngoai-dai", `${x} ngoài ${rule.range.join("-")} mm`);
      break;
    }
    case "emission": if (!String(v ?? "").trim()) out("rong", "giá trị rỗng"); break;
    case "genset_power": {
      if (v.kva != null && !inRange(v.kva, rule.kva)) out("ngoai-dai", `${v.kva} kVA ngoài ${rule.kva.join("-")}`);
      if (v.kw != null && !inRange(v.kw, rule.kw)) out("ngoai-dai", `${v.kw} kW ngoài ${rule.kw.join("-")}`);
      if (v.kva && v.kw && !inRange(v.kw / v.kva, rule.ratio)) out("ti-le-kw-kva", `kW / kVA = ${(v.kw / v.kva).toFixed(2)}`);
      if (v.hz != null && ![50, 60].includes(v.hz)) out("ngoai-dai", `${v.hz} Hz`);
      if (ratingClash(v.rating, it.raw)) out("nham-muc", `ghi ${v.rating}, chữ gốc nói mức kia`);
      break;
    }
    case "engine_power": {
      const xs = numsOf(v[rule.col]);
      for (const x of xs) if (!inRange(x, rule.range)) out("ngoai-dai", `${x} ngoài ${rule.range.join("-")}`);
      // "15/20/1500": a speed read as one of the power figures of the cell.
      const top = Math.max(...xs), rest = xs.filter((x) => x !== top);
      if (rest.length && [1000, 1200, 1500, 1800, 3000, 3600].includes(top) && top > Math.max(...rest) * 3) out("lan-toc-do", `${top} là tốc độ, nằm trong số công suất`);
      for (const r of numsOf(v.rpm)) if (!inRange(r, rule.rpm)) out("ngoai-dai", `${r} v/p`);
      if (ratingClash(v.rating, it.raw)) out("nham-muc", `ghi ${v.rating}, chữ gốc nói mức kia`);
      break;
    }
    case "alt_ratings": {
      if (v.voltage != null && !inRange(v.voltage, rule.voltage)) out("ngoai-dai", `${v.voltage} V`);
      if (!rule.hz.includes(v.hz)) out("ngoai-dai", `${v.hz} Hz`);
      if (!rule.phases.includes(v.phases)) out("ngoai-dai", `${v.phases} pha`);
      if (v.kva != null && !inRange(v.kva, rule.kva)) out("ngoai-dai", `${v.kva} kVA`);
      if (v.kva && v.kw && !inRange(v.kw / v.kva, rule.ratio)) out("ti-le-kw-kva", `kW / kVA = ${(v.kw / v.kva).toFixed(2)}`);
      if (v.efficiency_pct != null && !inRange(v.efficiency_pct, rule.eff)) out("ngoai-dai", `hiệu suất ${v.efficiency_pct} %`);
      break;
    }
  }
  return found;
}

// ---------- Luật giữa các giá trị của một model ----------
const sameSrc = (a, b) => a.src && b.src && a.src.supplierId === b.src.supplierId && a.src.n === b.src.n && a.src.table === b.src.table && a.src.row === b.src.row;
// Standby below prime on ONE source row and frequency: the two levels are in each other's place.
export function levelSwaps(items, col) {
  const bad = [];
  for (const p of items) if (p.value?.rating === "prime" && p.value[col] != null) for (const s of items) {
    if (s.value?.rating !== "standby" || s.value[col] == null || !sameSrc(p, s) || (p.value.hz ?? null) !== (s.value.hz ?? null)) continue;
    if (s.value[col] < p.value[col]) bad.push({ it: s, detail: `standby ${s.value[col]} < prime ${p.value[col]} ${col}` });
  }
  return bad;
}
// Alternator: largest standby below largest continuous, same source, voltage, connection, phases and frequency.
export function dutySwaps(items) {
  const g = new Map();
  for (const it of items) {
    const v = it.value;
    if (v?.kva == null) continue;
    const k = JSON.stringify([it.src?.supplierId, it.src?.n, v.voltage, v.connection, v.phases, v.hz]);
    if (!g.has(k)) g.set(k, { c: null, s: null });
    const e = g.get(k), slot = v.duty === "standby" ? "s" : "c";
    if (!e[slot] || v.kva > e[slot].value.kva) e[slot] = it;
  }
  return [...g.values()].filter((e) => e.c && e.s && e.s.value.kva < e.c.value.kva).map((e) => ({ it: e.s, detail: `standby ${e.s.value.kva} < continuous ${e.c.value.kva} kVA` }));
}

// ---------- Trùng mã ----------
export const looseCode = (m) => String(m ?? "").normalize("NFKC").toUpperCase().replace(/[^\p{L}\p{N}]/gu, "");
// Why two spellings stay apart. "dau-co-nghia": ^ (Baudouin ESP, Khoa 21/11/2026 "tách ra") and ★ (ettes-power: made by
// Perkins China, MARK_KEEP) are kept on purpose. "ngoac-m-e": "(M)" / "(E)" against the bare letter, not merged so far.
export const dupKind = (models) => (models.some((m) => /[\^★]/.test(String(m))) ? "dau-co-nghia" : models.some((m) => /\([ME]\)/.test(String(m))) ? "ngoac-m-e" : "khac");
// Same code under several keys. Keys scoped to a supplier (`id|code`, "STC-10" of different factories) are different
// machines by design and are counted apart. Genset names belong to their supplier: compared inside one supplier only.
export function dupCodes(docs) {
  const groups = new Map(), scoped = new Map();
  const add = (map, g, entry) => { if (!map.has(g)) map.set(g, new Map()); map.get(g).set(entry.key, entry); };
  for (const d of docs) {
    if (d.part === "genset") { for (const [key, m] of Object.entries(d.models)) add(groups, `genset|${d.supplierId}|${looseCode(m.model)}`, { key, model: m.model, suppliers: [d.supplierId] }); continue; }
    add(String(d.key).includes("|") ? scoped : groups, `${d.part}|${looseCode(d.model)}`, { key: d.key, model: d.model, suppliers: d.suppliers });
  }
  const list = [];
  for (const [g, m] of groups) if (m.size > 1) {
    const [part] = g.split("|"), entries = [...m.values()];
    list.push({ part, code: g.split("|").pop(), supplier: part === "genset" ? g.split("|")[1] : null, kind: dupKind(entries.map((e) => e.model)), keys: entries });
  }
  list.sort((a, b) => a.part.localeCompare(b.part) || a.code.localeCompare(b.code) || String(a.supplier).localeCompare(String(b.supplier)));
  return { list, scoped: [...scoped.values()].filter((m) => m.size > 1).length };
}

// ---------- Chạy trên mọi giá trị ----------
function rowTextOf(byId, src) {
  const t = src?.supplierId != null && src.table != null ? byId.get(src.supplierId)?.specTables?.[src.table] : null;
  return t && src.row != null ? (t.rows || [])[src.row] ?? null : null;
}
export function checkDocs(docs, suppliers, { readings = [] } = {}) {
  const byId = new Map(suppliers.map((s) => [s.id, s]));
  const stats = {}, violations = [];
  for (const p of PARTS) for (const f of FIELDS.parts[p]) stats[`${p}.${f.id}`] = { values: 0, models: 0, bad: 0, soft: 0, rules: {}, hasRule: !!RULES[`${p}.${f.id}`] };
  const push = (part, id, m, it, c) => {
    const st = stats[`${part}.${id}`];
    if (c.level === "sai") st.bad++; else st.soft++;
    st.rules[c.rule] = (st.rules[c.rule] || 0) + 1;
    violations.push({ part, field: id, model: m.model, key: m.key, supplier: it.src?.supplierId ?? m.supplierId ?? null, value: it.value, unit: it.unit ?? null, raw: it.raw ?? null, src: it.src ?? null, row: rowTextOf(byId, it.src), rule: c.rule, level: c.level, detail: c.detail });
  };
  const scan = (part, m, fields) => {
    const kws = (fields.power || []).map((x) => x.value?.kw ?? (x.value?.kva != null ? x.value.kva * 0.8 : null)).filter((x) => x > 0);
    const nonDiesel = (fields.fuel || []).length > 0;
    for (const [id, items] of Object.entries(fields)) {
      const st = stats[`${part}.${id}`];
      st.models++; st.values += items.length;
      for (const it of items) for (const c of checkValue(part, id, it, { kws, nonDiesel })) push(part, id, m, it, c);
      const pairs = id === "power" ? [...levelSwaps(items, "kva"), ...levelSwaps(items, "kw")] : id === "power_kwm" ? levelSwaps(items, "kwm") : id === "power_hp" ? levelSwaps(items, "hp") : id === "ratings" ? dutySwaps(items) : [];
      for (const b of pairs) push(part, id, m, b.it, { rule: "nham-muc", level: "sai", detail: b.detail });
    }
  };
  for (const d of docs) {
    if (d.part === "genset") for (const [key, m] of Object.entries(d.models)) scan("genset", { model: m.model, key, supplierId: d.supplierId }, m.fields);
    else scan(d.part, { model: d.model, key: d.key }, d.fields);
  }
  // Against the row's own power / geometry, with the existing rules (absurdOf, SN.selfCheck).
  const geoSeen = new Set();
  for (const r of readings) {
    const rule = RULES[`${r.part}.${r.fid}`];
    if (!rule?.relation) continue;
    const m = { model: r.u.model ?? r.key, key: r.key, supplierId: r.u.supplierId };
    const it = { value: r.value, raw: r.sp.value, src: { supplierId: r.u.supplierId, n: r.u.n ?? null, table: r.u.table ?? null, row: r.u.row ?? null } };
    if (rule.relation === "absurd" && r.absurd === false) push(r.part, r.fid, m, it, { rule: "lech-cong-suat", level: "sai", detail: `absurdOf: ${r.sp.key} "${r.sp.value}" không hợp công suất của dòng` });
    // selfCheck reads the row's first displacement: only that value is the one it contradicts.
    if (rule.relation === "geometry" && r.geo?.bad && r.value === r.geo.disp) {
      const k = JSON.stringify([r.key, it.src, r.value]);
      if (!geoSeen.has(k)) { geoSeen.add(k); push(r.part, r.fid, m, it, { rule: "hinh-hoc", level: "sai", detail: `${r.geo.cyl} xi lanh × ${r.geo.bore} × ${r.geo.stroke} = ${r.geo.calc} L, ghi ${r.geo.disp} L` }); }
    }
  }
  return { stats, violations, noRule: Object.entries(stats).filter(([, s]) => !s.hasRule).map(([k, s]) => ({ field: k, values: s.values })) };
}
// standardOf with an audit that keeps, per reading, the row-level verdicts checkDocs needs.
export function runAll(all) {
  const readings = [], rowsMap = new Map(), geoOf = new WeakMap();
  for (const s of all) (s.specTables || []).forEach((t, i) => rowsMap.set(`${s.id}|${i}`, t.rows || []));
  const geo = (u) => { if (!geoOf.has(u)) geoOf.set(u, SN.selfCheck(SN.normalizeRecord(u, rowsMap.get(`${u.supplierId}|${u.table}`)))); return geoOf.get(u); };
  const audit = (a) => {
    if (a.drop || !RULES[`${a.part}.${a.fid}`]?.relation) return;
    const relation = RULES[`${a.part}.${a.fid}`].relation, ctx = useNormCtx(a.u, rowsMap);
    const r = { part: a.part, fid: a.fid, key: a.key, u: a.u, sp: a.sp, value: a.value };
    if (relation === "absurd") r.absurd = absurdOf(a.sp, a.u, ctx);
    else r.geo = geo(a.u);
    readings.push(r);
  };
  const docs = standardOf(all, { audit });
  return { docs, ...checkDocs(docs, all, { readings }), dups: dupCodes(docs) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2), i = argv.indexOf("--out");
  const out = i >= 0 ? argv[i + 1] : path.join(ROOT, "..", "..", "genbid-work", "spec-value-check");
  const dir = path.join(ROOT, "cn");
  const all = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const { stats, violations, noRule, dups } = runAll(all);
  console.log("trường | số giá trị | sai | chưa chuẩn | luật vi phạm");
  for (const [k, s] of Object.entries(stats)) if (s.hasRule) console.log(`${k} | ${s.values} | ${s.bad} | ${s.soft} | ${Object.entries(s.rules).map(([r, c]) => `${r} ${c}`).join(", ")}`);
  console.log(`\nTổng: ${Object.values(stats).reduce((a, s) => a + s.values, 0)} giá trị, ${violations.filter((v) => v.level === "sai").length} sai, ${violations.filter((v) => v.level !== "sai").length} chưa chuẩn.`);
  const dupN = (k) => dups.list.filter((d) => d.kind === k).length;
  console.log(`Trùng mã: ${dups.list.length} nhóm (dấu ^ / ★ cố ý tách ${dupN("dau-co-nghia")}, ngoặc (M) / (E) ${dupN("ngoac-m-e")}, còn lại ${dupN("khac")}); khoá theo NCC cùng mã (cố ý, không tính): ${dups.scoped}.`);
  console.log(`Chưa có luật (${noRule.length} trường): ${noRule.map((x) => x.field).join(", ")}`);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "violations.jsonl"), violations.map((v) => JSON.stringify(v)).join("\n") + "\n");
  fs.writeFileSync(path.join(out, "duplicates.json"), JSON.stringify(dups, null, 1));
  fs.writeFileSync(path.join(out, "summary.json"), JSON.stringify({ stats, noRule }, null, 1));
  console.log(`Danh sách đầy đủ: ${out}`);
}
