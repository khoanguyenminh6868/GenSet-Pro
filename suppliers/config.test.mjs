// node --test suppliers/*.test.mjs — the code check of a "Gợi ý cấu hình" answer (config-bot.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { check, catalogRecords, byOrigin, cnSuppliers, fitsCap, findCheck, mergeFind, partsOf } from "./config-bot.mjs";

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

test("at most 6 configurations (Khoa 2026-11-03) and 3 suppliers each are kept", () => {
  const r = base(); r.configs = Array.from({ length: 12 }, (_, i) => ({ ...base().configs[0], rank: i + 1, suppliers: Array(5).fill({ supplierId: "s", n: 101, line: row.line }) }));
  const { result } = check(r, { hsmtText: hsmt, suppliers: sup, readWeb });
  assert.equal(result.configs.length, 6);
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

// Tìm NCC → Cấu hình gợi ý in code (Khoa, 2026-11-02): a supplier found with the engine of a configuration already
// suggested is added under it; one that joins none makes a new configuration, marked fromFind, from its row closest to
// the tender's power, with that supplier alone. A row below the tender's power or of a foreign engine is left out.
test("mergeFind adds a supplier under its configuration, or makes a new one with it alone", () => {
  const head = ["| Model | Standby kVA | Standby kW | Prime kVA | Prime kW | Engine"];
  const w = { id: "w", role: "genset_maker", names: { en: "W" }, specTables: [{ n: 2001, title: "Weichai gensets", header: head,
    rows: ["| W-1 | 312.5 | 250 | 275 | 220 | WP10D264E200", "| W-2 | 250 | 200 | 237.5 | 190 | WP10D238E200", "| W-3 | 330 | 264 | 300 | 240 | WP12D317E200"] }] };
  const v = { id: "v", role: "genset_maker", names: { en: "V" }, specTables: [{ n: 2001, title: "Weichai gensets", header: head,
    rows: ["| V-1 | 330 | 264 | 300 | 240 | WP10D264E200", "| V-2 | 312.5 | 250 | 275 | 220 | WP10D264E200"] }] };
  const result = { origin: "cn", configs: [{ rank: 1, engine: { model: "WP12D317E200" }, suppliers: [{ supplierId: "old" }], checks: [] }] };
  const out = mergeFind(result, [w, v], { cap: { value: 250, unit: "kVA" }, origin: "cn" });
  // w also has a row with the engine of the configuration made for v.
  assert.deepEqual(out.joined, [{ rank: 1, supplierId: "w" }, { rank: 2, supplierId: "w" }]);
  assert.equal(result.configs[0].suppliers[1].line, "| W-3 | 330 | 264 | 300 | 240 | WP12D317E200");
  assert.deepEqual(out.created, [{ rank: 2, engine: "WP10D264E200", supplierId: "v" }]);
  const c = result.configs[1];
  assert.equal(c.fromFind, true);
  assert.equal(c.engine.src.line, "| V-2 | 312.5 | 250 | 275 | 220 | WP10D264E200");
  assert.equal(c.checks[0].status, "unclear");
  assert.deepEqual(c.suppliers.map((s) => s.supplierId), ["v", "w"]);
  // A supplier that fits no configuration already suggested gets one of its own, with it alone.
  const alone = { origin: "cn", configs: [] };
  mergeFind(alone, [v], { cap: { value: 250, unit: "kVA" }, origin: "cn" });
  assert.deepEqual(alone.configs.map((x) => x.suppliers.map((s) => s.supplierId)), [["v"]]);
  // A second run adds nothing twice.
  const again = mergeFind(result, [w, v], { cap: { value: 250, unit: "kVA" }, origin: "cn" });
  assert.deepEqual([again.joined, again.created], [[], []]);
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

// Gói nhiều cỡ máy (Khoa, 2026-11-04): the sizes as the analysis writes them (bidhist, 2026-11-04).
test("sizesOf: several sizes with quantities; prime / standby / kW of one set are one size", async () => {
  const { sizesOf } = await import("./config-bot.mjs");
  const read = (t, name = "") => sizesOf([t, name], name).map((s) => `${s.qty ? s.qty + "x" : ""}${s.cap.value} ${s.cap.unit}`);
  assert.deepEqual(read("3 x 8 kVA (1 pha) và 2 x 40 kVA (3 pha); công suất liên tục ≥ 8,0 kVA và ≥ 40,0 kVA, dự phòng ≥ 8,8 kVA và ≥ 44 kVA"), ["3x8 kVA", "2x40 kVA"]);
  assert.deepEqual(read("1 x 630 kVA (liên tục ≥ 630KVA, dự phòng ≥ 693KVA) + 1 x 800 kVA (liên tục ≥ 800KVA, dự phòng ≥ 880KVA), kèm vỏ chống ồn"), ["1x630 kVA", "1x800 kVA"]);
  assert.deepEqual(read("23 x 150 kVA (định mức ≥ 120 kW/150 kVA, dự phòng ≥ 132 kW/165 kVA); 41 x 100 kVA (định mức ≥ 80 kW/100 kVA, dự phòng ≥ 88 kW/110 kVA)"), ["41x100 kVA", "23x150 kVA"]);
  assert.deepEqual(read("Máy 250 kVA (200 kW) và máy 500 kVA (400 kW), công suất liên tục"), ["250 kVA", "500 kVA"]);
  assert.deepEqual(read("Tổng 97 máy: 27 x 15 kVA, 36 x 30 kVA"), ["27x15 kVA", "36x30 kVA"]);
  // One set: prime and standby, kW of a single-phase set, a maximum, the engine's shaft power, a transformer.
  assert.deepEqual(read("Công suất liên tục (Prime) ≥ 650kVA; công suất dự phòng (Standby) ≥ 700kVA; số lượng 01 tổ máy"), ["650 kVA"]);
  assert.deepEqual(read("12 kVA (định mức ≥ 12 kW / 12 kVA; dự phòng ≥ 13,2 kW/ 13,2 kVA)"), ["12 kVA"]);
  assert.deepEqual(read("2000 kVA dự phòng (công suất tối đa 2250 kVA)"), ["2000 kVA"]);
  assert.deepEqual(read("44 tổ máy phát điện chính (động cơ diesel 91 kW; máy phát 80 kW, 3 pha)"), ["80 kW"]);
  assert.deepEqual(read("", "Cung cấp UPS 10KVA và máy phát điện 5KVA, 3KVA"), ["3 kVA", "5 kVA"]);
  assert.deepEqual(read("2500 kVA dự phòng (Standby) theo quy cách kỹ thuật; tên gói ghi 2000 kVA"), ["2500 kVA"]);
  // Another rating of one set: no quantity, up to 30% below a size with one; or the name's single power.
  assert.deepEqual(read("4 x 4000 kVA (3 pha, 6,3 kV); dự phòng ≥(4000kVA/3200kW), liên tục ≥(3250kVA/2600kW)"), ["4x4000 kVA"]);
  assert.deepEqual(read("400 kVA (công suất tối đa ≥ 400 KVA; công suất tối thiểu ≥ 320 KVA)", "Mua sắm 01 Máy phát điện 400KVA"), ["400 kVA"]);
});

test("Tìm NCC of a tender of several sizes: a line that covers any size fits", () => {
  const rec = { productLines: [{ power: { unit: "kVA", min: 700, max: 900 } }] };
  assert.equal(fitsCap(rec, [{ value: 300, unit: "kVA" }, { value: 800, unit: "kVA" }]), true);
  assert.equal(fitsCap(rec, [{ value: 300, unit: "kVA" }, { value: 100, unit: "kVA" }]), false);
});

test("syncCheck: three makes fail 2 of 3; an OEM set meets it; an assembler cannot", async () => {
  const { syncCheck } = await import("./config-bot.mjs");
  const s = { need: 2, parts: ["engine", "alternator", "controller"], quote: "q" };
  assert.equal(syncCheck(s, { engine: "Yuchai", alternator: "Nianfeng", controller: "SmartGen" }).status, "not_met");
  assert.equal(syncCheck(s, { engine: "Cummins", alternator: "Cummins", controller: "SmartGen" }, [{ name: "Cummins", fam: "Cummins" }]).status, "met");
  assert.equal(syncCheck(s, { engine: "Cummins", alternator: "Cummins", controller: "SmartGen" }, [{ name: "FDK", fam: null }]).status, "not_met");
  assert.equal(syncCheck(s, { engine: "Cummins", alternator: "Cummins", controller: "SmartGen" }).status, "unclear");
  assert.equal(syncCheck(s, { engine: "Yuchai", alternator: null, controller: null }).status, "unclear");
});

test("uncoveredSpecs: analysis lines whose topic no requirement mentions", async () => {
  const { uncoveredSpecs } = await import("./config-bot.mjs");
  const specs = [{ item: "Bộ điều khiển", requirement: "Deepsea DSE7320 MKII" }, { item: "Đồng bộ & prototype test", requirement: "Đồng bộ 02 trong 03 bộ phận chính; chứng nhận prototype tested" },
    { item: "Bảo hành", requirement: "12 tháng" }, { item: "Độ ồn", requirement: "Không nêu trong tài liệu" }, { item: "Dung tích xy lanh", requirement: "≥ 9 L" }];
  const u = uncoveredSpecs(specs, [{ item: "Dung tích xy lanh", requirement: "≥ 9 L" }, { item: "Xuất xứ tổ máy", requirement: "G7" }]);
  assert.equal(u.length, 2);
  assert.match(u[0], /bộ điều khiển\]/); assert.match(u[1], /đồng bộ thương hiệu \/ OEM, prototype/);
});

test("syncCheck: Kohler codes (APM403, KH alternators); a Doosan set of an assembler with nothing else named fails", async () => {
  const { syncCheck } = await import("./config-bot.mjs");
  const BP = globalThis.GenbidBidprice, s = { need: 2, parts: ["engine", "alternator", "controller"], quote: "q" };
  const fam = { engine: BP.familyOf("Doosan"), alternator: BP.familyOf("KH01721T"), controller: BP.familyOf("APM403") };
  assert.deepEqual(fam, { engine: "Doosan", alternator: "Kohler", controller: "Kohler" });
  assert.equal(syncCheck(s, fam, [{ name: "Rehlko", fam: "Kohler" }]).status, "met");
  assert.equal(syncCheck(s, { engine: "Doosan", alternator: null, controller: null }, [{ name: "Xinhengxin", fam: null }]).status, "not_met");
});

test("Tìm Thông Số: partsOf lists the engines, alternators and controllers the catalog reads from a record", () => {
  const rec = { id: "t", role: "genset_oem", status: "partial", names: { en: "Test" }, specTables: [{ n: 2001, title: "Test",
    header: ["| Genset Model | Standby Power | Prime Power | Engine Model | Alternator Model", "| kW/kVa | kW/kVa | Perkins | Stamford"], rows: ["| KP999D5 | 400/500 | 360/450 | 2506C-E15TAG1 | HCI544C"] }],
    controllers: [{ brand: "SmartGen", model: "HGM9320", text: "HGM9320", line: "Controller: SmartGen HGM9320", src: [2001] }] };
  const p = partsOf(rec);
  assert.deepEqual(p.engines.map((e) => [e.model, e.make, e.gensets, e.power]), [["2506C-E15TAG1", "Perkins", ["KP999D5"], "450–500 kVA"]]);
  assert.deepEqual(p.alternators.map((e) => e.model), ["HCI544C"]);
  assert.deepEqual(p.controllers.map((e) => e.model), ["HGM9320"]);
});

test("stdChecks: frequency, phases, power factor and voltage read from the table header (2026-11-06 audit)", () => {
  const sup2 = [{ id: "w", specTables: [{ n: 101, title: "", header: ["| Genset Model | 50HZ PF=0.8 400/230V 3Phase 4Wire | Engine Model | Alternator"], rows: ["| WT400 | 400/320 | 6BTAA5.9-G12 | UCI274E"] }] }];
  const row2 = { kind: "catalog", supplierId: "w", n: 101, line: "| WT400 | 400/320 | 6BTAA5.9-G12 | UCI274E" };
  const r = { requirements: [{ item: "Tần số", requirement: "50 Hz", quote: "Tần số 50Hz", part: "genset" }, { item: "Số pha", requirement: "3 pha", quote: "3 pha", part: "genset" },
      { item: "Hệ số công suất", requirement: "0,8", quote: "cosφ = 0,8", part: "genset" }, { item: "Điện áp định mức", requirement: "400/230 V", quote: "400/230V", part: "genset" }],
    configs: [{ rank: 1, engine: { model: "6BTAA5.9-G12", src: row2 }, alternator: { model: "UCI274E", src: row2 }, genset: { model: "WT400", src: row2 },
      checks: [{ item: "Tần số", hsmtQuote: "Tần số 50Hz", offered: "", sourceQuote: "", part: "genset", status: "unclear" }] }] };
  const { result } = check(r, { hsmtText: "Tần số 50Hz\n3 pha\ncosφ = 0,8\n380/220V\n400/230V", suppliers: sup2, readWeb });
  const st = Object.fromEntries(result.configs[0].checks.map((x) => [x.item, x.status]));
  // "Điện áp định mức" takes its code's name (reqcodes.mjs: voltage → "Điện áp").
  assert.deepEqual(st, { "Tần số": "met", "Số pha": "met", "Hệ số công suất": "met", "Điện áp": "met" });
  // 380/220 V is not what the header says: no check is written for it (left to the agent).
  const r2 = { requirements: [{ item: "Điện áp", requirement: "380/220 V", quote: "380/220V", part: "genset" }], configs: [{ rank: 1, engine: { model: "6BTAA5.9-G12", src: row2 }, alternator: { model: "UCI274E", src: row2 }, genset: { model: "WT400", src: row2 }, checks: [] }] };
  assert.equal(check(r2, { hsmtText: "380/220V", suppliers: sup2, readWeb }).result.configs[0].checks.length, 0);
  assert.ok(result.configs[0].checks.every((x) => x.byCode && /50HZ PF=0.8/.test(x.sourceQuote)));
});

test("rankConfigs: rows of one engine + alternator merge their suppliers; at most 3 rows per engine (2026-11-06)", async () => {
  const { rankConfigs } = await import("./config-bot.mjs");
  const cfg = (alt, sid, ctl) => ({ engine: { model: "6BTAA5.9-G12" }, alternator: { model: alt }, controller: ctl ? { model: ctl } : null, checks: [], suppliers: [{ supplierId: sid, n: 101, line: "x" }] });
  const r = rankConfigs({ requirements: [], configs: [cfg("UCI274E", "a"), cfg("UCI274E", "b", "DSE6120"), cfg("UCI274F", "c"), cfg("UCI274G", "d"), cfg("UCI274H", "e")] });
  assert.deepEqual(r.configs.map((c) => c.alternator.model), ["UCI274E", "UCI274F", "UCI274G"]);
  assert.deepEqual(r.configs[0].suppliers.map((s) => s.supplierId), ["a", "b"]);
  assert.equal(r.configs[0].controller.model, "DSE6120");
});

test("fuelChecks: the HSMT's L/h limit at a load against the row's figure at that load (2026-11-09)", async () => {
  const { engineMins } = await import("./config-bot.mjs");
  const sup3 = [{ id: "f", specTables: [{ n: 101, title: "", header: ["| Model | Prime kVA | Engine | Fuel 75% load | Fuel Consumption", "| | | | L/h | L/h"], rows: ["| X450 | 450 | 2506C-E15TAG1 | 60 | 80 |"] }] }];
  const row3 = { kind: "catalog", supplierId: "f", n: 101, line: "| X450 | 450 | 2506C-E15TAG1 | 60 | 80 |" };
  const hs = "Tiêu hao nhiên liệu ở 75% tải ≤ 65 lít/giờ\nTiêu hao nhiên liệu 100% tải ≤ 75 lít/giờ\nTiêu hao nhiên liệu 50% tải ≤ 40 lít/giờ";
  const r = { requirements: [{ item: "Tiêu hao nhiên liệu 75% tải", requirement: "≤ 65 lít/giờ", quote: "Tiêu hao nhiên liệu ở 75% tải ≤ 65 lít/giờ", part: "genset" },
      { item: "Tiêu hao nhiên liệu 100% tải", requirement: "≤ 75 lít/giờ", quote: "Tiêu hao nhiên liệu 100% tải ≤ 75 lít/giờ", part: "genset" }, { item: "Tiêu hao nhiên liệu 50% tải", requirement: "≤ 40 lít/giờ", quote: "Tiêu hao nhiên liệu 50% tải ≤ 40 lít/giờ", part: "genset" }],
    configs: [{ rank: 1, engine: { model: "2506C-E15TAG1", src: row3 }, genset: { model: "X450", src: row3 }, checks: [{ item: "Tiêu hao nhiên liệu 100% tải", offered: "", sourceQuote: "", part: "genset", status: "unclear" }] }] };
  const { result } = check(r, { hsmtText: hs, suppliers: sup3, readWeb });
  const st = Object.fromEntries(result.configs[0].checks.map((x) => [x.item, x.status]));
  // 60 ≤ 65 at 75 %: met; 80 > 75 at 100 %: not met; no 50 % figure in the row: nothing written.
  assert.deepEqual(st, { "Tiêu hao nhiên liệu 75% tải": "met", "Tiêu hao nhiên liệu 100% tải": "not_met" });
  assert.ok(result.configs[0].checks.every((x) => x.byCode));
  const mins = engineMins(hs);
  assert.deepEqual([mins.maxFuel, mins.maxFuel75, mins.maxFuel50], [75, 65, 40]);
});

test("fuelChecks: a column of two loads gives the figure at the load asked (2026-11-09)", async () => {
  const { fuelAt } = await import("./config-bot.mjs");
  assert.equal(fuelAt({ label: "Fuel L/h @75% / @100%", value: "188.4 / 251.2" }, 75), 188.4);
  assert.equal(fuelAt({ label: "Fuel L/h @75% / @100%", value: "188.4 / 251.2" }, 100), 251.2);
  assert.equal(fuelAt({ label: "Fuel L/h @75% / @100%", value: "188.4 / 251.2" }, 50), null);
  assert.equal(fuelAt({ label: "Fuel Consumption (L/h)", value: "34" }, 100), 34);
  const sup4 = [{ id: "g", specTables: [{ n: 101, title: "", header: ["| Model | Prime kVA | Engine | Fuel L/h @75% / @100%"], rows: ["| X450 | 450 | 2506C-E15TAG1 | 60 / 80 |"] }] }];
  const row4 = { kind: "catalog", supplierId: "g", n: 101, line: "| X450 | 450 | 2506C-E15TAG1 | 60 / 80 |" };
  const r = { requirements: [{ item: "Tiêu hao nhiên liệu 75% tải", requirement: "≤ 65 lít/giờ", quote: "Tiêu hao 75% tải ≤ 65 lít/giờ", part: "genset" }],
    configs: [{ rank: 1, engine: { model: "2506C-E15TAG1", src: row4 }, genset: { model: "X450", src: row4 }, checks: [] }] };
  const { result } = check(r, { hsmtText: "Tiêu hao 75% tải ≤ 65 lít/giờ", suppliers: sup4, readWeb });
  assert.deepEqual(result.configs[0].checks.map((x) => [x.item, x.status]), [["Tiêu hao nhiên liệu 75% tải", "met"]]);
});
