// node --test suppliers/manufacturing.test.mjs — where a maker's alternators / controllers are made (manufacturing[]):
// verify.mjs finds each quote in the saved page, a Khoa default says "Khoa chốt", nothing else gets through.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkRecord } from "./verify.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const rec = (m, extra = {}) => ({
  id: "x", country: "GB", role: "controller_maker", status: "partial", names: { en: "X" }, productLines: [], confidence: "low", checkedAt: "2026-11-17",
  sources: [{ n: 6001, url: "https://www.deepseaelectronics.com/about", accessedAt: "2026-11-17", tier: "A", quote: ["We manufacture our products in one place, the United Kingdom."], file: "sources/deep-sea-electronics/6001.md" }],
  manufacturing: m, ...extra,
});
const errs = (r) => checkRecord(r).errors.filter((e) => /manufactur/.test(e));
const good = { country: "GB", city: "Hunmanby", scope: "manufacture", products: "All products", src: [6001], quote: ["We manufacture our products in one place, the United Kingdom."] };

test("a sourced entry whose quote is in the saved page passes (line breaks and spacing ignored)", () => {
  assert.deepEqual(errs(rec([good])), []);
  assert.deepEqual(errs(rec([{ ...good, quote: ["We  manufacture our products\nin one place, the United Kingdom."] }])), []);
});
test("a quote that is not in the saved page fails", () => {
  assert.ok(errs(rec([{ ...good, quote: ["We manufacture everything in Wuxi, China."] }])).some((e) => /không tìm thấy câu trích/.test(e)));
});
test("an entry needs a source or a Khoa decision; products need a source", () => {
  assert.ok(errs(rec([{ country: "CZ", scope: "manufacture" }])).some((e) => /cần src \+ quote, hoặc khoa/.test(e)));
  assert.deepEqual(errs(rec([{ country: "CZ", scope: "manufacture", khoa: "Khoa chốt 16/11/2026" }])), []);
  assert.ok(errs(rec([{ country: "CZ", scope: "manufacture", khoa: "Khoa chốt 16/11/2026", products: "X" }])).some((e) => /products chỉ ghi được khi nguồn nói/.test(e)));
});
test("the Khoa mark has to read 'Khoa chốt dd/mm/yyyy'", () => {
  assert.ok(errs(rec([{ country: "CZ", scope: "manufacture", khoa: "mặc định" }])).some((e) => /Khoa chốt dd\/mm\/yyyy/.test(e)));
});
test("country, scope, src and unknown keys are checked", () => {
  assert.ok(errs(rec([{ ...good, country: "Anh" }])).some((e) => /country mã 2 chữ/.test(e)));
  assert.ok(errs(rec([{ ...good, scope: "assembly" }])).some((e) => /scope/.test(e)));
  assert.ok(errs(rec([{ ...good, src: [999] }])).some((e) => /src 999 không có/.test(e)));
  assert.ok(errs(rec([{ ...good, why: "x" }])).some((e) => /khoá why/.test(e)));
  assert.ok(errs(rec({ country: "GB" })).some((e) => /phải là mảng/.test(e)));
});
test("a record with no manufacturing field is untouched; manufacturingNote may not be empty", () => {
  const r = rec(undefined); delete r.manufacturing;
  assert.deepEqual(errs(r), []);
  assert.ok(errs(rec([good], { manufacturingNote: "  " })).some((e) => /manufacturingNote/.test(e)));
});
test("schema.json declares manufacturing with the same keys verify.mjs accepts", () => {
  const sch = JSON.parse(fs.readFileSync(path.join(DIR, "schema.json"), "utf8"));
  assert.deepEqual(Object.keys(sch.properties.manufacturing.items.properties).sort(), ["city", "country", "khoa", "note", "products", "quote", "scope", "src"]);
  assert.ok(sch.properties.manufacturingNote);
});
test("every manufacturing[] entry of the real records passes, and each has a place or a Khoa mark", () => {
  const seen = [];
  for (const f of fs.readdirSync(path.join(DIR, "cn")).filter((x) => x.endsWith(".json"))) {
    const r = JSON.parse(fs.readFileSync(path.join(DIR, "cn", f), "utf8"));
    if (!r.manufacturing) continue;
    seen.push(r.id);
    assert.deepEqual(errs(r), [], f);
  }
  for (const id of ["stamford-avk-china", "leroy-somer-fuzhou", "mecc-alte", "deep-sea-electronics", "comap", "sices"]) assert.ok(seen.includes(id), id);
});
