// Chức năng bộ điều khiển THEO TỪNG MODEL cho bản chuẩn (chuẩn hoá datasheet bước 4, PR G phần 1, điều phối 25/11/2026).
// Chỉ nhóm "đọc bằng từ khoá" của kiểm kê buoc-4-kiem-ke.md mục 5.3: các trường bool (có chức năng) + ba trường có mẫu số
// rõ trong câu (event_log "Event log (15)", max_sets "up to 16 generators", front_ip "IP65 ... front"). Nhóm cần bảng cấu
// trúc (protections, measure_*, accuracy, dc_supply, dimensions, io, languages, order_code, kind, display, operating_temp,
// governor_avr_control) để PR sau.
// Luật (Khoa + kiểm kê):
// - Dòng nguồn = dòng datasheet hãng (NCC role controller_maker) mà `controllerSheetFacts` (config-bot.mjs, cùng hàm
//   modelFacts dùng) gắn cho CHÍNH model đó. Dòng nêu mã BĐK khác: chữ khớp phải nằm sau tên model này (hoặc dòng chỉ nêu
//   model này), không thì bỏ.
// - Cụm chữ có ≠ có chức năng: dòng tuỳ chọn / mô-đun mở rộng / bên thứ ba, dòng phủ định, mục lục, nhật ký sửa đổi, dòng
//   nói về sản phẩm khác (mô-đun truyền thông, DSEWebNet...) KHÔNG cho giá trị (lý do ghi vào `skipped`).
// - Không có dòng thì để trống: không bao giờ ghi `false`. Không suy từ tên / số model, không lấy của model anh em.
// Không đổi config-bot.mjs / ctl-module.mjs: Gợi ý cấu hình vẫn chấm theo dòng datasheet như cũ.
import { controllerSheetFacts } from "./config-bot.mjs";
import { moduleIn } from "./ctl-module.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CAT = globalThis.GenbidCatalog;
const NFKC = (s) => String(s ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();

// Cặp (trường, dòng) đã SOÁT TAY và loại (PR G: soát hết mọi cặp từ khoá → dòng, không lấy mẫu): dòng chuẩn hoá NFKC nguyên
// văn + lý do. Từ khoá đúng chữ mà dòng không khẳng định chức năng của chính bộ điều khiển (mô-đun, mã đặt hàng, chân dự
// phòng, "CAN" động từ, biến thể khác...). Đổi `re` / SKIP thì phải soát lại các cặp mới sinh.
export const REVIEW_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "controllers-features-loai.json");
const DENY = (() => {
  const m = new Map();
  if (!fs.existsSync(REVIEW_FILE)) return m;
  for (const [fid, list] of Object.entries(JSON.parse(fs.readFileSync(REVIEW_FILE, "utf8")).rejects || {})) m.set(fid, new Set(list.map((x) => x.line)));
  return m;
})();
export const deniedOf = (fid, line) => !!DENY.get(fid)?.has(NFKC(line));

