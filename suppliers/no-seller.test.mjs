// node --test suppliers/*.test.mjs — a seller's page (tier C, not the make's own domain) is no source of the catalog
// (Khoa, 2026-11-12): catalogRecords leaves it out with the reason, and what rests on it alone with it.
import test from "node:test";
import assert from "node:assert/strict";
import { catalogRecords, sellerPage } from "./config-bot.mjs";

const TODAY = "2026-11-12";
const pages = {
  "web/1.txt": "URL: https://tech-expo.ru/P158LE_1.pdf\nAccessed: 2026-11-12\n\nP158LE fuel 75% 40 L/h",
  "web/2.txt": "URL: https://www.hd-ce.com/en/engines/p158le\nAccessed: 2026-11-12\n\nP158LE displacement 14.6 L",
  "web/3.txt": "URL: https://www.made-in-china.com/p/x\nAccessed: 2026-11-12\n\nZZ Power 100-500kVA",
};
const readWeb = (f) => pages[f];
const doosan = { id: "hd-hyundai-infracore", role: "engine_maker", country: "KR", website: "https://www.hd-ce.com/", names: { en: "Doosan" }, sources: [{ n: 1, url: "https://www.hd-ce.com/", tier: "A" }] };
const entry = (extra = {}) => ({ id: "hd-hyundai-infracore", sources: [{ n: 1, file: "web/1.txt", tier: "C", quote: ["P158LE"] }, { n: 2, file: "web/2.txt", tier: "A", quote: ["P158LE"] }],
  specTables: [{ n: 1, title: "P158LE seller", rows: ["| Fuel 75% | 40 L/h |"] }, { n: 2, title: "P158LE", rows: ["| Displacement | 14.6 L |"] }], ...extra });
const run = (entries, o = {}) => catalogRecords(entries, { existing: new Map([["hd-hyundai-infracore", doosan]]), readWeb, today: TODAY, ...o });

test("sellerPage: tier C and not official only", () => {
  assert.equal(sellerPage({ tier: "C", official: false }), true);
  assert.equal(sellerPage({ tier: "C", official: true }), false);
  assert.equal(sellerPage({ tier: "A", official: false }), false);
  assert.equal(sellerPage({ tier: "B", official: false }), false);
});

test("a seller's page and the table that rests on it are left out, the maker's page stays; the reason is in the result", () => {
  const [x] = run([entry()]);
  assert.equal(x.error, undefined);
  assert.deepEqual(x.rec.sources.filter((s) => s.n > 2000).map((s) => s.url), ["https://www.hd-ce.com/en/engines/p158le"]);
  assert.equal(x.rec.sources.at(-1).n, 2001);
  assert.deepEqual(x.rec.specTables.map((t) => [t.n, t.title]), [[2001, "P158LE"]]);
  assert.equal(x.droppedParts, 1);
  assert.equal(x.skippedSources.length, 1);
  assert.match(x.skippedSources[0].why, /tier C/);
  assert.equal(x.skippedSources[0].url, "https://tech-expo.ru/P158LE_1.pdf");
  assert.equal([...x.files.keys?.() ?? Object.keys(x.files)].length, 1);
});

test("every source a seller's: nothing added, the entry is an error saying why", () => {
  const [x] = run([entry({ sources: [{ n: 1, file: "web/1.txt", tier: "C", quote: ["P158LE"] }], specTables: [{ n: 1, title: "t", rows: ["| a | 1 |"] }] })]);
  assert.match(x.error, /không đưa vào danh mục/);
  assert.equal(x.skippedSources.length, 1);
  assert.equal(x.rec, undefined);
});

test("a new supplier with only a marketplace page is not added; a line resting on a kept page stays, one on the seller's goes", () => {
  const [n] = run([{ id: "zz-power", country: "CN", role: "genset_oem", website: "https://zz.example/", names: { en: "ZZ" }, confidence: "low", sources: [{ n: 1, file: "web/3.txt", tier: "C", quote: ["ZZ Power"] }],
    productLines: [{ kind: "genset", power: { min: 100, max: 500, unit: "kVA", src: [1] }, src: [1] }] }]);
  assert.match(n.error, /tier C/);
  const [m] = run([entry({ productLines: [{ kind: "genset", series: "a", src: [1] }, { kind: "genset", series: "b", src: [2] }, { kind: "genset", series: "c", src: [1, 2] }] })]);
  assert.deepEqual(m.rec.productLines.map((p) => [p.series, p.src]), [["b", [2001]], ["c", [2001]]]);
});

test("a tier A page of anyone and the maker's own page declared tier C are no seller's; keepSeller keeps them all", () => {
  const e = entry({ sources: [{ n: 1, file: "web/1.txt", tier: "A", quote: ["P158LE"] }, { n: 2, file: "web/2.txt", tier: "C", quote: ["P158LE"] }] });
  const [x] = run([e]);
  assert.deepEqual(x.rec.sources.filter((s) => s.n > 2000).map((s) => s.url), ["https://tech-expo.ru/P158LE_1.pdf", "https://www.hd-ce.com/en/engines/p158le"]);
  assert.equal(x.skippedSources, undefined);
  const [k] = run([entry()], { keepSeller: true });
  assert.equal(k.rec.sources.filter((s) => s.n > 2000).length, 2);
  assert.equal(k.skippedSources, undefined);
});
