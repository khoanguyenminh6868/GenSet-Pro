// Đặc thù hãng động cơ, chặng 2 (Khoa 18/11/2026): what engine-traits.json says about an HSMT. Pure functions, no I/O
// but load(); config-bot.mjs imports this file, so it must never import config-bot.mjs (node exits 13, the lock sticks).
//
// Two groups of terms, by Khoa's decisions of 18/11/2026:
// - engine filter (rule 1): exclusive, part "engine", not a line name ("tên dòng"), not marked `filter: false` (Holset,
//   Lombardini, KOHLER Flex). Found in the HSMT's engine requirements → only that engine make is suggested and the
//   ceiling of configurations per make is lifted for it.
// - controller (rule 5): exclusive, part "controller" (PowerCommand, AmpSentry, ADEM, EMCP, KODIA, EVC 2.0). Found in
//   the HSMT → only that controller is proposed; the engine make is NOT filtered.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
export function load(file = path.join(DIR, "engine-traits.json")) { return JSON.parse(fs.readFileSync(file, "utf8")); }

// The engine make of engine-traits.json (its slug) as web/catalog.js names it (ENGINE_BRANDS), for hints.engineMakes.
export const MAKE_NAME = {
  kubota: "Kubota", yanmar: "Yanmar", perkins: "Perkins", cummins: "Cummins", mitsubishi: "Mitsubishi", isuzu: "Isuzu",
  caterpillar: "Caterpillar", kohler: "Kohler", "volvo-penta": "Volvo Penta", mtu: "MTU", baudouin: "Baudouin",
  "john-deere": "John Deere", fpt: "FPT", "doosan-hyundai": "Doosan", deutz: "Deutz", weichai: "Weichai", yuchai: "Yuchai", sdec: "SDEC",
};

export const filtersEngine = (t) => t.exclusive === true && t.part === "engine" && t.kind !== "tên dòng" && t.filter !== false;
export const isControllerTrait = (t) => t.exclusive === true && t.part === "controller";

// The words a term is written with in an HSMT: the term (without a parenthesised gloss: "ECW (điện tử điều khiển van xả
// tăng áp)" → "ECW") and its aliases. A gloss in Vietnamese of a term (the term itself has no Latin acronym) is dropped.
// Aliases that are true of the make but mean other things in an HSMT, so never matched (scan of 1.548 HSMT, 18/11/2026):
// "PCC" (PowerCommand Control) was "Point of Common Coupling", "Particular Conditions of Contract", "QĐ-PCC" of an
// investor, a drawing label, and never PowerCommand.
export const NOT_MATCHED = new Set(["PCC"]);
export function wordsOf(t) {
  const out = new Set();
  for (const w of [t.term, ...(t.aliases || [])]) {
    const s = String(w || "").replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
    if (s.length >= 3 && !NOT_MATCHED.has(s)) out.add(s);
  }
  return [...out];
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// One regex per word. Letters / digits around it end the match (JS \b does not see Vietnamese letters as letters). A
// hyphen or space in the word matches a hyphen, a space or nothing ("E-TVCS", "E TVCS", "ETVCS"). A short acronym (2–5
// capitals, digits) is matched case-sensitively: "HPI", "DCR", "PCC", "LDW" in lower case are other words.
export function regexOf(word) {
  const body = word.split(/[\s-]+/).map(esc).join("[\\s-]?");
  const acro = /^[A-Z0-9][A-Z0-9 .-]{1,6}$/.test(word) && word.replace(/[^A-Z]/g, "").length <= 5;
  return new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, acro ? "gu" : "giu");
}