// ---------- Trường bool: từ khoá (re) + chữ loại trừ trên cùng dòng (not) ----------
// `re` khớp trên dòng đã NFKC; chỉ chữ khẳng định chức năng. Mỗi mục có tên trong kết quả để soát từng cặp (từ khoá → dòng).
export const BOOL_FEATURES = [
  { id: "auto_start_stop", re: /\bauto(?:matic)?[\s-]*start(?:ing)?\b|\bautomatic(?:ally)?\s+start(?:s|ing)?\s*(?:and|&|\/)\s*stop/i },
  { id: "mains_failure", re: /\bAMF\b|\bauto(?:matic)?\s+mains\s+(?:\(utility\)\s+)?failure|\bmains\s+(?:\(utility\)\s+)?failure\b|\butility\s+failure\b/i },
  { id: "remote_start", re: /\bremote[\s-]+start(?:ing)?\b/i },
  { id: "scheduler", re: /\bscheduler\b|\bexerciser\b|\bscheduled\s+run(?:s|ning)?\b/i },
  { id: "prot_earth_fault", re: /\bearth[\s-]*fault\b|\bground[\s-]*fault\b/i },
  { id: "prot_reverse_power", re: /\breverse[\s-]*power\b|\b32R\b/i },
  { id: "prot_overcurrent", re: /\bover[\s-]*current\b|\bIDMT\b/i },
  { id: "prot_mains_decoupling", re: /\bROCOF\b|\bvector[\s-]*shift\b|\bmains\s+decoupling\b/i },
  { id: "emergency_stop", re: /\bemergency[\s-]*stop\b/i },
  { id: "ecu_support", re: /\bJ1939\b|\bECU\b|\bECM\b|\belectronic\s+engines?\b/i },
  { id: "usb", re: /\bUSB\b/i },
  { id: "rs232", re: /\bRS[\s-]?232\b/i },
  { id: "rs485", re: /\bRS[\s-]?485\b/i },
  { id: "ethernet", re: /\bethernet\b|\bRJ[\s-]?45\b/i },
  // Chữ hoa: "CAN" là cổng / bus, không phải động từ "can"; "HGM6110CAN" (tên model) không có ranh giới từ trước CAN.
  { id: "can", re: /\bCAN(?:\s*bus|open)?\b|\bCANbus\b/ },
  { id: "modbus_rtu", re: /\bmodbus[\s-]*RTU\b/i },
  { id: "modbus_tcp", re: /\bmodbus[\s-]*(?:RTU\s*\/\s*)?TCP\b|\bmodbus\s*\/\s*TCP\b/i },
  { id: "snmp", re: /\bSNMP\b/ },
  { id: "remote_monitoring", re: /\bremote\s+monitoring\b|\bSCADA\b/i },
  { id: "cellular_sms", re: /\bGSM\b|\bSMS\b|\bGPRS\b|\b[345]G\b|\bLTE\b/ },
  { id: "data_logging", re: /\bdata[\s-]*log(?:ging|ger)?\b|\bdatalog(?:ging|ger)?\b/i },
  // Tên công ty "Deep Sea Electronics PLC / plc" không tính (kiểm kê 5.1).
  { id: "plc", re: /(?<!(?:electronics|Electronics|ELECTRONICS)\s)\bPLC\b/ },
  { id: "synchronising", re: /\bsynchroni[sz](?:ing|ation|er|e|es|ed)\b|\bparallel(?:l)?ing\b/i },
  { id: "load_sharing", re: /\bload[\s-]*shar(?:e|ing)\b/i },
  { id: "load_demand", re: /\bload[\s-]*demand\b|\bload[\s-]*dependent\s+(?:start|stop)/i },
  { id: "dead_bus", re: /\bdead[\s-]*bus\b/i },
  { id: "ul", re: /\bUL\s?(?:listed|recogni[sz]ed|6200|508|certified)\b|\bcULus\b|\bUL\s+certification\b/ },
];

// ---------- Trường có mẫu số trong câu ----------
// event_log: số sự kiện của nhật ký; max_sets: số tổ máy hoà tối đa; front_ip: mã IP của mặt trước.
export const NUM_FEATURES = [
  { id: "event_log", read: (l) => {
    const out = [];
    for (const m of l.matchAll(/\bevent\s+log(?:ging)?\s*\((\d{1,5})\)/gi)) out.push(Number(m[1]));
    for (const m of l.matchAll(/\b(?:event|history|alarm)\s+(?:log|record|history)s?\b[^.;|]{0,40}?\bup\s+to\s+(\d{1,5})\b/gi)) out.push(Number(m[1]));
    for (const m of l.matchAll(/\b(?:up\s+to\s+)?(\d{1,5})\s+(?:events?|event\s+records?)\b[^.;|]{0,20}?\blog/gi)) out.push(Number(m[1]));
    return out;
  } },
  { id: "max_sets", read: (l) => {
    const out = [];
    for (const m of l.matchAll(/\bup\s+to\s+(\d{1,3})\s+(?:gen[\s-]?sets|generators|generating\s+sets|sets)\b/gi)) out.push(Number(m[1]));
    return out;
  } },
  { id: "front_ip", read: (l) => {
    if (!/\bfront\b|\bfascia\b|\bgasket\b/i.test(l) || /\brear\b|\bback\b|\bterminal/i.test(l)) return [];
    return [...l.matchAll(/\bIP\s?([2-6][0-9])\b/g)].map((m) => `IP${m[1]}`);
  } },
];

