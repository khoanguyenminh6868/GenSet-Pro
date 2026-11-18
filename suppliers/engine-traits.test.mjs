// node --test suppliers/engine-traits.test.mjs — engine-traits.json: terms / technologies that belong to one engine maker
// (E-TVCS = Kubota). Each entry's quote has to be in a page saved by trait-source.mjs (suppliers/sources/engine-traits/<n>.md).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
// One block of 100 source numbers per make (trait-source.mjs <n> <url>).
export const MAKE_BLOCK = {
  kubota: 100, yanmar: 200, perkins: 300, cummins: 400, mitsubishi: 500, isuzu: 600, caterpillar: 700, kohler: 800,
  "volvo-penta": 900, mtu: 1000, baudouin: 1100, "john-deere": 1200, fpt: 1300, "doosan-hyundai": 1400, deutz: 1500,
  weichai: 1600, yuchai: 1700, sdec: 1800,
};
export const KINDS = ["buồng đốt", "phun", "điều khiển điện tử", "tên dòng", "khác"];
const squash = (s) => String(s).replace(/[\s ]+/g, " ").trim().toLowerCase();
// part: which component the term belongs to ("" = not sure, never used to filter). Khoa 18/11/2026: only part "engine" tells the engine maker.
export const PARTS = ["engine", "controller", "alternator", ""];
const KEYS = ["make", "term", "aliases", "kind", "part", "exclusive", "src", "quote", "note"];

export function load() { return JSON.parse(fs.readFileSync(path.join(DIR, "engine-traits.json"), "utf8")); }
export function page(n) {
  const f = path.join(DIR, "sources", "engine-traits", `${n}.md`);
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
}
// Errors of one entry ([] = fine); `read(n)` gives the saved page text or null.
export function checkTrait(t, read = page) {
  const e = [];
  for (const k of Object.keys(t)) if (!KEYS.includes(k)) e.push(`khoá lạ ${k}`);
  if (!(t.make in MAKE_BLOCK)) e.push(`make ${t.make} không có trong MAKE_BLOCK`);
  if (!t.term || typeof t.term !== "string") e.push("thiếu term");
  if (!Array.isArray(t.aliases)) e.push("aliases phải là mảng");
  if (!KINDS.includes(t.kind)) e.push(`kind ${t.kind}`);
  if (typeof t.exclusive !== "boolean") e.push("exclusive phải là true/false");
  if (!PARTS.includes(t.part)) e.push(`part ${t.part}`);
  if (t.kind === "tên dòng" && t.exclusive) e.push("tên dòng máy không là đặc thù (Khoa 18/11/2026): exclusive phải false");
  if (t.part && t.part !== "engine" && t.exclusive && t.kind === "buồng đốt") e.push("buồng đốt phải thuộc part engine");
  if (!Array.isArray(t.src) || !t.src.length) e.push("cần src");
  if (!Array.isArray(t.quote) || !t.quote.length) e.push("cần quote");
  if (e.length) return e;
  const base = MAKE_BLOCK[t.make];
  const pages = [];
  for (const n of t.src) {
    if (!(n > base && n < base + 100)) e.push(`src ${n} ngoài khối ${base} của ${t.make}`);
    const p = read(n);
    if (p == null) e.push(`src ${n}: chưa lưu trang`);
    else {
      if (!/^URL: https?:\/\/\S+\nAccessed: \d{4}-\d{2}-\d{2}\n/.test(p)) e.push(`src ${n}: thiếu dòng URL / Accessed`);
      pages.push(squash(p));
    }
  }
  for (const q of t.quote) {
    if (!pages.some((p) => p.includes(squash(q)))) e.push(`không tìm thấy câu trích: ${String(q).slice(0, 70)}`);
  }
  return e;
}

const good = { make: "kubota", term: "E-TVCS", aliases: ["TVCS"], kind: "buồng đốt", part: "engine", exclusive: true, src: [101], quote: ["Three Vortex Combustion System"], note: "x" };
const fake = (n) => (n === 101 ? "URL: https://www.kubota.com/x\nAccessed: 2026-11-18\n\nKubota's E-TVCS (Three  Vortex\nCombustion System) is ..." : null);

