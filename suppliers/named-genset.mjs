// Tổ máy HSMT nêu đích danh (Khoa 2026-11-12, IB2600601812: "Nhà sản xuất Huyndai", "Mã hiệu DHY110K SE" gave six
// configurations of other makes and none of that model). Read the make / model of the GENSET the HSMT names, compare
// makes with their spelling slips put right, mark each configuration as the named model / make or an equivalent, and say
// at the top of the result whether the HSMT allows an equivalent for that make / model.
// Every function here returns null / leaves a result untouched when the HSMT names no genset make or model: a tender
// that names none is as before.
import { norm } from "./verify.mjs";

const CAT = () => globalThis.GenbidCatalog;
const BP = () => globalThis.GenbidBidprice;

// ---------- makes ----------
// Genset makes besides the engine makes of catalog.js (ENGINE_BRANDS): the names HSMT write for the set.
const GENSET_MAKES = ["Hyundai", "Denyo", "Honda", "FG Wilson", "SDMO", "Atlas Copco", "AGG", "Fortugen", "Kofo", "Makawa", "FADI", "Kibii",
  "Elemax", "Kama", "Pramac", "Himoinsa", "Aksa", "Visa", "Rehlko", "Olympian", "Suntech", "Depco", "Bruno", "Genmac", "Cummins", "Caterpillar"];
// Slips found in the HSMT texts (genbid-work/specs, 1.507 HSMT, 2026-11-12: Huyndai 70 times, Perkin 19, Mitshubishi 8,
// Cumins 10, Misubishi 1) and the like. Only for comparing makes: a quote of the HSMT is never rewritten.
const ALIAS = { huyndai: "Hyundai", hyndai: "Hyundai", huynhdai: "Hyundai", hyunhdai: "Hyundai", hyunday: "Hyundai", huyndal: "Hyundai", hundai: "Hyundai",
  cumins: "Cummins", cumin: "Cummins", cummin: "Cummins", mitshubishi: "Mitsubishi", misubishi: "Mitsubishi", mitsubisi: "Mitsubishi", mitsubishy: "Mitsubishi",
  perkin: "Perkins", kolher: "Kohler", koler: "Kohler", dossan: "Doosan", doosal: "Doosan", deawoo: "Daewoo", daewo: "Daewoo", denio: "Denyo",
  catterpillar: "Caterpillar", caterpilar: "Caterpillar", wilson: "FG Wilson", fgwilson: "FG Wilson", baudoin: "Baudouin", volvo: "Volvo Penta", deere: "John Deere", yamar: "Yanmar", atlas: "Atlas Copco" };
const letters = (s) => norm(String(s ?? "")).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z]/g, "");
let MAKES = null;
const makeList = () => MAKES || (MAKES = [...new Set([...(CAT()?.ENGINE_BRANDS || []).map(([, n]) => n), ...GENSET_MAKES])]);
// Damerau–Levenshtein ≤ 1 (one letter added, dropped, changed or two swapped).
function near1(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}
// Every make a text names, in order, each once: { make, word } (word = as the text writes it, "Huyndai").
export function makesIn(text) {
  const s = String(text ?? "").normalize("NFC"), out = [], list = makeList();
  const push = (make, word) => { if (!out.some((x) => x.make === make)) out.push({ make, word }); };
  for (const w of s.split(/[^\p{L}\p{N}]+/u).filter(Boolean)) {
    const l = letters(w);
    if (l.length < 3) continue;
    const hit = ALIAS[l] || list.find((m) => letters(m) === l) || (l.length >= 6 ? list.find((m) => letters(m).length >= 6 && near1(letters(m), l)) : null);
    if (hit) push(hit, w);
  }
  // Makes of two words ("FG Wilson", "Atlas Copco", "John Deere"), the words apart or joined.
  const flat = " " + s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ") + " ";
  for (const m of list.filter((m) => /\s/.test(m))) { const w = m.toLowerCase().split(/\s+/); if (flat.includes(` ${w.join(" ")} `) || flat.includes(` ${w.join("")} `)) push(m, m); }
  return out;
}
// The make a text names, its slips put right ("Huyndai" → "Hyundai", "HYUNDAI DHY125KSE" → "Hyundai"); null when none.
export const normMake = (text) => makesIn(text)[0]?.make || null;
// Two texts of one make (each read by normMake; a text no make is read from compares by its letters).
export function sameMake(a, b) {
  const x = normMake(a) || letters(a), y = normMake(b) || letters(b);
  return !!x && !!y && x === y;
}
// A model key: no case, space, dash, dot or slash ("DHY110K SE" = "DHY110KSE" = "dhy-110k-se").
export const modelKey = (m) => String(m ?? "").normalize("NFKC").toUpperCase().replace(/[^A-Z0-9]/g, "");
// A text names a model when its key holds the model's key between non-alphanumerics (not "DHY110KSE" inside "DHY110KSE3").
export function namesModel(text, model) {
  const k = modelKey(model);
  if (k.length < 4) return false;
  // The key's characters with any space, dash, dot or slash between them, not inside a longer code.
  const re = new RegExp(`(?<![A-Z0-9])${k.split("").join("[\\s\\-_./]?")}(?![A-Z0-9])`);
  return re.test(String(text ?? "").normalize("NFKC").toUpperCase());
}

