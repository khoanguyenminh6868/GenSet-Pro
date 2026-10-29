// node --test suppliers/*.test.mjs — the code check of a "Gợi ý cấu hình" answer (config-bot.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import { check, catalogRecords } from "./config-bot.mjs";

const sup = [{ id: "s", specTables: [{ n: 101, title: "Perkins gensets", header: ["| Model | Standby kW/kVA | Prime kW/kVA | Engine | Alternator"], rows: ["| SQP500 | 400/500 | 360/450 | 2506C-E15TAG1 | HCI544C | UK"] }] }];
const hsmt = "Chương V. Yêu cầu kỹ thuật\nCông suất liên tục (Prime): ≥ 450 kVA\nĐầu phát: Stamford hoặc tương đương\nTần số 50Hz";
const row = { kind: "catalog", supplierId: "s", n: 101, line: "| SQP500 | 400/500 | 360/450 | 2506C-E15TAG1 | HCI544C | UK" };
const base = () => ({
  requirements: [{ item: "Công suất", requirement: "≥ 450 kVA prime", quote: "Công suất liên tục (Prime): ≥ 450 kVA" }],
  configs: [{ rank: 1, engine: { model: "2506C-E15TAG1", src: row }, alternator: { model: "HCI544C", src: row }, genset: { model: "SQP500", src: row },
    checks: [{ item: "Công suất", hsmtQuote: "Công suất liên tục (Prime): ≥ 450 kVA", offered: "450 kVA prime", sourceQuote: "360/450", part: "genset", status: "met" }] }],
});
const readWeb = (f) => (f === "web/1.txt" ? "URL: https://maker.example/a\nAccessed: 2026-10-28\n\nAlternator UCI274C 50Hz class H insulation" : null);