// ---------- Dòng không cho giá trị ----------
// Thứ tự: lý do đầu tiên khớp được ghi lại.
const SKIP = [
  // Mục lục: hàng chấm / dấu ba chấm dẫn tới số trang.
  ["muc-luc", /\.{4,}|…{2,}|(?:\.\s){4,}|·{4,}/],
  // Nhật ký sửa đổi của tài liệu.
  ["nhat-ky-sua", /^\|?\s*(?:(?:rev(?:ision)?\.?\s*)?\d+(?:\.\d+)?\s*\|\s*)?(?:\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\s*\|\s*)?(?:added|removed|updated|amended|corrected|deleted|modified|changed|new\s+(?:feature|section|parameter))\b/i],
  // Tuỳ chọn, mô-đun mở rộng, bên thứ ba, thiết bị ngoài.
  ["tuy-chon", /\boption(?:s|al|ally)?\b|\bopt\.|\bextend|\bexpansion\b|\bextension\b|\bplug[\s-]?in\b|third[\s-]party|\bexternal\b|\badd[\s-]?on\b|\baccessor(?:y|ies)\b|\bif\s+(?:fitted|equipped|installed|available|supported)\b|\bwhen\s+(?:fitted|equipped|installed)\b|\bdepend(?:s|ing)?\s+on\b|\brequire[sd]?\b/i],
  // Phủ định.
  ["phu-dinh", /\bnot\b|\bno\b|\bnon[\s-]|\bwithout\b|\bunavailable\b|\bunsupported\b|\bdisabled?\b|\bn\/a\b|不支持|没有|无此/i],
  // Chỉ một biến thể ("Only Link LTE", "Only GC400x. CAN 1 ERR-ACTIVE", "(Only available for HGM9520N)"): không biết của model nào.
  ["chi-bien-the", /\bonly\b|\bexcept\b|仅/i],
  // Rung / va đập "3G in X, Y and Z axes": gia tốc, không phải mạng di động.
  ["khong-phai-chuc-nang", /\bvibration\b|\bshock\b|\bacceleration\b/i],
  // Sản phẩm khác: mô-đun truyền thông (danh sách ctl-module.mjs), cổng / phần mềm / dịch vụ giám sát của hãng.
  ["san-pham-khac", /\bmodule\s+(?:with|for)\b|\bInteli\s?(?:AIN|AIO|IO\d|Gateway|Vision|Monitor|ATS|Display)|\bI-(?:AIN|AIO|AOUT|CB|LB|RD)\b|DSEWebNet|WebSupervisor|InteliMonitor|InternetBridge|\bIB-?(?:NT|COM|Lite)\b|\bIG-?IB\b|\bCM-|\bCM\d-|\bDSE\s?(?:2\d{3}|8[59]\d)\b|\bconverter\b|\bgateway\b|\brouter\b|\bmodem\b|\bsmartphone\b|\bapp\b|\bSmartGen\s+(?:cloud|platform)|\bcloud\b/i],
];
// A line → the reason it gives no value, or null.
export function skipOf(line) {
  const l = NFKC(line);
  if (moduleIn(l).length) return "san-pham-khac";
  for (const [why, re] of SKIP) if (re.test(l)) return why;
  return null;
}

