// node --test suppliers/*.test.mjs — the code check of a "Gợi ý cấu hình" answer (config-bot.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { check, catalogRecords, byOrigin, cnSuppliers, fitsCap, findCheck, mergeFind } from "./config-bot.mjs";

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

test("Xuất xứ Trung Quốc drops a foreign engine, Khác keeps only foreign ones", () => {
  // 2506C-E15TAG1 is a Perkins code and the table title names Perkins.
  const cn = check(base(), { hsmtText: hsmt, suppliers: sup, readWeb, origin: "cn" });
  assert.equal(cn.result.configs.length, 0);
  assert.equal(cn.result.origin, "cn");
  assert.ok(cn.problems.some((p) => p.includes("không phải hãng Trung Quốc")));
  assert.equal(check(base(), { hsmtText: hsmt, suppliers: sup, readWeb, origin: "other" }).result.configs.length, 1);
  assert.equal(check(base(), { hsmtText: hsmt, suppliers: sup, readWeb, origin: "all" }).result.configs.length, 1);
  // Perkins is British: kept under G7 and G20.
  assert.equal(check(base(), { hsmtText: hsmt, suppliers: sup, readWeb, origin: "g7" }).result.configs.length, 1);
  assert.equal(check(base(), { hsmtText: hsmt, suppliers: sup, readWeb, origin: "g20" }).result.configs.length, 1);
});

test("engines are split by origin from their make or model code", () => {
  const C = globalThis.GenbidCatalog, eng = (model, ...names) => ({ model, makes: names.map((name) => ({ name, via: "dòng bảng" })) });
  const list = [eng("WP13D440E310", "Weichai"), eng("6BTA5.9-G2"), eng("TAD1641GE", "Volvo Penta"), eng("YC6MK420L-D20"), eng("4TNV98T", "Yanmar"), eng("16M33G4N2/6")];
  assert.deepEqual(byOrigin(list, "cn").map((e) => e.model), ["WP13D440E310", "YC6MK420L-D20"]);
  assert.deepEqual(byOrigin(list, "other").map((e) => e.model), ["6BTA5.9-G2", "TAD1641GE", "4TNV98T", "16M33G4N2/6"]);
  assert.equal(C.originIn("Kubota V3300", "V3300"), "other");
  assert.equal(C.originIn("Yuchai", "YC4D"), "cn");
});

test("Xuất xứ Trung Quốc drops an engine whose source gives no make", () => {
  const s2 = [{ id: "s", specTables: [{ n: 101, title: "Gensets", header: ["| Model | Prime kW/kVA | Engine | Alternator"], rows: ["| GF450 | 360/450 | XJ420-D20 | HCI544C"] }] }];
  const row2 = { kind: "catalog", supplierId: "s", n: 101, line: "| GF450 | 360/450 | XJ420-D20 | HCI544C" };
  const mk = () => { const r = base(); Object.assign(r.configs[0], { engine: { model: "XJ420-D20", make: "Xinjie", src: row2 }, alternator: { model: "HCI544C", src: row2 }, genset: { model: "GF450", src: row2 } }); return r; };
  const r = mk();
  const { result, problems } = check(r, { hsmtText: hsmt, suppliers: s2, readWeb, origin: "cn" });
  assert.equal(result.configs.length, 0);
  assert.ok(problems.some((p) => p.includes("nguồn không ghi hãng")));
  const s3 = [{ ...s2[0], specTables: [{ ...s2[0].specTables[0], title: "Yuchai gensets" }] }];
  assert.equal(check(mk(), { hsmtText: hsmt, suppliers: s3, readWeb, origin: "cn" }).result.configs.length, 1);
});

test("well-known Chinese model codes count as a stated make, foreign codes win", () => {
  const C = globalThis.GenbidCatalog;
  for (const m of ["YC6MK420L-D20", "WP10D158E3OONG", "12V190ZL", "SC9D355D2", "YD4105-D60", "FAW CA6DM2-39D", "6135ACaf", "186FA", "KHKTA50T1"]) assert.equal(C.originIn("", m), "cn", m);
  for (const m of ["BF6M1015C-G2A", "S16R-PTA3-C", "4TNV88-GGECC", "B5.9CS4-GT1", "QSNT-G4", "TBD620V12-2A", "4016TAG2"]) assert.equal(C.originIn("", m), "other", m);
  assert.equal(C.originIn("", "ZCDL-K500"), null);
});