test("a configuration copied from a catalog row passes", () => {
  const { problems, result } = check(base(), { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.deepEqual(problems, []);
  assert.equal(result.configs[0].checks[0].status, "met");
});

test("a number not in the source quote makes 'met' unclear", () => {
  const r = base(); r.configs[0].checks[0].offered = "500 kVA prime";
  const { result } = check(r, { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.equal(result.configs[0].checks[0].status, "unclear");
  assert.ok(result.configs[0].checks[0].unverified);
});

test("an invented catalog row or HSMT quote is flagged", () => {
  const r = base(); r.configs[0].engine.src = { ...row, line: "| SQP500 | 400/500 | 360/450 | KTA19-G3 | HCI544C | UK" };
  r.requirements[0].quote = "Công suất ≥ 500 kVA";
  const { problems, result } = check(r, { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.ok(result.configs[0].engine.unverified);
  assert.ok(result.requirements[0].unverified);
  assert.ok(problems.length >= 2);
});

test("internet source: the quote must be in the saved page", () => {
  const r = base();
  r.configs[0].alternator = { model: "UCI274C", src: { kind: "internet", url: "https://maker.example/a", file: "web/1.txt", quote: "class H insulation" } };
  r.configs[0].checks.push({ item: "Cách điện", hsmtQuote: "Tần số 50Hz", offered: "class F", sourceQuote: "class F insulation", part: "alternator", status: "met" });
  const { result } = check(r, { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.ok(!result.configs[0].alternator.unverified);
  assert.equal(result.configs[0].checks[1].status, "unclear");
});

test("no configuration gives the 'not found' message", () => {
  const { result } = check({ requirements: [], configs: [] }, { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.match(result.message, /Không có động cơ và đầu phát/);
});

const hsmt2 = hsmt + "\nDòng điện định mức ≥ 600A tại điện áp định mức 380V, hệ số công suất Cosφ = 0,8 trễ\nTiêu hao nhiên liệu ≤ 90 L/h";
const conv = (inputs, formula, value) => ({ formula, inputs, value });
test("a recomputed conversion with quoted inputs counts as met", () => {
  const r = base();
  r.configs[0].checks.push({ item: "Dòng điện", hsmtQuote: "Dòng điện định mức ≥ 600A tại điện áp định mức 380V", offered: "450 kVA × 1000 / (√3 × 380 V) = 683,7 A", sourceQuote: "360/450", part: "genset", status: "met",
    conversions: [conv([{ name: "S_kVA", value: 450, from: "source" }, { name: "U_V", value: 380, from: "hsmt" }], "current_3ph", 683.7)] });
  const { problems, result } = check(r, { hsmtText: hsmt2, suppliers: sup, readWeb });
  assert.deepEqual(problems, []);
  assert.equal(result.configs[0].checks[1].status, "met");
  assert.equal(result.configs[0].checks[1].conversions[0].unit, "A");
});

test("a wrong result, an invented input or an unknown formula is not met", () => {
  for (const [cv, offered] of [
    [conv([{ name: "S_kVA", value: 450, from: "source" }, { name: "U_V", value: 380, from: "hsmt" }], "current_3ph", 720), "720 A"],
    [conv([{ name: "S_kVA", value: 500, from: "source" }, { name: "U_V", value: 380, from: "hsmt" }], "current_3ph", 759.7), "759,7 A"],
    [conv([{ name: "P_kW", value: 360, from: "source" }, { name: "pf", value: 0.8, from: "standard" }], "kva_from_kw", 450), "450 kVA"],
    [conv([{ name: "x", value: 450, from: "source" }], "magic", 700), "700 A"],
  ]) {
    const r = base();
    r.configs[0].checks.push({ item: "Dòng điện", hsmtQuote: "Dòng điện định mức ≥ 600A tại điện áp định mức 380V", offered, sourceQuote: "360/450", part: "genset", status: "met", conversions: [cv] });
    const { result } = check(r, { hsmtText: hsmt2, suppliers: sup, readWeb });
    assert.equal(result.configs[0].checks[1].status, "unclear", cv.formula + " " + offered);
  }
});

test("fuel from g/kWh uses the EN 590 density range, filled in by the code", () => {
  const s2 = [{ id: "s", specTables: [{ n: 101, title: "Perkins gensets", header: ["| Model | Prime kW | Engine | Fuel g/kWh"], rows: ["| SQP500 | 360 | 2506C-E15TAG1 | 205"] }] }];
  const line = "| SQP500 | 360 | 2506C-E15TAG1 | 205", src = { kind: "catalog", supplierId: "s", n: 101, line };
  const r = { requirements: [], configs: [{ rank: 1, engine: { model: "2506C-E15TAG1", src }, genset: { model: "SQP500", src }, checks: [{ item: "Nhiên liệu", hsmtQuote: "Tiêu hao nhiên liệu ≤ 90 L/h", offered: "205 × 360 / 820–845 = 87,3–90 L/h", sourceQuote: "360 | 2506C-E15TAG1 | 205", part: "genset", status: "met",
    conversions: [conv([{ name: "b_gkWh", value: 205, from: "source" }, { name: "P_kW", value: 360, from: "source" }, { name: "rho_gL", value: 1, from: "standard" }], "lph_from_gkwh")] }] }] };
  const { problems, result } = check(r, { hsmtText: hsmt2, suppliers: s2, readWeb });
  assert.deepEqual(problems, []);
  const v = result.configs[0].checks[0].conversions[0].value;
  assert.ok(Math.abs(v[0] - 87.34) < 0.01 && Math.abs(v[1] - 90) < 0.01);
});

test("suppliers: unknown ids are dropped, a row must be the supplier's own and name the engine", () => {
  const r = base();
  r.configs[0].suppliers = [{ supplierId: "s", n: 101, line: row.line, why: "" }, { supplierId: "nobody", n: 1, line: "x" }, { supplierId: "s", n: 101, line: "| SQP600 | KTA19 |" }];
  const { result, problems } = check(r, { hsmtText: hsmt, suppliers: sup, readWeb });
  const s = result.configs[0].suppliers;
  assert.equal(s.length, 2);
  assert.ok(!s[0].unverified && s[0].hasAlternator);
  assert.ok(s[1].unverified);
  assert.equal(problems.length, 2);
});

test("at most 10 configurations and 3 suppliers each are kept", () => {
  const r = base(); r.configs = Array.from({ length: 12 }, (_, i) => ({ ...base().configs[0], rank: i + 1, suppliers: Array(5).fill({ supplierId: "s", n: 101, line: row.line }) }));
  const { result } = check(r, { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.equal(result.configs.length, 10);
  assert.equal(result.configs[0].suppliers.length, 3);
});

test("internet finds become supplier records with renumbered, saved sources", () => {
  const page = "URL: https://maker.example/g400\nAccessed: 2026-10-29\n\n| Model | Prime kVA | Engine | Alternator\n| MX400 | 400 | 2206C-E13TAG2 | HCI444ES";
  const entry = { id: "maker-x", country: "GB", role: "genset_oem", names: { en: "Maker X" }, website: "https://maker.example/", confidence: "medium", status: "verified",
    sources: [{ n: 1, file: "web/1.txt", tier: "A", quote: ["| MX400 | 400 | 2206C-E13TAG2 | HCI444ES"] }],
    productLines: [{ kind: "genset", series: "MX", fuel: "diesel", power: { min: 400, max: 400, unit: "kVA", rating: "prime", src: [1] }, src: [1] }],
    specTables: [{ n: 1, title: "MX", header: ["| Model | Prime kVA | Engine | Alternator"], rows: ["| MX400 | 400 | 2206C-E13TAG2 | HCI444ES"] }] };
  const old = { id: "s", sources: [{ n: 2003, file: "sources/s/2003.md" }], specTables: [], productLines: [] };
  const [a, b, c] = catalogRecords([entry, { ...entry, id: "s" }, { ...entry, id: "bad", sources: [{ n: 1, file: "web/9.txt" }] }],
    { existing: new Map([["s", old]]), readWeb: (f) => (f === "web/1.txt" ? page : null), today: "2026-10-29" });
  assert.equal(a.rec.status, "partial");
  assert.equal(a.rec.sources[0].n, 2001);
  assert.equal(a.rec.sources[0].url, "https://maker.example/g400");
  assert.equal(a.rec.sources[0].file, "sources/maker-x/2001.md");
  assert.deepEqual(a.rec.productLines[0].power.src, [2001]);
  assert.equal(a.rec.specTables[0].n, 2001);
  assert.equal(a.files["sources/maker-x/2001.md"], page);
  assert.equal(b.rec.sources.length, 2);
  assert.equal(b.rec.sources[1].n, 2004);
  assert.ok(!b.isNew);
  assert.match(c.error, /không có trang đã lưu/);
});
