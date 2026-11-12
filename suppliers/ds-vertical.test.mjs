// node --test suppliers/*.test.mjs — Datasheet một model của tổ máy dạng dọc (2026-11-13, IB2600601812: the Voltage and
// Alternator blocks of the named DHY110KSE were "Nguồn chưa ghi", the make of the named genset too). A made-up maker here:
// the rule is for any one-model genset sheet, not for one brand.
import test from "node:test";
import assert from "node:assert/strict";
import { check, gensetSheetOf, sheetFacts, sheetOfConfig, catalogMd, hintsOf, modelFacts } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const ROW = "| DXG100ESX | 100KVA/ 80KW | 110KVA/ 88KW | ZX4B140-G1 | 274Q | COMAP AMF9";
const ENG = "| Engine Model | ZX4B140-G1";
const sup = (tier = "A", vreg = "≤±0.5") => ({
  id: "denyo-test", role: "genset_oem", country: "JP", status: "verified", confidence: "medium",
  names: { en: "Denyo Co., Ltd.", brands: ["DENYO"] },
  sources: [
    { n: 2, url: "https://denyo.example/dxg100esx", tier: "A", quote: ["Denyo Co., Ltd.", "Diesel generator DXG100ESX"] },
    { n: 3, url: "https://denyo.example/other", tier: "A", quote: ["Denyo diesel range"] },
    { n: 5001, url: "https://denyo.example/dxg100esx.pdf", tier },
  ],
  specTables: [
    { n: 5001, title: "DXG100ESX 50Hz", header: ["| Genset Model | Prime Power | Standby Power | Engine Model | Alternator Model | Control System"], rows: [ROW] },
    { n: 5001, title: "DXG100ESX", header: [], rows: ["| Prime Power | KVA / KW | 100 / 80", "| Frequency | Hz | 50"] },
    { n: 5001, title: "DXG100ESX Voltage", header: [], rows: [`| Steady state regulation | % | ${vreg}`, "| Dynamic voltage renewal | % | ≤+20~-15", "| Stable time | Sec | 2.0"] },
    { n: 5001, title: "DXG100ESX Frequency", header: [], rows: ["| Steady state regulation | % | ≤±1"] },
    { n: 5001, title: "DXG100ESX Diesel engine", header: [], rows: [ENG, "| Governor | Electrical", "| Coolling | Water", "| Bore | mm | 108"] },
    { n: 5001, title: "DXG100ESX Alternator", header: [], rows: ["| Alternator Model | 274Q", "| Prime power | kVA | 100", "| Excitation mode | Self-excitation"] },
    { n: 5001, title: "DXG80ESX Alternator", header: [], rows: ["| Prime power | kVA | 80"] },
  ],
  controllers: [{ brand: "ComAp", model: "AMF9", text: "COMAP AMF9", line: "controller COMAP AMF9", src: [5001] }],
});
const HSMT = "Chương V. Yêu cầu kỹ thuật\n1 Loại máy Máy phát điện diesel 100kVA 2 Nước sản xuất Nhật Bản 3 Nhà sản xuất Denyo 4 Mã hiệu DXG100ESX 6 Công suất liên tục ≥ 100 kVA\nIII Thông số kỹ thuật đầu phát điện 9 Công suất liên tục ≥ 100 kVA 12 Dao động điện áp ≤ ± 1% Uđm\n";
const REQS = [
  { code: "genset_make", item: "Hãng sản xuất tổ máy", part: "genset", requirement: "Denyo", quote: "3 Nhà sản xuất Denyo" },
  { code: "genset_model", item: "Model tổ máy", part: "genset", requirement: "DXG100ESX", quote: "4 Mã hiệu DXG100ESX" },
  { code: "alt_power", item: "Công suất đầu phát", part: "alternator", requirement: "≥ 100 kVA liên tục", quote: "9 Công suất liên tục ≥ 100 kVA" },
  { code: "alt_vreg", item: "Ổn định điện áp", part: "alternator", requirement: "≤ ±1% Uđm", quote: "12 Dao động điện áp ≤ ± 1% Uđm" },
];
const result = (checks = {}) => ({
  requirements: structuredClone(REQS),
  configs: [{
    rank: 1, genset: { model: "DXG100ESX", make: "", src: { kind: "catalog", supplierId: "denyo-test", n: 5001, line: ROW } },
    engine: { model: "ZX4B140-G1", make: "", src: { kind: "catalog", supplierId: "denyo-test", n: 5001, line: ENG } },
    alternator: { model: "274Q", make: "", src: { kind: "catalog", supplierId: "denyo-test", n: 5001, line: ROW } },
    suppliers: [{ supplierId: "denyo-test", n: 5001, line: ROW }],
    checks: REQS.map((r) => ({ item: r.item, requirement: r.requirement, hsmtQuote: r.quote, part: r.part, status: "unclear", offered: "Nguồn chưa ghi", sourceQuote: "", ...(checks[r.item] || {}) })),
  }],
});
const run = (s, r = result()) => check(r, { hsmtText: HSMT, suppliers: [s], readWeb: () => null, origin: "all" });
const st = (o, item) => o.result.configs[0].checks.find((x) => x.item === item);