// ---------- reading the HSMT ----------
// A value that only asks the bidder to state it.
const PLACE = /n[êe]u\s*(r[õo]|c[ụu]\s*th[ểe])|khai\s*b[áa]o|ghi\s*r[õo]|c[ụu]\s*th[ểe]|theo\s|nh[àa]\s*th[ầa]u|đ[áa]p\s*[ứu]ng|ch[àa]o|cung\s*c[ấa]p|x[áa]c\s*đ[ịi]nh|th[ểe]\s*hi[ệe]n|^\s*[-–—.…x]*\s*$|^\s*(có|không)\s*$|m[ớo]i\s*100|t[ìi]nh\s*tr[ạa]ng|iso\b|\bg\s?-?(7|20)\b|đ[ồo]ng\s*b[ộo]|kinh\s*nghi[ệe]m|\beu\b|ch[âa]u\s*[âa]u|qu[ốo]c\s*gia|n[ưu][ớo]c|xu[ấa]t\s*x[ứu]|uy\s*t[íi]n|ch[íi]nh\s*h[ãa]ng/i;
// A text about a genset in place (maintenance, repair, its parts): the make / model of a set the tender does not buy.
const SERVICE = /bảo\s*(trì|dưỡng)|sửa\s*chữa|đại\s*tu|thay\s*thế|vật\s*tư|(?<!\p{L})lọc(?!\p{L})|phụ\s*tùng|hiện\s*có|đang\s*(sử\s*dụng|vận\s*hành)|cần\s*(phải\s*)?bảo|lắp\s*đặt\s*(tại|ở)|đặt\s*(tại|ở|phía)/iu;
const EQUIV = /t[ươu][ơo]ng\s*đ[ươu][ơo]ng|t[ươu][ơo]ng\s*t[ựu]|equivalent|or\s+similar/i;
// The model of a value: a code with letters and digits ("DHY110K SE", "C750D5P", "QES 30", "FG-C33LS").
const MODEL_RE = /[A-Za-z0-9][A-Za-z0-9\-_./]*\d[A-Za-z0-9\-_./]*(?:\s+[A-Z]{1,3}\d{0,3}\b|\s+\d{1,4}\b)?|[A-Za-z]{1,8}[\s-]?\d{2,5}[A-Za-z0-9\-]*/;
const cleanValue = (v) => String(v ?? "").replace(EQUIV, "").replace(/\b(hoặc|or)\b\s*$/i, "").replace(/\(\s*\)/g, "").replace(/[\s,;:.\-–(]+$/g, "").replace(/^[\s,;:.\-–)]+/, "").trim();
function modelOf(v) {
  const s = cleanValue(v);
  if (!s || PLACE.test(s) || SERVICE.test(s) || /kva|kw\b|\bhz\b|\bv\b|vòng|lít|pha\b|\d\s*(db|%|mm|kg|°c)/i.test(s)) return null;
  const m = s.match(MODEL_RE);
  if (!m) return null;
  const x = m[0].trim();
  return /[A-Za-z]/.test(x) && /\d/.test(x) && modelKey(x).length >= 5 && !/^(ISO|IEC|TCVN|IP|QCVN|EN|IEEE)\d/i.test(modelKey(x)) ? x : null;
}
function makeOf(v) {
  const s = cleanValue(v);
  if (!s || PLACE.test(s) || SERVICE.test(s)) return null;
  // Several makes ("Hữu Toàn, Hyundai, Mitsubishi", "MTU/ Caterpillar/ Cummins"): a list to choose from, no one maker.
  // "AGG … động cơ Cummins", "Powered by Volvo Penta": the first make named is the genset's.
  const ms = makesIn(s);
  const byWord = /động\s*cơ|engine|powered\s*by|\bby\b/i.test(s);
  if (ms.length > 1 && !byWord) return null;
  // A list of names, some no make we know ("Huyndai, LS, Schneider, Siemens, ABB").
  if (!byWord && s.split(/[,;/]|\s+hoặc\s+/).filter((x) => /\p{L}{2}/u.test(x)).length > 1 && !MODEL_RE.test(s)) return null;
  return ms[0] ? { make: ms[0].make, raw: ms[0].word } : null;
}
// A section heading of a part other than the genset ("II Thông số kỹ thuật động cơ", "III. Yêu cầu đối với đầu phát",
// "IV Thông số kỹ thuật bộ điều khiển", "V Vỏ giảm âm", "VI Tủ chuyển đổi nguồn tự động (ATS)"), also inside a line a web
// form flattened; and one of the genset ("I Thông số kỹ thuật chung tổ máy phát điện").
const HEAD = /(?:^|\n|\s)(?:[IVX]{1,4}|[A-H]|\d{1,2}(?:\.\d{1,2})*)[.):]?\s+(?:(?:thông số|yêu cầu|đặc tính)(?:\s+kỹ thuật)?(?:\s+chung)?(?:\s+(?:của|đối với|về|cho))?\s+)?(động cơ|đầu phát|bộ điều khiển|bảng điều khiển|tủ điều khiển|vỏ|tủ|ats|phụ kiện|tổ máy|máy phát|genset)/giu;
function partAt(t, at) {
  let kind = "genset";
  HEAD.lastIndex = 0;
  for (let m; (m = HEAD.exec(t)) && m.index < at; ) kind = /tổ máy|máy phát|genset/i.test(m[1]) ? "genset" : "other";
  return kind;
}
// A row under a sub-heading of another part: "- Động cơ:" then "+ Nhà sản xuất: Dongfeng Cummins" / "+ Model: QSZ13-G3"
// (IB2600592684). The lines before it with the same bullet are its siblings; the first line above them is its parent.
const PART_WORD = /động\s*cơ|engine|đầu\s*phát|alternator|điều\s*khiển|controller|vỏ\s*(giảm|chống|cách)|\bats\b|tủ\s/i;
function underOtherPart(t, at) {
  const start = t.lastIndexOf("\n", at - 1) + 1, lines = t.slice(Math.max(0, start - 1500), start).split("\n").reverse();
  const bullet = (l) => (l.match(/^\s*([-+•*])/) || [])[1] || "";
  const own = bullet(t.slice(start, at));
  if (!own) return false;
  for (const l of lines) {
    if (!l.trim()) continue;
    if (bullet(l) === own) { if (PART_WORD.test(l.replace(/^\s*[-+•*]\s*/, "").split(":")[0])) return true; continue; }
    return PART_WORD.test(l);
  }
  return false;
}
// The text of one row (cell) from `at`: up to the next row number of a flattened table ("4 Mã hiệu"), a tab or a line end.
function cellAt(t, at, len) {
  const rest = t.slice(at + len), stop = rest.search(/\t|\n|\s\d{1,2}\s+\p{Lu}|\s[IVX]{1,4}\s+\p{Lu}/u);
  return rest.slice(0, stop < 0 ? 120 : Math.min(stop, 120));
}
const MAKE_LBL = /(?:nhà|hãng)\s*sản\s*xuất|nhãn\s*(?:hiệu|mác)|thương\s*hiệu|hiệu\s*máy|hãng/i, MODEL_LBL = /(?:ký\s*)?mã\s*hiệu|\bmodel\b|kiểu\s*(?:loại|máy)|mã\s*sản\s*phẩm/i;
// A sentence that makes every make / model of the table a reference only ("Nhãn hiệu, model … chỉ mang tính tham khảo",
// "… hoặc tương đương"), not a row of one value.
const GENERAL_EQUIV = /(?:nhãn\s*hiệu|thương\s*hiệu|hãng\s*sản\s*xuất|(?:ký\s*)?mã\s*hiệu|\bmodel\b)[^.\n\t]{0,80}?(?:(?:chỉ\s*)?mang\s*tính\s*(?:chất\s*)?tham\s*khảo|để\s*tham\s*khảo|hoặc\s*t[ươu][ơo]ng\s*đ[ươu][ơo]ng|tương\s*đương\s*hoặc\s*tốt\s*hơn)/i;
// The clauses of a chapter that let the bidder offer another make (IB2600592684): "Nhà thầu được phép chào các hàng hóa…
// có nhãn hiệu, xuất xứ khác…", "Bất kỳ thương hiệu, ký mã hiệu, xuất xứ (nếu có) trong tiêu chuẩn kỹ thuật chi tiết là để
// minh họa…". Read over the lines joined (a sentence runs over several lines of a PDF).
const GENERAL_OTHER = [
  /được\s*phép\s*chào[^.]{0,120}?(?:nhãn\s*hiệu|thương\s*hiệu|hãng|ký\s*mã\s*hiệu|mã\s*hiệu|model)[^.]{0,60}?khác/i,
  /(?:nhãn\s*hiệu|thương\s*hiệu|ký\s*mã\s*hiệu|mã\s*hiệu|model)[^.]{0,120}?(?:để|nhằm|mang\s*tính)\s*minh\s*h[ọo]a/i,
];
function generalEquiv(t) {
  for (const m of t.matchAll(new RegExp(GENERAL_EQUIV.source, "gi"))) if (!/\s\d{1,2}\s+\p{Lu}/u.test(m[0])) return m[0];
  const flat = t.replace(/\s+/g, " ");
  for (const re of GENERAL_OTHER) { const m = flat.match(re); if (m) return m[0]; }
  return null;
}
// Mẫu 02B "Phạm vi cung cấp" (tab-separated: STT | Danh mục hàng hóa | ĐVT | Khối lượng | Ký mã hiệu | Nhãn hiệu |
// Hãng sản xuất | Xuất xứ …): the row of the genset.
function scopeTable(t) {
  const lines = t.split("\n"), out = [];
  lines.forEach((h, i) => {
    if (!h.includes("\t") || !/ký\s*mã\s*hiệu|mã\s*hiệu/i.test(h) || !/nhãn\s*hiệu|hãng\s*sản\s*xuất/i.test(h)) return;
    const cols = h.split("\t").map((c) => c.trim()), ci = (re) => cols.findIndex((c) => re.test(c));
    const name = ci(/danh\s*mục|tên\s*hàng/i), model = ci(/mã\s*hiệu/i), brand = ci(/nhãn\s*hiệu/i), maker = ci(/hãng\s*sản\s*xuất/i);
    for (const row of lines.slice(i + 1, i + 30)) {
      const c = row.split("\t");
      if (c.length < Math.max(model, brand, maker) + 1) continue;
      if (name >= 0 && !/máy\s*phát|tổ\s*máy|genset|generator/i.test(c[name] || "")) continue;
      const cell = (k) => (k >= 0 ? String(c[k] || "").trim() : "");
      out.push({ model: cell(model), make: cell(maker) || cell(brand), brand: cell(brand), row });
    }
  });
  return out;
}
// What the HSMT names of the genset: { make, makeRaw, model, models, quoteMake, quoteModel, equivMake, equivModel,
// equivQuote, from } or null. `reqs`: the requirements the agent read (genset_make / genset_model, quote checked against
// the HSMT here); without them (prep) the text is read: Mẫu 02B, then the rows of the genset's section.
export function namedGensetOf(text, { reqs = [] } = {}) {
  const t = String(text ?? "").normalize("NFC");
  if (!t.trim()) return null;
  const T = norm(t), inText = (q) => !!q && T.includes(norm(q));
  const found = { make: [], model: [] };
  const add = (kind, value, quote, equiv) => { if (value && !SERVICE.test(quote || "") && !found[kind].some((x) => x.key === (kind === "make" ? value : modelKey(value)))) found[kind].push({ key: kind === "make" ? value : modelKey(value), value, quote, equiv }); };
  // The words around a quote: its own cell, for "hoặc tương đương".
  const cellOf = (q) => { const at = t.indexOf(q); return at < 0 ? q : `${q} ${cellAt(t, at, q.length)}`; };
  for (const r of reqs || []) {
    if (!["genset_make", "genset_model"].includes(r?.code) || !inText(r.quote)) continue;
    const kind = r.code === "genset_make" ? "make" : "model";
    const v = kind === "make" ? makeOf(r.requirement) || makeOf(r.quote.replace(MAKE_LBL, "")) : null;
    const m = kind === "model" ? modelOf(r.requirement) || modelOf(r.quote.replace(MODEL_LBL, "")) : null;
    // A requirement of the make that also gives the model ("HYUNDAI DHY125KSE hoặc tương đương").
    const both = kind === "make" ? modelOf(r.quote.replace(MAKE_LBL, "")) : null;
    const eq = EQUIV.test(cellOf(r.quote));
    if (v) add("make", v.make, r.quote, eq), (found.makeRaw ||= v.raw);
    if (m) add("model", m, r.quote, eq);
    if (both && v) add("model", both, r.quote, eq);
  }
  if (!found.make.length && !found.model.length) {
    for (const row of scopeTable(t)) {
      // The model cell may list the parts ("Tổ máy phát điện Cummins ; Động cơ: Dongfeng Cummins/ QSZ13G3 ; Đầu phát: …",
      // IB2600592658): only what comes before the first part is the genset's.
      const own = row.model.split(PART_WORD)[0];
      // "Không yêu cầu" under Nhãn hiệu / Hãng sản xuất: the HSMT asks for no make; a make in the item's name is no requirement.
      const noMake = [row.make, row.brand].some((x) => /kh[ôo]ng\s*y[êe]u\s*c[ầa]u/i.test(x || ""));
      const v = noMake ? null : makeOf(row.make) || makeOf(row.brand), m = modelOf(own), eq = EQUIV.test(`${row.model}\t${row.make}\t${row.brand}`);
      if (v) add("make", v.make, (normMake(row.make) === v.make ? row.make : row.brand).trim(), eq), (found.makeRaw ||= v.raw);
      if (m && !noMake && (v || normMake(own))) add("model", m, own.trim(), eq);
    }
    // Rows of the genset's section: "3 Nhà sản xuất Huyndai", "- Model: DHY110K SE", "Hãng sản xuất | Denyo".
    for (const [kind, LBL] of [["make", MAKE_LBL], ["model", MODEL_LBL]]) {
      for (const m of t.matchAll(new RegExp(`(?:^|[\\n\\t|]|\\s\\d{1,2}\\s+|[-+•*]\\s*)(${LBL.source})(?:\\s*(?:tổ\\s*máy|máy\\s*phát(?:\\s*điện)?))?\\s*[:：|\\-]?\\s*`, "giu"))) {
        const at = m.index + m[0].length, cell = cellAt(t, at, 0);
        if (partAt(t, at) !== "genset" || underOtherPart(t, at) || !cell.trim()) continue;
        const quote = `${m[1]}${t.slice(m.index + m[0].indexOf(m[1]) + m[1].length, at)}${cell}`.trim();
        if (kind === "make") { const v = makeOf(cell); if (v) add("make", v.make, quote, EQUIV.test(cell)), (found.makeRaw ||= v.raw); }
        else { const v = modelOf(cell); if (v && (found.make.length || normMake(cell))) add("model", v, quote, EQUIV.test(cell)); }
      }
    }
  }
  if (!found.make.length && !found.model.length) return null;
  // Two makes named for one genset ("MTU/ Caterpillar/ Cummins hoặc tương đương"): a list to choose from, not one maker.
  if (found.make.length > 1) return null;
  // More models than sizes a tender buys (a list of filters, parts): none of them is the genset's.
  if (found.model.length > 4) found.model = [];
  // A model with no make: only one the HSMT gives as the genset's ("Model tổ máy: KP-DS100"), not a code alone ("AS138C").
  if (!found.make.length) found.model = found.model.filter((x) => /tổ\s*máy|máy\s*phát|genset|generator/i.test(x.quote || ""));
  if (!found.make.length && !found.model.length) return null;
  const general = generalEquiv(t), mk = found.make[0], md = found.model;
  return {
    make: mk?.value || (md[0] ? normMake(md[0].quote) : null) || null, makeRaw: found.makeRaw || null,
    model: md.length === 1 ? md[0].value : null, models: md.map((x) => x.value),
    quoteMake: mk?.quote || null, quoteModel: md[0]?.quote || null,
    equivMake: !mk || mk.equiv || !!general, equivModel: !md.length || md.some((x) => x.equiv) || !!general,
    ...(general ? { equivQuote: general } : {}),
  };
}
// The technicalSpecs of the analysis about the genset's make / model (AI-read, each with its quote), as requirements of
// those codes for namedGensetOf: only those whose quote the HSMT has word for word.
export function specsAsReqs(specs = []) {
  const out = [];
  for (const s of specs || []) {
    const item = String(s?.item || "");
    if (!/tổ\s*máy|máy\s*phát|genset/i.test(item) || /động\s*cơ|đầu\s*phát|điều\s*khiển|xuất\s*xứ|nước/i.test(item)) continue;
    const code = MODEL_LBL.test(item) ? "genset_model" : MAKE_LBL.test(item) ? "genset_make" : null;
    if (code && s.quote) out.push({ code, requirement: s.requirement, quote: s.quote });
  }
  return out;
}