// The part of the genset a line of the HSMT is about. A heading (short line with a part word after "yêu cầu / thông số /
// đối với / cho", or a bare part word after a numbering mark) sets the part for the lines after it; OCR text breaks the
// Vietnamese words ("Yê cầ đối với động cơ", IB2500189935), so the part words are matched loosely and a label of the row
// itself (buồng đốt, kiểu phun…) wins over the heading.
const HEAD = /^\s*(?:(?:[IVX]{1,4}|[A-H]|\d{1,2}(?:\.\d{1,2})*)[.):]?\s+|[*+•-]\s*)?(?:[^\n]{0,40}?(?<![\p{L}])(?:đối\s*v[ớo]i|cho|về|của|y[êe]u\s*c[ầa]u|th[ôo]ng\s*s[ốo])\s+)?(?:các\s+)?(động\s*c[ơo]|engine|đầu\s*phát|alternator|(?:bộ|bảng|hệ\s*thống|tủ|màn\s*hình)\s*(?:điều\s*khiển|đk)|controller|control\s*panel|vỏ|tổ\s*máy|máy\s*phát\s*điện|genset)(?![\p{L}])[^:\d\n]{0,40}:?\s*$/iu;
const PART_WORD = (w) => (/động|engine/i.test(w) ? "engine" : /đầu|alternator/i.test(w) ? "alternator" : /điều|đk|control/i.test(w) ? "controller" : "genset");
const ENGINE_LABEL = /bu[ồo]ng\s*đ[ốo]t|ki[ểe]u\s*phun|phun\s*(nhi[êe]n|tr[ựu]c|gi[áa]n)|h[ệe]\s*th[ốo]ng\s*(nhi[êe]n\s*li[ệe]u|phun)|combustion|injection|fuel\s*system|turbo|t[ăa]ng\s*[áa]p|đi[ềe]u\s*t[ốo]c|governor|lo[ạa]i\s*đ[ộo]ng\s*c[ơo]|ki[ểe]u\s*đ[ộo]ng\s*c[ơo]/i;
const CTRL_LABEL = /(?:b[ộo]|b[ảa]ng|h[ệe]\s*th[ốo]ng|t[ủu]|m[àa]n\s*h[ìi]nh)\s*(?:đi[ềe]u\s*khi[ểe]n|đk)|controller|control\s*(?:panel|module)/i;
export function partOfLines(text) {
  const L = String(text || "").normalize("NFC").split("\n"), out = [];
  let part = "genset";
  for (let i = 0; i < L.length; i++) {
    const l = L[i];
    const h = l.length <= 90 && l.match(HEAD);
    if (h) part = PART_WORD(h[1]);
    out.push(part);
  }
  return out;
}
// The part one hit is about: the label of its row (this line and the two around it, a table cell wraps) first, else the
// section heading above it.
function partAt(L, parts, i) {
  const near = [L[i - 2], L[i - 1], L[i], L[i + 1], L[i + 2]].filter((x) => x != null).join(" ");
  const own = L[i];
  if (CTRL_LABEL.test(own)) return "controller";
  if (ENGINE_LABEL.test(own)) return "engine";
  if (parts[i] === "genset" || parts[i] === "alternator") {
    if (ENGINE_LABEL.test(near) && !CTRL_LABEL.test(near)) return "engine";
    if (CTRL_LABEL.test(near) && !ENGINE_LABEL.test(near)) return "controller";
  }
  return parts[i];
}
// "E-TVCS hoặc tương đương": the HSMT allows another make's equivalent (open question for Khoa: today such a hit is
// reported with `equivalent: true` and does not filter, see filterOf).
const EQUIV = /t[ưu][ơo]ng\s*đ[ưu][ơo]ng|equivalent|ho[ặa]c\s*t[ốo]t\s*h[ơo]n/i;

// Every hit of a term of the two groups in an HSMT text: { make, makeName, term, word, line (as written), lineNo,
// at: the part the line is about, group: "engine" | "controller", equivalent }.
export function traitsIn(text, traits = load().traits) {
  const L = String(text || "").normalize("NFC").split("\n"), parts = partOfLines(text), hits = [];
  const list = traits.filter((t) => filtersEngine(t) || isControllerTrait(t)).map((t) => ({ t, res: wordsOf(t).map((w) => [w, regexOf(w)]) }));
  for (let i = 0; i < L.length; i++) {
    for (const { t, res } of list) {
      const m = res.find(([, re]) => { re.lastIndex = 0; return re.test(L[i]); });
      if (!m) continue;
      const at = partAt(L, parts, i);
      hits.push({ make: t.make, makeName: MAKE_NAME[t.make] || t.make, term: t.term, word: m[0], line: L[i].trim(), lineNo: i + 1, at,
        group: filtersEngine(t) ? "engine" : "controller", equivalent: EQUIV.test([L[i - 1], L[i], L[i + 1]].filter((x) => x != null).join(" ")) });
    }
  }
  return hits;
}

// What candidates / the prompt / check do with the hits (rules 1 and 5):
// - engineMake: the one engine make whose engine term is in the HSMT's engine requirements (at "engine"), no
//   "tương đương" next to it. Two makes: null, `engineConflict` lists them (the HSMT contradicts itself: not filtered).
// - controllers: the controller terms found anywhere (rule 5: the controller's own block or another), one per term.
export function filterOf(text, traits = load().traits) {
  const hits = traitsIn(text, traits);
  const eng = hits.filter((h) => h.group === "engine" && h.at === "engine" && !h.equivalent);
  const makes = [...new Set(eng.map((h) => h.makeName))];
  const ctl = [];
  for (const h of hits.filter((x) => x.group === "controller")) if (!ctl.some((c) => c.term === h.term)) ctl.push({ term: h.term, makeName: h.makeName, line: h.line });
  return {
    engineMake: makes.length === 1 ? makes[0] : null,
    engineTerms: eng.filter((h) => makes.length === 1).map((h) => ({ term: h.term, line: h.line })),
    ...(makes.length > 1 ? { engineConflict: makes } : {}),
    controllers: ctl,
    // Engine terms seen but not used (outside the engine requirements, or "tương đương"): for the audit / the note.
    unused: hits.filter((h) => h.group === "engine" && !eng.includes(h)).map((h) => ({ term: h.term, makeName: h.makeName, at: h.at, equivalent: h.equivalent, line: h.line })),
  };
}