// ---------- Model của từng đoạn trong dòng ----------
// Tên BĐK nêu trong dòng, theo vị trí: CAT.controllersIn + dạng gộp "HGM6110N/6120N/6110NC" + "DSE6010/20 MKII" (như ctlNames
// của config-bot.mjs). Tên họ (HGM6100N SERIES, easYgen-3000 Series) không tính.
const family = (k) => /^HGM\d{2}00/.test(k) || /^EASYGEN\d000$/.test(k);
export function mentionsOf(line) {
  const l = String(line), out = [];
  for (const c of CAT.controllersIn(l).filter((x) => x.model)) {
    const k = CAT.keyOf(c.model);
    let from = 0, i;
    while ((i = l.indexOf(c.text, from)) >= 0) { out.push({ pos: i, end: i + c.text.length, keys: [k] }); from = i + c.text.length; }
  }
  for (const m of l.matchAll(/\bHGM\s?(\d{4}[A-Z]{0,4})((?:\s?\/\s?\d{4}[A-Z]{0,4})+)/gi)) out.push({ pos: m.index, end: m.index + m[0].length, keys: [m[1], ...m[2].split("/")].map((x) => x.trim()).filter(Boolean).map((c) => CAT.keyOf(`HGM${c}`)) });
  for (const m of l.matchAll(/\bDSE\s?(\d{2})(\d{2})((?:\s?\/\s?\d{2}(?!\d))+)(\s*MK\s?I{2,3})?/gi)) {
    const gen = m[4] ? m[4].replace(/\s+/g, "").toUpperCase() : "";
    out.push({ pos: m.index, end: m.index + m[0].length, keys: [m[2], ...m[3].split("/").map((x) => x.trim()).filter(Boolean)].map((c) => CAT.keyOf(`DSE${m[1]}${c}${gen}`)) });
  }
  return out.map((x) => ({ ...x, keys: x.keys.filter((k) => !family(k)) })).filter((x) => x.keys.length).sort((a, b) => a.pos - b.pos);
}
// Does a mention key name `model` (a key of the sheet)? "DSE7320" written without its generation is the sheet's DSE7320 MKII.
const names = (k, model) => k === model || new RegExp(`^${k}MK(?:II|III)$`).test(model);
// Is the text at `pos` of `line` about `model`? No model named: yes (controllerSheetFacts gave the line to it). Otherwise the
// nearest name before `pos` must be this model; text before every name only when every name of the line is this model.
export function ownerOK(line, model, pos, ms = mentionsOf(line)) {
  if (!ms.length) return true;
  const before = ms.filter((m) => m.end <= pos || m.pos <= pos).pop();
  if (before) return before.keys.some((k) => names(k, model));
  return ms.every((m) => m.keys.every((k) => names(k, model)));
}

// One line of `model`'s own sheet → { values: [{ fid, value, kw }], skipped: why | null, foreign: [{ fid, kw }] }.
// `kw` = the words matched (for the review of every keyword → line pair).
// A manual shared by variants that differ in what they have (Mecc Alte "GC315 (GC315Plus, GC315Link)", "GC315-GC400": GC315
// does not synchronise, only Plus has RS232, only Link has LTE / GPRS; soát PR G): a line gives a value only to a model it names.
export const sharedManual = (title) => /\bGC315\s*\(GC315Plus,\s*GC315Link\)|\bGC315-GC400\b/i.test(String(title || ""));
export function featuresOfLine(line, model, { mustName = false } = {}) {
  const l = NFKC(line), skip = skipOf(l), values = [], foreign = [], hits = [];
  for (const f of BOOL_FEATURES) {
    const re = new RegExp(f.re.source, f.re.flags.includes("g") ? f.re.flags : `${f.re.flags}g`);
    for (const m of l.matchAll(re)) hits.push({ fid: f.id, value: true, kw: m[0], pos: m.index });
  }
  for (const f of NUM_FEATURES) for (const v of f.read(l)) {
    const kw = f.id === "front_ip" ? v : String(v);
    hits.push({ fid: f.id, value: v, kw, pos: Math.max(0, l.indexOf(kw)) });
  }
  if (!hits.length) return { values, skipped: null, foreign };
  if (skip) return { values, skipped: skip, foreign, hits: hits.map(({ fid, kw }) => ({ fid, kw })) };
  const ms = mentionsOf(l);
  for (const h of hits) {
    if (deniedOf(h.fid, l)) { foreign.push({ fid: h.fid, kw: h.kw, denied: true }); continue; }
    if ((mustName && !ms.some((m) => m.keys.some((k) => names(k, model)))) || !ownerOK(l, model, h.pos, ms)) { foreign.push({ fid: h.fid, kw: h.kw }); continue; }
    if (!values.some((x) => x.fid === h.fid && x.value === h.value)) values.push({ fid: h.fid, value: h.value, kw: h.kw });
  }
  return { values, skipped: null, foreign };
}