test("Tìm NCC: a find counts only when it passes verify.mjs and a product line covers the tender's power", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "find-test-"));
  fs.mkdirSync(path.join(dir, "web"));
  fs.writeFileSync(path.join(dir, "web", "1.txt"), "URL: https://maker.example/g400\nAccessed: 2026-10-31\n\n| Model | Prime kVA | Engine | Alternator\n| MX400 | 400 | WP13D385E200 | HCI444ES");
  const entry = { id: "maker-x", country: "CN", role: "genset_oem", names: { en: "Maker X" }, website: "https://maker.example/", confidence: "medium",
    sources: [{ n: 1, file: "web/1.txt", tier: "A", quote: ["| MX400 | 400 | WP13D385E200 | HCI444ES"] }],
    productLines: [{ kind: "genset", series: "MX", fuel: "diesel", power: { min: 400, max: 400, unit: "kVA", rating: "prime", src: [1] }, src: [1] }] };
  fs.writeFileSync(path.join(dir, "newCatalog.json"), JSON.stringify([entry, { ...entry, id: "maker-y", sources: [{ ...entry.sources[0], quote: ["an invented sentence"] }] }]));
  try {
    const [x, y] = await findCheck(dir, [], { value: 400, unit: "kVA" });
    assert.deepEqual(x.errors, []);
    assert.ok(x.fits);
    assert.ok(y.errors.some((e) => e.includes("không tìm thấy câu trích")));
    assert.ok(!fitsCap(entry, { value: 1000, unit: "kVA" }));
    assert.ok(!fitsCap(entry, { value: 400, unit: "kW" }));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

// Tìm NCC → Cấu hình gợi ý in code (Khoa, 2026-11-01): the new supplier's rows join a configuration with the same
// engine, or make a new one marked fromFind; a row below the tender's power or of a foreign engine is left out.
test("mergeFind adds a supplier's rows to the suggested configurations", () => {
  const rec = { id: "w", role: "genset_maker", names: { en: "W" }, specTables: [{ n: 2001, title: "Weichai gensets", header: ["| Model | Standby kVA | Standby kW | Prime kVA | Prime kW | Engine"],
    rows: ["| W-1 | 312.5 | 250 | 275 | 220 | WP10D264E200", "| W-2 | 250 | 200 | 237.5 | 190 | WP10D238E200", "| W-3 | 330 | 264 | 300 | 240 | WP12D317E200"] }] };
  const result = { origin: "cn", configs: [{ rank: 1, engine: { model: "WP12D317E200" }, suppliers: [{ supplierId: "old" }], checks: [] }] };
  const out = mergeFind(result, [rec], { cap: { value: 250, unit: "kVA" }, origin: "cn" });
  assert.deepEqual(out.joined, [{ rank: 1, supplierId: "w" }]);
  assert.deepEqual(out.created.map((c) => c.engine), ["WP10D264E200"]);
  const c = result.configs[1];
  assert.equal(c.fromFind, true);
  assert.equal(c.engine.src.line, "| W-1 | 312.5 | 250 | 275 | 220 | WP10D264E200");
  assert.equal(c.checks[0].status, "unclear");
  assert.equal(result.configs[0].suppliers[1].line, "| W-3 | 330 | 264 | 300 | 240 | WP12D317E200");
  // A second run adds nothing twice.
  assert.deepEqual(mergeFind(result, [rec], { cap: { value: 250, unit: "kVA" }, origin: "cn" }).joined, []);
});
test("G7 / G20 origin keeps engines whose make is from a country of the group", () => {
  const C = globalThis.GenbidCatalog;
  const list = [{ model: "WP13D440E310", makes: [{ name: "Weichai" }] }, { model: "6BTA5.9-G2", makes: [] }, { model: "TAD1641GE", makes: [{ name: "Volvo Penta" }] },
    { model: "DP158LC", makes: [{ name: "Doosan" }] }, { model: "ZCDL-K500", makes: [] }];
  assert.deepEqual(byOrigin(list, "g7").map((e) => e.model), ["6BTA5.9-G2"]);
  assert.deepEqual(byOrigin(list, "g20").map((e) => e.model), ["6BTA5.9-G2", "DP158LC"]);
  assert.equal(C.groupIn("Weichai", "WP13D440E310", "g20"), false);
  assert.equal(C.groupIn("Perkins", "1106A-70TG1", "g7"), true);
  assert.equal(C.groupIn("Volvo Penta", "TAD1641GE", "g20"), false);
  for (const n of C.FOREIGN_ENGINE) assert.ok(C.ENGINE_COUNTRY[n], n);
});

test("Xuất xứ Trung Quốc keeps a foreign engine that a supplier based in China offers (Khoa, 2026-11-02)", () => {
  const cnSup = [{ ...sup[0], country: "CN" }, { id: "uk", country: "GB", specTables: sup[0].specTables }];
  const r = base(); r.configs[0].suppliers = [{ supplierId: "s", n: 101, line: row.line }, { supplierId: "uk", n: 101, line: row.line }];
  const { result } = check(r, { hsmtText: hsmt, suppliers: cnSup, readWeb, origin: "cn" });
  assert.equal(result.configs.length, 1);
  assert.deepEqual(result.configs[0].suppliers.map((s) => s.supplierId), ["s"]);
  // The same engine offered only by a supplier outside China is still dropped.
  const r2 = base(); r2.configs[0].suppliers = [{ supplierId: "uk", n: 101, line: row.line }];
  assert.equal(check(r2, { hsmtText: hsmt, suppliers: cnSup, readWeb, origin: "cn" }).result.configs.length, 0);
  // Catalog: a Perkins engine used by a Chinese supplier is listed under "cn".
  const list = [{ model: "2506C-E15TAG1", makes: [{ name: "Perkins" }], uses: [{ supplierId: "s" }] }, { model: "TAD1641GE", makes: [{ name: "Volvo Penta" }], uses: [{ supplierId: "uk" }] }];
  assert.deepEqual(byOrigin(list, "cn", cnSuppliers(cnSup)).map((e) => e.model), ["2506C-E15TAG1"]);
});