test("an entry whose quote is in the saved page passes (spacing, line breaks and case ignored)", () => {
  assert.deepEqual(checkTrait(good, fake), []);
});
test("a quote that is not in the page, a missing page, a source outside the make's block fail", () => {
  assert.ok(checkTrait({ ...good, quote: ["Kubota invented IDI"] }, fake).some((x) => /không tìm thấy câu trích/.test(x)));
  assert.ok(checkTrait({ ...good, src: [102] }, fake).some((x) => /chưa lưu trang/.test(x)));
  assert.ok(checkTrait({ ...good, src: [201] }, fake).some((x) => /ngoài khối/.test(x)));
});
test("keys, kind, exclusive and make are checked", () => {
  assert.ok(checkTrait({ ...good, why: 1 }, fake).some((x) => /khoá lạ/.test(x)));
  assert.ok(checkTrait({ ...good, kind: "khác ra" }, fake).some((x) => /kind/.test(x)));
  assert.ok(checkTrait({ ...good, exclusive: "yes" }, fake).some((x) => /exclusive/.test(x)));
  assert.ok(checkTrait({ ...good, make: "nobody" }, fake).some((x) => /MAKE_BLOCK/.test(x)));
});
test("part and tên dòng rules (Khoa 18/11/2026)", () => {
  assert.ok(checkTrait({ ...good, part: "motor" }, fake).some((x) => /part/.test(x)));
  assert.ok(checkTrait({ ...good, kind: "tên dòng" }, fake).some((x) => /tên dòng máy không là đặc thù/.test(x)));
  assert.deepEqual(checkTrait({ ...good, kind: "tên dòng", exclusive: false }, fake), []);
  const j = load();
  assert.ok(!j.traits.some((t) => t.kind === "tên dòng" && t.exclusive));
  for (const term of ["PowerCommand", "AmpSentry", "EMCP", "ADEM", "KODIA", "EVC 2.0"]) {
    const t = j.traits.find((x) => x.term === term);
    assert.equal(t && t.part, "controller", term);
  }
  // the engine filter chặng 2 uses: exclusive + part engine; E-TVCS is in it, controller words are not
  const eng = j.traits.filter((t) => t.exclusive && t.part === "engine");
  assert.ok(eng.some((t) => t.make === "kubota" && t.term === "E-TVCS"));
  assert.ok(!eng.some((t) => /PowerCommand|EMCP|AmpSentry|ADEM/.test(t.term)));
  assert.ok(!/cần Khoa xác nhận/i.test(JSON.stringify(j)), "SDEC / Yuchai: Khoa đã nhận 18/11/2026");
});
test("engine-traits.json: every entry passes, make + term are unique, E-TVCS belongs to Kubota only", () => {
  const j = load();
  const seen = new Set();
  for (const t of j.traits) {
    assert.deepEqual(checkTrait(t), [], `${t.make} / ${t.term}`);
    const key = `${t.make}|${squash(t.term)}`;
    assert.ok(!seen.has(key), `trùng ${key}`);
    seen.add(key);
  }
  const et = j.traits.filter((t) => /e-?tvcs/i.test(t.term));
  assert.equal(et.length, 1);
  assert.equal(et[0].make, "kubota");
  assert.equal(et[0].exclusive, true);
});
test("unconfirmed terms say why, and a term is not both confirmed and unconfirmed for the same make", () => {
  const j = load();
  const conf = new Set(j.traits.map((t) => `${t.make}|${squash(t.term)}`));
  for (const u of j.unconfirmed) {
    assert.ok(u.make in MAKE_BLOCK, u.make);
    assert.ok(u.term && u.why && u.why.trim(), `${u.make} / ${u.term}`);
    assert.ok(!conf.has(`${u.make}|${squash(u.term)}`), `${u.make} / ${u.term} vừa xác nhận vừa chưa`);
  }
});
