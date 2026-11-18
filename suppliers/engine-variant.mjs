// Biến thể cùng động cơ (Đặc thù hãng động cơ, chặng 2, điều 3; Khoa 18/11/2026: "nếu giống nhau về mặt thông số thì
// chọn 1 trong nhiều, nếu khác thì chỉ chọn cái có thông số phù hợp"). Pure functions; config-bot.mjs imports this file,
// so it must never import config-bot.mjs.
//
// variantFamily(model, scope) → the key shared by the variants of one engine, compared like web/catalog.js keyOf.
// Two scopes, because Khoa has still to choose (nghiem-thu dac-thu-dong-co-2.md, mục 5 câu 4):
// - "all": the code before the first "-" or "/" — D1105-E2BG-CHN-1, QSK60-G3 / QSK60-G4, 4006-23TAG2A / 4006-23TAG3A
//   are each one family (a rating suffix too).
// - "version": only suffixes of a version, a market or an emission stage are taken off (BG, E2BG, CHN, EU, a bare
//   number, a power written after "/"); a rating suffix (G3 / G4, TAG2A / TAG3A, K3A…) stays, so QSK60-G3 and QSK60-G4
//   are two engines.
export const SCOPES = ["all", "version"];
// web/catalog.js keyOf: upper case, no space / hyphen / underscore / dot, no footnote mark at the end.
export const keyOf = (m) => String(m ?? "").normalize("NFKC").toUpperCase().replace(/[\s\-_.·]/g, "").replace(/[*†‡]+$/, "");
// A version / market / emission-stage segment (Kubota "-BG", "-E2BG", "-E3BG", "-CHN", "-1"; "-EU"). Not a rating: two
// digits are one (ZCDL-15 / -18 / -21, N4105DS-38 / -46, JE493ZDB-03 / -04 of the catalog), so a bare number is one digit.
const VERSION_SEG = /^(?:E\d{0,2}B?G\d{0,2}|BG\d{0,2}|CHN|EU|E\d{1,2}|\d)$/i;
// A power written into the model cell ("D1105-E2BG-CHN-1/8.4KW", jet-power): never part of the model.
const POWER_TAIL = /\s*\/\s*\d+(?:[.,]\d+)?\s*(?:k\s*w|k\s*va|hp|ps)\b.*$/i;
export function variantFamily(model, scope = "all") {
  if (!SCOPES.includes(scope)) throw new Error(`scope ${scope}: chỉ ${SCOPES.join(" / ")}`);
  const s = String(model ?? "").normalize("NFKC").trim().replace(POWER_TAIL, "");
  if (scope === "all") {
    const base = s.split(/[-/]/)[0].trim();
    // A base of fewer than 3 characters, or with no digit, is no engine code ("C-15", "A-…"): the whole model.
    return base.length >= 3 && /\d/.test(base) ? keyOf(base) : keyOf(s);
  }
  const segs = s.split(/-/);
  while (segs.length > 1 && VERSION_SEG.test(segs[segs.length - 1].trim())) segs.pop();
  return keyOf(segs.join("-"));
}
// Families with two or more of the given models (scope as above): Map family → [model…], in the order given.
export function familiesOf(models, scope = "all") {
  const out = new Map();
  for (const m of models) { const f = variantFamily(m, scope); out.set(f, [...(out.get(f) || []), m]); }
  for (const [f, list] of out) if (new Set(list.map(keyOf)).size < 2) out.delete(f);
  return out;
}