test("datasheet một model: các khối cùng nguồn tier A ghi đúng model, không lấy khối model khác hay bảng có header", () => {
  const sh = gensetSheetOf(sup(), 5001, "DXG100ESX");
  assert.deepEqual(sh.tables.map((t) => t.title), ["DXG100ESX", "DXG100ESX Voltage", "DXG100ESX Frequency", "DXG100ESX Diesel engine", "DXG100ESX Alternator"]);
  // Only the quotes of a tier A page that names the model.
  assert.deepEqual(sh.quotes.map((q) => q.line), ["Denyo Co., Ltd.", "Diesel generator DXG100ESX"]);
  assert.equal(gensetSheetOf(sup("C"), 5001, "DXG100ESX"), null);
  assert.equal(gensetSheetOf(sup(), 5001, "ZX4B140-G1"), null);
  const f = sheetFacts(sh);
  assert.deepEqual(f.filter((x) => x.key === "vreg").map((x) => [x.part, x.value, x.block]), [["alternator", "≤±0.5", "Voltage"]]);
  assert.deepEqual(f.filter((x) => x.key === "altKva").map((x) => [x.part, x.value]), [["alternator", "100"]]);
  // A frequency regulation is not a voltage one; a time is not a voltage.
  assert.ok(!f.some((x) => x.key === "vreg" && /≤±1$/.test(x.value)));
  assert.ok(!f.some((x) => x.key === "voltage"));
  assert.equal(f.find((x) => x.label === "Governor").part, "engine");
  assert.ok(sheetOfConfig(result().configs[0], () => sup()));
});

test("check: ổn định điện áp, công suất đầu phát, hãng tổ máy HSMT nêu đọc từ datasheet một model", () => {
  const o = run(sup());
  const v = st(o, "Ổn định điện áp"), a = st(o, "Công suất đầu phát"), m = st(o, "Hãng sản xuất tổ máy");
  assert.equal(v.status, "met"); assert.equal(v.sourceQuote, "| Steady state regulation | % | ≤±0.5"); assert.equal(v.byCode, true); assert.match(v.note, /khối "Voltage"/);
  assert.equal(a.status, "met"); assert.equal(a.sourceQuote, "| Prime power | kVA | 100");
  assert.equal(m.status, "met"); assert.equal(m.sourceQuote, "Denyo Co., Ltd."); assert.equal(m.sheetSrc.n, 2);
  assert.equal(o.result.configs[0].named, "model");
  // Checked again (a stored result): the code's checks stay met.
  const o2 = run(sup(), o.result);
  for (const it of ["Ổn định điện áp", "Công suất đầu phát", "Hãng sản xuất tổ máy"]) assert.equal(st(o2, it).status, "met", it);
});

test("check: không bịa — số không đạt, nguồn không phải tier A, hãng không phải hồ sơ của hãng", () => {
  assert.equal(st(run(sup("A", "≤±2")), "Ổn định điện áp").status === "met", false);
  const c = run(sup("C"));
  for (const it of ["Ổn định điện áp", "Công suất đầu phát", "Hãng sản xuất tổ máy"]) assert.equal(st(c, it).status, "unclear", it);
  // An assembler (no brand of the make): the make is not read from the model name.
  const s = sup(); s.role = "assembler";
  assert.equal(st(run(s), "Hãng sản xuất tổ máy").status, "unclear");
  // The agent's not_met stays.
  assert.equal(st(run(sup(), result({ "Ổn định điện áp": { status: "not_met", sourceQuote: "| Steady state regulation | % | ≤±0.5", offered: "±0.5%" } })), "Ổn định điện áp").status, "not_met");
});

test("check: câu trích của agent từ khối khác của datasheet được nhận", () => {
  const o = run(sup(), result({ "Công suất đầu phát": { status: "met", offered: "100 kVA (Prime)", sourceQuote: "| Prime power | kVA | 100" } }));
  const a = st(o, "Công suất đầu phát");
  assert.equal(a.status, "met"); assert.ok(!a.byCode); assert.ok(!a.unverified);
  // A line of the other model's block is not this genset's: the agent's check is turned down, then the code reads the
  // genset's own block.
  const o2 = run(sup(), result({ "Công suất đầu phát": { status: "met", offered: "80 kVA", sourceQuote: "| Prime power | kVA | 80" } }));
  assert.ok(o2.problems.some((p) => /Công suất đầu phát: câu trích nguồn/.test(p)));
  const b = st(o2, "Công suất đầu phát");
  assert.equal(b.byCode, true); assert.equal(b.sourceQuote, "| Prime power | kVA | 100");
  // An agent quote of the Voltage block for another point (not decided by the code) is accepted as words of the sheet.
  const k = st(run(sup(), result({ "Model tổ máy": { status: "met", offered: "DXG100ESX", sourceQuote: "| Steady state regulation | % | ≤±0.5" } })), "Model tổ máy");
  assert.ok(!k.unverified);
});

test("catalog.md: các khối của datasheet một model in một lần", () => {
  const s = sup(), cat = C.build([s]), facts = modelFacts(cat, [s]);
  const md = catalogMd(cat, { value: 100, unit: "kVA" }, hintsOf(HSMT), { suppliers: [s], facts, origin: "all" }).md;
  assert.match(md, /datasheet tổ máy DXG100ESX \(nguồn tier A/);
  assert.match(md, /\[DXG100ESX Voltage\] \| Steady state regulation \| % \| ≤±0\.5/);
  assert.equal((md.match(/\[DXG100ESX Alternator\]/g) || []).length, 1);
  assert.ok(!/\[DXG80ESX Alternator\]/.test(md));
});