// ---------- Vào bản chuẩn ----------
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
// The fields of a controller doc + its features: only fields with no value yet (a value of another reader is never joined or
// changed). One item per distinct value: `raw` / `src` = its first source line (sheet order), `origin: "ctl-sheet"`, `suppliers`
// = makers whose sheet says it. Keys stay sorted, as Bag.fields() gives them.
export function ctlFeatureFields(fields, items = []) {
  const out = { ...fields }, add = new Map();
  for (const it of items) {
    if (fields[it.fid]) continue;
    const k = `${it.fid}\u0000${JSON.stringify(it.value)}`;
    const e = add.get(k);
    if (e) { e.sup.add(it.src.supplierId); continue; }
    add.set(k, { fid: it.fid, it: { value: it.value, raw: it.raw, src: it.src, origin: "ctl-sheet" }, sup: new Set([it.src.supplierId]) });
  }
  for (const { fid, it, sup } of add.values()) (out[fid] ||= []).push({ ...it, suppliers: sup.size });
  for (const fid of new Set([...add.values()].map((x) => x.fid))) out[fid].sort((a, b) => b.suppliers - a.suppliers || cmp(JSON.stringify(a.value), JSON.stringify(b.value)));
  return Object.fromEntries(Object.keys(out).sort(cmp).map((k) => [k, out[k]]));
}
// Kiểm chéo (spec-standard-check.mjs, test): mọi giá trị `origin: "ctl-sheet"` của doc bộ điều khiển phải (1) có `raw` đúng là
// dòng `src.row` của bảng `src.table` của NCC `src.supplierId` (role controller_maker, cùng số nguồn `src.n`), (2) dòng đó được
// controllerSheetFacts gắn cho CHÍNH model của doc, (3) đọc lại dòng bằng featuresOfLine cho đúng trường + giá trị, (4) trường
// bool chỉ `true`. Trả về { checked, bad: [{ id, why }] }.
export function checkCtlFeatureValues(docs, suppliers = []) {
  const byId = new Map((suppliers || []).filter(Boolean).map((s) => [s.id, s])), sheetCache = new Map(), out = { checked: 0, bad: [] };
  const boolIds = new Set(BOOL_FEATURES.map((f) => f.id));
  const modelsOf = (s, ti) => {
    const k = `${s.id}|${ti}`;
    if (!sheetCache.has(k)) {
      const m = new Map();
      for (const { model, f } of controllerSheetFacts(s, s.specTables[ti])) m.set(`${model}\u0000${f.line}`, true);
      sheetCache.set(k, m);
    }
    return sheetCache.get(k);
  };
  for (const d of docs || []) {
    if (d.part !== "controller") { if (d.part === "genset" ? Object.values(d.models || {}).some((m) => Object.values(m.fields).some((l) => l.some((x) => x.origin === "ctl-sheet"))) : Object.values(d.fields || {}).some((l) => l.some((x) => x.origin === "ctl-sheet"))) out.bad.push({ id: d.id, why: "giá trị ctl-sheet ngoài doc bộ điều khiển" }); continue; }
    for (const [fid, items] of Object.entries(d.fields)) for (const it of items) {
      if (it.origin !== "ctl-sheet") continue;
      out.checked++;
      const bad = (why) => out.bad.push({ id: `${d.id} ${fid}`, why });
      const s = byId.get(it.src?.supplierId), t = s?.specTables?.[it.src?.table];
      if (!s || s.role !== "controller_maker" || !t || t.n !== it.src.n) { bad("không có bảng nguồn của hãng BĐK"); continue; }
      if (t.rows[it.src.row] !== it.raw) { bad("raw không phải dòng src.row của bảng"); continue; }
      if (otherSheet(t.title) || !modelsOf(s, it.src.table).has(`${d.key}\u0000${it.raw}`)) { bad("dòng không thuộc datasheet của chính model"); continue; }
      if (boolIds.has(fid) && it.value !== true) bad(`trường bool phải là true, có ${JSON.stringify(it.value)}`);
      if (!featuresOfLine(it.raw, d.key, { mustName: sharedManual(t.title) }).values.some((v) => v.fid === fid && v.value === it.value)) bad("đọc lại dòng không ra giá trị này");
    }
  }
  return out;
}
// A sheet of another product that only lists the controllers it works with ("Datasheet: The DSEG0123 also allows the DSEG8600,
// ..., DSE7510 and DSE5510 controllers to be added"): controllerSheetFacts gives its lines to those controllers, but it is not
// their own datasheet.
export const otherSheet = (title) => {
  const t = String(title || "").replace(/^Datasheet:\s*/, ""), ms = mentionsOf(t);
  const head = ms.length ? t.slice(0, ms[0].pos) : t;
  return /\balso\s+allows\b|\bcompatible\s+with\b|\bfor\s+use\s+with\b|\bworks\s+with\b/i.test(head);
};
// Every controller maker's sheet → Map(model key → [{ fid, value, raw, src: { supplierId, n, table, row }, kw }]) in the order
// of the sheets, plus `audit` = every line with a hit (kept, skipped or of another model) for the review list.
export function controllerFeatures(suppliers = []) {
  const out = new Map(), audit = [];
  for (const s of suppliers || []) {
    if (s?.role !== "controller_maker") continue;
    (s.specTables || []).forEach((t, ti) => {
      if (otherSheet(t.title)) return;
      // controllerSheetFacts gives `line` = the row itself; the row index is the first row equal to it not used yet for the
      // same model (a row repeated in one table is one source line either way).
      const rowIdx = new Map();
      t.rows.forEach((r, i) => { if (!rowIdx.has(r)) rowIdx.set(r, i); });
      for (const { model, f } of controllerSheetFacts(s, t)) {
        const r = featuresOfLine(f.line, model, { mustName: sharedManual(t.title) });
        if (!r.values.length && !r.skipped && !r.foreign.length) continue;
        const src = { supplierId: s.id, n: t.n, table: ti, row: rowIdx.get(f.line) ?? null };
        audit.push({ model, line: f.line, src, values: r.values, skipped: r.skipped, hits: r.hits || [], foreign: r.foreign });
        for (const v of r.values) {
          const l = out.get(model) || [];
          l.push({ fid: v.fid, value: v.value, raw: f.line, src, kw: v.kw });
          out.set(model, l);
        }
      }
    });
  }
  return { byModel: out, audit };
}

// node suppliers/controllers-features.mjs [--list <tệp.tsv>]: số model có giá trị theo trường và hãng; --list ghi MỌI cặp
// (model, trường, giá trị, NCC, số nguồn, dòng nguồn) để soát.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "cn");
  const all = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((s) => s.status !== "incomplete");
  const { byModel } = controllerFeatures(all), per = {}, rows = [];
  for (const [model, items] of [...byModel].sort(([a], [b]) => cmp(a, b))) for (const it of items) {
    ((per[it.fid] ||= {})[it.src.supplierId] ||= new Set()).add(model);
    rows.push([model, it.fid, JSON.stringify(it.value), it.src.supplierId, it.src.n, NFKC(it.raw)].join("\t"));
  }
  for (const f of Object.keys(per).sort()) console.log(`${f}: ${Object.entries(per[f]).map(([s, m]) => `${s} ${m.size}`).join(", ")}`);
  const i = process.argv.indexOf("--list");
  if (i > 0) { fs.writeFileSync(process.argv[i + 1], `model\ttruong\tgia_tri\tncc\tn\tdong_nguon\n${rows.join("\n")}\n`); console.log(`${rows.length} dòng → ${process.argv[i + 1]}`); }
}