// A genset maker of the make (its record's name, brands or id read by normMake; "GRV POWER PRODUCTS, S.L." with brands
// ["HYUNDAI"] is Hyundai): a genset_oem, wherever it is based (the HSMT names its make; the origin is checked apart).
export const makerOf = (r, make) => !!r && !!make && r.role === "genset_oem" && [r.names?.en, ...(r.names?.brands || []), r.id].some((x) => normMake(x) === make);
// The suppliers that sell the named genset: the makers of its make and any supplier whose table names its model. They
// stay among the suppliers whatever the origin rule (groupSuppliers) keeps.
export function namedSuppliers(suppliers, named) {
  if (!named) return [];
  return (suppliers || []).filter((r) => r && r.role !== "distributor" && (makerOf(r, named.make) || (named.models || []).some((m) => (r.specTables || []).some((t) => NG_tableNames(t, m))))).map((r) => r.id);
}
const NG_tableNames = (t, m) => namesModel([t.title, ...(t.header || []), ...(t.rows || [])].join("\n"), m);
// ---------- the configurations ----------
// GENBID_NAMED_SELLER=1 (điều phối 2026-11-12; Khoa has not ruled on it): a seller's page (tier C) may stand for the
// named model when no page of its maker does, the configuration marked unverified with no check above "chưa rõ". Off:
// such a configuration is dropped and the named model shows as "chưa có nguồn thông số".
export const sellerAllowed = () => process.env.GENBID_NAMED_SELLER === "1";
// What of a configuration is the named genset: "model" (its genset row / page names the model), "make" (its genset is of
// the make), or null.
export function namedHit(c, named, { supOf = () => null, srcText = () => null } = {}) {
  if (!named || !c) return null;
  // The genset's model, its row, and the table its catalog row is in (Hyundai's table "DHY110KSE Diesel engine" names the
  // genset in its title only).
  const texts = [c.genset?.model, c.genset?.src?.line, c.genset?.src?.quote, c.engine?.src?.kind === "catalog" ? c.engine.src.line : null,
    srcText(c.genset?.src), srcText(c.engine?.src)].filter(Boolean);
  if ((named.models || []).some((m) => texts.some((x) => namesModel(x, m)))) return "model";
  if (!named.make) return null;
  const rows = [c.genset?.make, c.genset?.src?.line, c.genset?.src?.quote].filter(Boolean);
  if (rows.some((x) => normMake(x) === named.make)) return "make";
  // The genset maker among its suppliers: a supplier whose name is the make and that is no distributor.
  const makers = (c.suppliers || []).map((s) => supOf(s.supplierId)).filter((r) => r && r.role !== "distributor");
  if (makers.some((r) => [r.names?.en, ...(r.names?.brands || []), r.id].some((x) => normMake(x) === named.make))) return "make";
  return null;
}
// An internet source of the named configuration that is a seller's page: tier C as the agent wrote it, or no tier at all.
// With no tier written, a page on a host that carries the make (hyundaipower-de.com for Hyundai) is the brand's; any other is not.
const hostOf = (u) => { try { return new URL(String(u)).hostname.toLowerCase(); } catch { return ""; } };
export const sellerSrc = (c, make = null) => [c.genset?.src, c.engine?.src].some((s) => s?.kind === "internet" && (s.tier ? String(s.tier).toUpperCase() === "C" : !(make && letters(make).length >= 3 && hostOf(s.url).replace(/[^a-z]/g, "").includes(letters(make)))));
// Marks every configuration (c.named / c.equivalent) and writes result.named / result.namedWarn and a clarify item.
// `drop(c, why)` is called for a named configuration resting on a seller's page while that is not allowed.
export function markNamed(result, named, { supOf = () => null, srcText = () => null, problems = [] } = {}) {
  for (const c of result.configs || []) { delete c.named; delete c.equivalent; delete c.unverifiedSource; }
  delete result.named; delete result.namedWarn;
  if (!named) return result;
  const seller = sellerAllowed();
  result.configs = (result.configs || []).filter((c) => {
    const hit = namedHit(c, named, { supOf, srcText });
    if (hit && sellerSrc(c, named.make)) {
      if (!seller) { problems.push(`#${c.rank}: tổ máy HSMT nêu chỉ có nguồn bên bán (chưa xác minh), cờ GENBID_NAMED_SELLER tắt, đã bỏ`); return false; }
      c.unverifiedSource = "seller";
      for (const x of c.checks || []) {
        if (x.status !== "met") continue;
        x.status = "unclear"; x.note = [x.note, "Nguồn bên bán, chưa xác minh với hãng"].filter(Boolean).join(". ");
        for (const p of x.parts || []) if (p.status === "met") p.status = "unclear";
      }
    }
    if (hit) c.named = hit;
    else {
      const sup = c.genset?.src?.supplierId ? supOf(c.genset.src.supplierId) : null;
      const make = c.genset?.make || (sup && sup.role !== "distributor" ? BP()?.familyOf(sup.names?.en, sup.id) : null) || "";
      c.equivalent = { make, model: c.genset?.model || "" };
    }
    return true;
  });
  const found = (result.configs || []).some((c) => (named.models?.length ? c.named === "model" : !!c.named));
  const allowed = named.equivMake && named.equivModel;
  result.named = {
    make: named.make, ...(named.makeRaw ? { makeRaw: named.makeRaw } : {}), model: named.model, models: named.models || [],
    quoteMake: named.quoteMake, quoteModel: named.quoteModel, equivalent: allowed, found,
    ...(named.equivQuote ? { equivQuote: named.equivQuote } : {}),
  };
  const what = [named.makeRaw || named.make, named.model || (named.models || []).join(" / ")].filter(Boolean).join(" ");
  if (!allowed && (result.configs || []).some((c) => c.equivalent)) {
    result.namedWarn = `HSMT nêu đích danh tổ máy ${what} và không ghi "hoặc tương đương" cho ${!named.equivMake && !named.equivModel ? "hãng / model" : !named.equivMake ? "hãng" : "model"}: cấu hình hãng / model khác chỉ dùng được nếu chủ đầu tư chấp nhận hàng tương đương.`;
    const quoteA = named.quoteMake || named.quoteModel, quoteB = named.quoteModel && named.quoteModel !== quoteA ? named.quoteModel : undefined;
    const item = "Hãng sản xuất tổ máy";
    const why = `HSMT nêu đích danh tổ máy ${what} mà không ghi "hoặc tương đương": đề nghị làm rõ có chấp nhận tổ máy hãng / model khác có thông số tương đương không.`;
    const list = (result.clarify || []).filter((x) => !(x.by === "code" && x.named));
    // The agent's own question on the make / model stays; the code's is added only when there is none.
    if (!list.some((x) => /hãng|model|mã hiệu|nhãn hiệu/i.test(`${x.item} ${x.why}`))) list.unshift({ item, quoteA, ...(quoteB ? { quoteB } : {}), why, by: "code", named: true });
    result.clarify = list;
  }
  return result;
}
// The order of a configuration under a named genset: the named model, then the named make, then the equivalents.
export const namedRank = (c) => (c.named === "model" ? 0 : c.named === "make" ? 1 : 2);
